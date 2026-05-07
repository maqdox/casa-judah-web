import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Ensure the amenity exists to satisfy the foreign key constraint
    let amenity = await prisma.amenity.findUnique({
      where: { id: data.amenityId }
    });

    if (!amenity) {
      amenity = await prisma.amenity.create({
        data: {
          id: data.amenityId,
          title_es: 'Café entre Ovejas',
          title_en: 'Coffee with Sheep',
          desc_es: 'Una tarde para detener el tiempo, entre lana suave y café recién hecho.',
          desc_en: 'An afternoon to pause time, surrounded by soft wool and fresh coffee.',
          imageUrl: '/granja2.jpg',
          price: 450,
          isActive: true
        }
      });
    }

    // Prepare notes from extra details
    const notes = `Adultos: ${data.adults}, Niños: ${data.children}, Bebida: ${data.drinks}`;

    // Create the reservation
    const reservation = await prisma.amenityReservation.create({
      data: {
        amenityId: amenity.id,
        guestName: data.name,
        guestPhone: data.phone,
        guestEmail: data.email || '',
        date: new Date(data.date),
        timeSlot: data.timeSlot,
        guests: data.adults + data.children,
        totalPrice: data.totalPrice,
        status: 'PENDING',
        notes: notes
      }
    });

    return NextResponse.json({ success: true, reservation });
  } catch (error) {
    console.error('Error creating experience reservation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
