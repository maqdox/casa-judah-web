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
        const reservationId = ern.replace('pkg-', '');
        console.log('[Callback] Confirming package reservation:', reservationId);
        
        await prisma.amenityReservation.update({
          where: { id: reservationId },
          data: { status: 'CONFIRMED' }
        });

        return NextResponse.redirect(
          new URL(`/es/payment-success?resId=${reservationId}&type=package`, req.url)
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

        const { roomId, checkIn, checkOut, name, email, phone, paymentMethod, totalPrice, paymentAmount } = bookingData;

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
