import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStatus } from '@/lib/pagadito';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const ern = searchParams.get('ern');

    if (!token || !ern) {
      return NextResponse.redirect(new URL('/es/booking?error=missing_params', req.url));
    }

    // Ask Pagadito if the transaction was completed
    const status = await getStatus(token);

    if (status.status === 'COMPLETED' || status.status === 'REGISTERED') {
      const isPackage = ern.startsWith('pkg-');

      if (isPackage) {
        // Package reservation — already created as PENDING, just confirm
        const reservationId = ern.replace('pkg-', '');
        await prisma.amenityReservation.update({
          where: { id: reservationId },
          data: { status: 'CONFIRMED' }
        });

        return NextResponse.redirect(
          new URL(`/es/payment-success?resId=${reservationId}&type=package`, req.url)
        );
      } else {
        // Room reservation — decode booking data from ERN and CREATE the reservation now
        let bookingData: any;
        try {
          bookingData = JSON.parse(Buffer.from(ern, 'base64url').toString());
        } catch {
          return NextResponse.redirect(new URL('/es/booking?error=invalid_ern', req.url));
        }

        const { roomId, checkIn, checkOut, name, email, phone, paymentMethod, totalPrice, paymentAmount } = bookingData;

        // Create the reservation + payment now that payment is confirmed
        const reservation = await prisma.$transaction(async (tx) => {
          let guest = await tx.guest.findUnique({ where: { email } });
          if (!guest) {
            guest = await tx.guest.create({ data: { name, email, phone } });
          }

          const res = await tx.reservation.create({
            data: {
              guestId: guest.id,
              roomId,
              checkInDate: new Date(checkIn),
              checkOutDate: new Date(checkOut),
              rulesAccepted: true,
              totalPrice,
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

          return res;
        });

        return NextResponse.redirect(
          new URL(`/es/payment-success?resId=${reservation.id}`, req.url)
        );
      }
    }

    // Payment was NOT successful
    return NextResponse.redirect(
      new URL(`/es/booking?error=payment_failed&status=${status.status}`, req.url)
    );
  } catch (err: any) {
    console.error('Pagadito callback error:', err);
    return NextResponse.redirect(
      new URL('/es/booking?error=callback_error', req.url)
    );
  }
}
