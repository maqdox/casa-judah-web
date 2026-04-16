import { prisma } from '@/lib/prisma';
import styles from './page.module.css';

export default async function AdminDashboard() {
  const [totalRooms, totalReservations, pendingReservations] = await Promise.all([
    prisma.room.count(),
    prisma.reservation.count(),
    prisma.reservation.count({ where: { status: 'PENDING' } })
  ]);

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>Dashboard Overview</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Rooms</h3>
          <p className={styles.statNumber}>{totalRooms}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Reservations</h3>
          <p className={styles.statNumber}>{totalReservations}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Pending Confirmations</h3>
          <p className={styles.statNumber}>{pendingReservations}</p>
        </div>
      </div>

      <div className={styles.welcomeBox}>
        <h2>Bienvenido al Panel de Casa Judah</h2>
        <p>Tu base de datos está conectada exitosamente a Supabase. Utiliza el menú lateral para gestionar las reservaciones, el contenido y la experiencia de usuario de tu Sitio Web Premium.</p>
      </div>
    </div>
  );
}
