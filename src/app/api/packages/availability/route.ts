import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const packageId = searchParams.get('packageId');
    const timeSlot = searchParams.get('timeSlot');

    if (!date || !packageId) {
      return NextResponse.json({ error: 'Missing date or packageId' }, { status: 400 });
    }

    // Parse the date to start/end of day
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if there's already a reservation for this package on this date
    const whereClause: any = {
      amenityId: packageId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        not: 'CANCELLED',
      },
    };

    // If time slot is provided, also filter by it (for Café entre Ovejas)
    if (timeSlot) {
      whereClause.timeSlot = timeSlot;
    }

    const existingReservation = await prisma.amenityReservation.findFirst({
      where: whereClause,
    });

    return NextResponse.json({
      available: !existingReservation,
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
