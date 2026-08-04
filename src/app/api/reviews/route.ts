import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cleanliness, service, food, comments, guestName } = body;

    // Basic validation
    if (
      typeof cleanliness !== 'number' || cleanliness < 1 || cleanliness > 10 ||
      typeof service !== 'number' || service < 1 || service > 10 ||
      typeof food !== 'number' || food < 1 || food > 10
    ) {
      return NextResponse.json(
        { error: 'Invalid ratings. Must be numbers between 1 and 10.' },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        cleanliness,
        service,
        food,
        comments: comments ? String(comments) : null,
        guestName: guestName ? String(guestName) : null,
      },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
