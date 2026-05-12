import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { execTrans } from '@/lib/pagadito';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, checkIn, checkOut, name, email, phone, paymentMethod } = body;

    if (!roomId || !checkIn || !checkOut || !name || !email) {
      return NextResponse.json({ error: 'Faltan campos requeridos.' }, { status: 400 });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Validate dates
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (checkInDate < now) {
      return NextResponse.json({ error: 'La fecha de llegada no puede ser anterior a hoy.' }, { status: 400 });
    }
    if (checkOutDate <= checkInDate) {
      return NextResponse.json({ error: 'La fecha de salida debe ser posterior a la de llegada.' }, { status: 400 });
    }

    // Check availability
    const overlapping = await prisma.reservation.findFirst({
      where: {
        roomId,
        status: { not: 'CANCELLED' },
        OR: [{ checkInDate: { lte: checkOutDate }, checkOutDate: { gte: checkInDate } }]
      }
    });

    if (overlapping) {
      return NextResponse.json({ error: 'La habitación ya está reservada en esas fechas.' }, { status: 409 });
    }

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return NextResponse.json({ error: 'Habitación no encontrada.' }, { status: 404 });
    }

    const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) {
      return NextResponse.json({ error: 'Fechas inválidas.' }, { status: 400 });
    }

    const subtotal = days * room.basePrice;
    const tax = subtotal * 0.15;
    const totalPrice = subtotal + tax;

    let paymentAmount = totalPrice;
    if (paymentMethod === 'partial_card') paymentAmount = totalPrice / 2;

    // Encode booking data in ERN so callback can create the reservation after payment
    const bookingData = {
      roomId, checkIn, checkOut, name, email, phone, paymentMethod,
      totalPrice, paymentAmount, days
    };
    const ern = Buffer.from(JSON.stringify(bookingData)).toString('base64url');

    // Call Pagadito to get the payment URL (NO reservation created yet)
    const redirectUrl = await execTrans(ern, [
      {
        quantity: days,
        description: `${room.contentName} (${days} noches)`,
        priceInHNL: room.basePrice * 1.15
      }
    ]);

    return NextResponse.json({ redirectUrl });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message || 'Error al procesar el pago.' }, { status: 500 });
  }
}
