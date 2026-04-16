import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import { updateReservationStatus } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function ReservationsPage() {
  const reservations = await prisma.reservation.findMany({
    include: {
      guest: true,
      room: true,
      payment: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Gestión de Reservaciones</h1>
      <p className={styles.subtitle}>Supervisa todos los ingresos, ingresos y estatus de los huéspedes.</p>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Huésped</th>
                <th>Habitación</th>
                <th>Fechas</th>
                <th>Total</th>
                <th>Método de Pago</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr><td colSpan={8} className={styles.empty}>No hay reservaciones todavía.</td></tr>
              ) : reservations.map((res) => (
                <tr key={res.id}>
                  <td className={styles.muted}>#{res.id.split('-')[0]}</td>
                  <td>
                    <strong>{res.guest.name}</strong><br/>
                    <span className={styles.mutedText}>{res.guest.email}</span><br/>
                    <span className={styles.mutedText}>{res.guest.phone}</span>
                  </td>
                  <td>{res.room.contentName}</td>
                  <td>
                    {res.checkInDate.toLocaleDateString()} <br/>a<br/> 
                    {res.checkOutDate.toLocaleDateString()}
                  </td>
                  <td>${res.totalPrice.toFixed(2)}</td>
                  <td>{res.payment?.paymentMethod.replace('_', ' ').toUpperCase() || 'N/A'}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[res.status.toLowerCase()]}`}>
                      {res.status}
                    </span>
                  </td>
                  <td>
                    <form action={async () => {
                      'use server';
                      const newStatus = res.status === 'PENDING' ? 'CONFIRMED' : 'PENDING';
                      await updateReservationStatus(res.id, newStatus);
                    }}>
                      <button type="submit" className={styles.actionBtn}>
                        {res.status === 'PENDING' ? 'Confirmar' : 'Marcar Pendiente'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
