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
        // Package reservation
        const reservationId = ern.replace('pkg-', '');
        await prisma.amenityReservation.update({
          where: { id: reservationId },
          data: { status: 'CONFIRMED' }
        });

        return NextResponse.redirect(
          new URL(`/es/payment-success?resId=${reservationId}&type=package`, req.url)
        );
      } else {
        // Room reservation
        const reservation = await prisma.reservation.findUnique({
          where: { id: ern },
          include: { payment: true }
        });

        if (reservation) {
          await prisma.$transaction(async (tx) => {
            await tx.reservation.update({
              where: { id: ern },
              data: { status: 'CONFIRMED' }
            });

            if (reservation.payment) {
              await tx.payment.update({
                where: { id: reservation.payment.id },
                data: { status: 'COMPLETED' }
              });
            }
          });

          return NextResponse.redirect(
            new URL(`/es/payment-success?resId=${ern}`, req.url)
          );
        }
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
