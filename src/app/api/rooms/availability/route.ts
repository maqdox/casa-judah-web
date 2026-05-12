import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    const checkInStr = searchParams.get('checkIn');
    const checkOutStr = searchParams.get('checkOut');

    if (!roomId || !checkInStr || !checkOutStr) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return NextResponse.json({ error: 'Invalid dates' }, { status: 400 });
    }

    if (checkOut <= checkIn) {
       return NextResponse.json({ error: 'Check-out must be after check-in', available: false }, { status: 200 });
    }

    const overlapping = await prisma.reservation.findFirst({
      where: {
        roomId,
        status: { not: 'CANCELLED' },
        OR: [
          { checkInDate: { lte: checkOut }, checkOutDate: { gte: checkIn } }
        ]
      }
    });

    return NextResponse.json({ available: !overlapping });
  } catch (error) {
    console.error('Availability check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
