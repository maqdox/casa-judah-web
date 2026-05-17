import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { execTrans } from '@/lib/pagadito';

const PACKAGE_CONFIGS: Record<string, { title_es: string; title_en: string; desc_es: string; desc_en: string; imageUrl: string; price: number; maxCapacity: number }> = {
  'cafe-entre-ovejas': {
    title_es: 'Café entre Ovejas',
    title_en: 'Coffee with Sheep',
    desc_es: 'Una tarde para detener el tiempo, entre lana suave y café recién hecho.',
    desc_en: 'An afternoon to pause time, surrounded by soft wool and fresh coffee.',
    imageUrl: '/CafeOvejas.jpeg',
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
    price: 26.62,
    maxCapacity: 1,
  },
  'paquete-cumpleanos': {
    title_es: 'Paquete Cumpleaños Edición Infantil',
    title_en: 'Kids Birthday Package',
    desc_es: 'Celebra un cumpleaños inolvidable en medio de la naturaleza.',
    desc_en: 'Celebrate an unforgettable birthday surrounded by nature.',
    imageUrl: '/cumpleanos-infantil.png',
    price: 3800,
    maxCapacity: 50,
  },
};

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const config = PACKAGE_CONFIGS[data.amenityId];
    if (!config) {
      return NextResponse.json({ error: 'Paquete no encontrado' }, { status: 400 });
    }

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

    // Encode package booking data in ERN — NO reservation created yet
    const bookingData = {
      type: 'package',
      amenityId: data.amenityId,
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      date: data.date,
      timeSlot: data.timeSlot || 'evening',
      guests: totalGuests,
      totalPrice: data.totalPrice,
      notes: data.notes || '',
      packageTitle: data.packageTitle || config.title_es,
    };
    const ern = 'pkg-' + Buffer.from(JSON.stringify(bookingData)).toString('base64url');

    // Call Pagadito
    const redirectUrl = await execTrans(ern, [
      {
        quantity: 1,
        description: `${bookingData.packageTitle} - ${totalGuests} personas`,
        priceInHNL: data.totalPrice
      }
    ]);

    return NextResponse.json({ redirectUrl });
  } catch (err: any) {
    console.error('Package checkout error:', err);
    return NextResponse.json({ error: err.message || 'Error al procesar el pago.' }, { status: 500 });
  }
}
