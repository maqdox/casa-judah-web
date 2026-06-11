import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { execTrans } from '@/lib/pagadito';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomIds, checkIn, checkOut, name, email, phone, paymentMethod, earlyCheckIn, lateCheckOut } = body;

    if (!roomIds || !Array.isArray(roomIds) || roomIds.length === 0 || !checkIn || !checkOut || !name || !email) {
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
        roomId: { in: roomIds },
        status: { not: 'CANCELLED' },
        OR: [{ checkInDate: { lte: checkOutDate }, checkOutDate: { gte: checkInDate } }]
      }
    });

    if (overlapping) {
      return NextResponse.json({ error: 'Una o más habitaciones ya están reservadas en esas fechas.' }, { status: 409 });
    }

    const rooms = await prisma.room.findMany({ where: { id: { in: roomIds } } });
    if (rooms.length !== roomIds.length) {
      return NextResponse.json({ error: 'Habitación no encontrada.' }, { status: 404 });
    }

    const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) {
      return NextResponse.json({ error: 'Fechas inválidas.' }, { status: 400 });
    }

    let addonsTotal = 0;
    if (earlyCheckIn) addonsTotal += 500 * rooms.length;
    if (lateCheckOut) addonsTotal += 500 * rooms.length;

    let subtotal = 0;
    for (const r of rooms) {
      subtotal += days * r.basePrice;
    }

    const tax = (subtotal + addonsTotal) * 0.15;
    const totalPrice = subtotal + addonsTotal + tax;

    let paymentAmount = totalPrice;
    if (paymentMethod === 'partial_card') paymentAmount = totalPrice / 2;

    // Encode booking data in ERN so callback can create the reservation after payment
    const bookingData = {
      roomIds, checkIn, checkOut, name, email, phone, paymentMethod,
      totalPrice, paymentAmount, days, earlyCheckIn, lateCheckOut
    };
    const ern = Buffer.from(JSON.stringify(bookingData)).toString('base64url');

    // Call Pagadito to get the payment URL (NO reservation created yet)
    const lineItems = rooms.map(r => ({
      quantity: days,
      description: `${r.contentName} (${days} noches)`,
      priceInHNL: r.basePrice * 1.15
    }));
    
    if (earlyCheckIn) {
      lineItems.push({ quantity: rooms.length, description: 'Early Check-in (10:00 AM - 1:00 PM)', priceInHNL: 500 * 1.15 });
    }
    if (lateCheckOut) {
      lineItems.push({ quantity: rooms.length, description: 'Late Check-out (Hasta 2:00 PM)', priceInHNL: 500 * 1.15 });
    }

    const redirectUrl = await execTrans(ern, lineItems);

    return NextResponse.json({ redirectUrl });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message || 'Error al procesar el pago.' }, { status: 500 });
  }
}
