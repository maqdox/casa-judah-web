import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [totalRooms, monthlyReservations, upcomingCheckins] = await Promise.all([
    prisma.room.count(),
    prisma.reservation.findMany({
      where: {
        createdAt: { gte: firstDayOfMonth },
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      }
    }),
    prisma.reservation.findMany({
      where: {
        checkInDate: { gte: now, lte: nextWeek },
        status: { in: ['PENDING', 'CONFIRMED'] }
      },
      include: { guest: true, room: { select: { contentName: true } } },
      orderBy: { checkInDate: 'asc' },
      take: 5
    })
  ]);

  const monthlyIncome = monthlyReservations.reduce((sum, res) => sum + res.totalPrice, 0);

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>Dashboard</h1>
      <p className={styles.subtitle}>Resumen de tu actividad en Casa Judah.</p>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Ingresos (Este Mes)</h3>
          <p className={styles.statNumber}>L {monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Reservas (Este Mes)</h3>
          <p className={styles.statNumber}>{monthlyReservations.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Habitaciones Activas</h3>
          <p className={styles.statNumber}>{totalRooms}</p>
        </div>
      </div>

      <div className={styles.welcomeBox}>
        <h2>Próximos Check-ins (7 días)</h2>
        {upcomingCheckins.length === 0 ? (
          <p style={{ color: '#666', marginTop: '1rem' }}>No hay llegadas programadas para esta semana.</p>
        ) : (
          <table className={styles.upcomingTable}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Huésped</th>
                <th>Habitación</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {upcomingCheckins.map(res => (
                <tr key={res.id}>
                  <td>{res.checkInDate.toLocaleDateString('es-HN')}</td>
                  <td>{res.guest.name} <br/><small>{res.guest.phone}</small></td>
                  <td>{res.room.contentName}</td>
                  <td><span className={`${styles.badge} ${styles[res.status.toLowerCase()]}`}>{res.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
