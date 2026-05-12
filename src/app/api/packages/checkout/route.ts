import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { execTrans } from '@/lib/pagadito';

const PACKAGE_CONFIGS: Record<string, { title_es: string; title_en: string; desc_es: string; desc_en: string; imageUrl: string; price: number; maxCapacity: number }> = {
  'cafe-entre-ovejas': {
    title_es: 'Café entre Ovejas',
    title_en: 'Coffee with Sheep',
    desc_es: 'Una tarde para detener el tiempo, entre lana suave y café recién hecho.',
    desc_en: 'An afternoon to pause time, surrounded by soft wool and fresh coffee.',
    imageUrl: '/cafe_ovejas_new.jpeg',
    price: 450,
    maxCapacity: 10,
  },
  'noche-de-fogata': {
    title_es: 'Noche de Fogata',
    title_en: 'Bonfire Night',
    desc_es: 'Una noche mágica bajo las estrellas con fogata, malvaviscos y bebidas calientes.',
    desc_en: 'A magical night under the stars with bonfire, marshmallows and hot beverages.',
    imageUrl: '/fogata.jpeg',
    price: 650,
    maxCapacity: 20,
  },
  // TEST — Remove after Pagadito testing
  'test-pagadito': {
    title_es: 'Test de Pago',
    title_en: 'Payment Test',
    desc_es: 'Paquete de prueba',
    desc_en: 'Test package',
    imageUrl: '/fogata.jpeg',
    price: 26,
    maxCapacity: 1,
  },
};

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const config = PACKAGE_CONFIGS[data.amenityId];
    if (!config) {
      return NextResponse.json({ error: 'Paquete no encontrado' }, { status: 400 });
    }

    // Validate capacity
    const totalGuests = (data.adults || data.guests || 0) + (data.children || 0);
    if (totalGuests > config.maxCapacity) {
      return NextResponse.json({ error: `Capacidad máxima: ${config.maxCapacity} personas` }, { status: 400 });
    }

    // Check availability
    const targetDate = new Date(data.date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const whereClause: any = {
      amenityId: data.amenityId,
      date: { gte: startOfDay, lte: endOfDay },
      status: { not: 'CANCELLED' },
    };
    if (data.timeSlot) whereClause.timeSlot = data.timeSlot;

    const existingReservation = await prisma.amenityReservation.findFirst({ where: whereClause });
    if (existingReservation) {
      return NextResponse.json({ error: 'Esta fecha ya está reservada para este paquete' }, { status: 409 });
    }

    // Ensure amenity exists
    let amenity = await prisma.amenity.findUnique({ where: { id: data.amenityId } });
    if (!amenity) {
      amenity = await prisma.amenity.create({
        data: {
          id: data.amenityId,
          title_es: config.title_es,
          title_en: config.title_en,
          desc_es: config.desc_es,
          desc_en: config.desc_en,
          imageUrl: config.imageUrl,
          price: config.price,
          isActive: true
        }
      });
    }

    const notes = data.notes || `Adultos: ${data.adults}, Niños: ${data.children || 0}`;

    // Create reservation as PENDING
    const reservation = await prisma.amenityReservation.create({
      data: {
        amenityId: amenity.id,
        guestName: data.name,
        guestPhone: data.phone,
        guestEmail: data.email || '',
        date: new Date(data.date),
        timeSlot: data.timeSlot || 'evening',
        guests: totalGuests,
        totalPrice: data.totalPrice,
        status: 'PENDING',
        notes
      }
    });

    // Call Pagadito
    const ern = `pkg-${reservation.id}`;
    const redirectUrl = await execTrans(ern, [
      {
        quantity: 1,
        description: `${data.packageTitle || config.title_es} - ${totalGuests} personas`,
        priceInHNL: data.totalPrice
      }
    ]);

    return NextResponse.json({ redirectUrl, reservationId: reservation.id });
  } catch (err: any) {
    console.error('Package checkout error:', err);
    return NextResponse.json({ error: err.message || 'Error al procesar el pago.' }, { status: 500 });
  }
}
