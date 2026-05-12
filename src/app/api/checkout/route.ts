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

    // Determine payment amount
    let paymentAmount = totalPrice;
    if (paymentMethod === 'partial_card') paymentAmount = totalPrice / 2;

    // Create guest + reservation + payment in a transaction
    const reservation = await prisma.$transaction(async (tx) => {
      let guest = await tx.guest.findUnique({ where: { email } });
      if (!guest) {
        guest = await tx.guest.create({ data: { name, email, phone } });
      }

      const res = await tx.reservation.create({
        data: {
          guestId: guest.id,
          roomId: room.id,
          checkInDate,
          checkOutDate,
          rulesAccepted: true,
          totalPrice,
          status: 'PENDING'
        }
      });

      await tx.payment.create({
        data: {
          reservationId: res.id,
          amount: paymentAmount,
          paymentMethod,
          status: 'PENDING'
        }
      });

      return res;
    });

    // Call Pagadito to get the payment URL
    const ern = reservation.id;
    const redirectUrl = await execTrans(ern, [
      {
        quantity: days,
        description: `${room.contentName} (${days} noches)`,
        priceInHNL: room.basePrice * 1.15 // price per night including tax
      }
    ]);

    return NextResponse.json({ redirectUrl, reservationId: reservation.id });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message || 'Error al procesar el pago.' }, { status: 500 });
  }
}
