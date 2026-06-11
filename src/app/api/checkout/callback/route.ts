import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStatus } from '@/lib/pagadito';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');
  const ern = searchParams.get('ern');

  console.log('[Callback] Received:', { token, ern });

  if (!token || !ern) {
    console.error('[Callback] Missing token or ern');
    return NextResponse.redirect(new URL('/es/booking?error=missing_params', req.url));
  }

  try {
    // Ask Pagadito if the transaction was completed
    const statusResult = await getStatus(token);
    console.log('[Callback] Pagadito status response:', JSON.stringify(statusResult));

    // The status could be at different levels depending on response format
    const txStatus = statusResult?.status || statusResult?.transaction_status || 'UNKNOWN';
    console.log('[Callback] Transaction status:', txStatus);

    const isSuccess = ['COMPLETED', 'REGISTERED', 'VERIFYING'].includes(txStatus.toUpperCase());

    if (isSuccess) {
      const isPackage = ern.startsWith('pkg-');

      if (isPackage) {
        // Package reservation — decode booking data from ERN and CREATE the reservation now
        let bookingData: any;
        try {
          const encodedData = ern.replace('pkg-', '');
          bookingData = JSON.parse(Buffer.from(encodedData, 'base64url').toString());
        } catch (err) {
          console.error('[Callback] Failed to decode package ERN:', ern, err);
          return NextResponse.redirect(new URL('/es/paquetes?error=invalid_ern', req.url));
        }

        console.log('[Callback] Creating package reservation for:', bookingData.name);

        const reservation = await prisma.amenityReservation.create({
          data: {
            amenityId: bookingData.amenityId,
            guestName: bookingData.name,
            guestPhone: bookingData.phone,
            guestEmail: bookingData.email || '',
            date: new Date(bookingData.date),
            timeSlot: bookingData.timeSlot || 'evening',
            guests: bookingData.guests,
            totalPrice: bookingData.totalPrice,
            status: 'CONFIRMED',
            notes: bookingData.notes
          }
        });

        return NextResponse.redirect(
          new URL(`/es/payment-success?resId=${reservation.id}&type=package`, req.url)
        );
      } else {
        // Room reservation — decode booking data from ERN
        let bookingData: any;
        try {
          bookingData = JSON.parse(Buffer.from(ern, 'base64url').toString());
        } catch {
          console.error('[Callback] Failed to decode ERN:', ern);
          return NextResponse.redirect(new URL('/es/booking?error=invalid_ern', req.url));
        }

        console.log('[Callback] Creating room reservation for:', bookingData.name);

        const { roomIds, checkIn, checkOut, name, email, phone, paymentMethod, earlyCheckIn, lateCheckOut } = bookingData;

        const reservations = await prisma.$transaction(async (tx) => {
          let guest = await tx.guest.findUnique({ where: { email } });
          if (!guest) {
            guest = await tx.guest.create({ data: { name, email, phone } });
          }

          const rooms = await tx.room.findMany({ where: { id: { in: roomIds } } });
          const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
          const createdRes = [];

          for (const room of rooms) {
            const roomSubtotal = days * room.basePrice;
            let roomAddons = 0;
            if (earlyCheckIn) roomAddons += 500;
            if (lateCheckOut) roomAddons += 500;
            const roomTax = (roomSubtotal + roomAddons) * 0.15;
            const roomTotalPrice = roomSubtotal + roomAddons + roomTax;

            let paymentAmount = roomTotalPrice;
            if (paymentMethod === 'partial_card') paymentAmount = roomTotalPrice / 2;

            const res = await tx.reservation.create({
              data: {
                guestId: guest.id,
                roomId: room.id,
                checkInDate: new Date(checkIn),
                checkOutDate: new Date(checkOut),
                rulesAccepted: true,
                totalPrice: roomTotalPrice,
                status: 'CONFIRMED'
              }
            });

            await tx.payment.create({
              data: {
                reservationId: res.id,
                amount: paymentAmount,
                paymentMethod,
                status: 'COMPLETED'
              }
            });

            createdRes.push(res);
          }

          return createdRes;
        });

        return NextResponse.redirect(
          new URL(`/es/booking/success?resId=${reservations[0].id}`, req.url)
        );
      }
    }

    // Payment was NOT successful
    console.warn('[Callback] Payment not successful. Status:', txStatus);
    return NextResponse.redirect(
      new URL(`/es/booking?error=payment_failed&status=${txStatus}`, req.url)
    );
  } catch (err: any) {
    console.error('[Callback] Error:', err.message, err.stack);
    return NextResponse.redirect(
      new URL(`/es/booking?error=callback_error&detail=${encodeURIComponent(err.message || 'unknown')}`, req.url)
    );
  }
}
