import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import ReservationFilters from './ReservationFilters';

export const dynamic = 'force-dynamic';

export default async function ReservationsPage() {
  // Fetch room reservations
  const roomReservations = await prisma.reservation.findMany({
    include: {
      guest: true,
      room: { select: { contentName: true } },
      payment: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch amenity reservations
  const amenityReservations = await prisma.amenityReservation.findMany({
    include: { amenity: { select: { title_es: true } } },
    orderBy: { createdAt: 'desc' }
  });

  // Normalize into a unified format
  const unified = [
    ...roomReservations.map(r => ({
      id: r.id,
      type: 'room' as const,
      guestName: r.guest.name,
      guestEmail: r.guest.email,
      guestPhone: r.guest.phone || '',
      itemName: r.room.contentName,
      dateStart: r.checkInDate.toISOString(),
      dateEnd: r.checkOutDate.toISOString(),
      timeSlot: '',
      guests: 0,
      totalPrice: r.totalPrice,
      paymentMethod: r.payment?.paymentMethod?.replace('_', ' ').toUpperCase() || 'N/A',
      receiptUrl: r.payment?.receiptUrl || null,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      notes: '',
    })),
    ...amenityReservations.map(a => ({
      id: a.id,
      type: 'amenity' as const,
      guestName: a.guestName,
      guestEmail: a.guestEmail || '',
      guestPhone: a.guestPhone || '',
      itemName: a.amenity.title_es,
      dateStart: a.date.toISOString(),
      dateEnd: '',
      timeSlot: a.timeSlot,
      guests: a.guests,
      totalPrice: a.totalPrice,
      paymentMethod: '',
      receiptUrl: null,
      status: a.status,
      createdAt: a.createdAt.toISOString(),
      notes: a.notes || '',
    })),
  ];

  // Fetch amenities for the "create amenity reservation" form
  const amenities = await prisma.amenity.findMany({
    where: { isActive: true },
    select: { id: true, title_es: true, price: true },
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Gestión de Reservaciones</h1>
      <p className={styles.subtitle}>Supervisa todas las reservaciones de habitaciones y amenidades.</p>

      <ReservationFilters data={unified} amenities={amenities} />
    </div>
  );
}
