import Link from 'next/link';
import { cookies } from 'next/headers';
import styles from './layout.module.css';

async function logoutAction() {
  'use server'
  ;(await cookies()).delete('casa_admin_auth');
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <h2>Casa Judah</h2>
          <span>Admin</span>
        </div>
        
        <nav className={styles.nav}>
          <Link href="/admin" className={styles.navLink}>📊 Dashboard</Link>
          <Link href="/admin/reservations" className={styles.navLink}>📅 Reservaciones</Link>
          <Link href="/admin/rooms" className={styles.navLink}>🛏️ Habitaciones</Link>
          <Link href="/admin/content" className={styles.navLink}>✍️ Contenido</Link>
          <Link href="/admin/media" className={styles.navLink}>🖼️ Media</Link>
          <Link href="/admin/pricing" className={styles.navLink}>💰 Precios & Fechas</Link>
          <Link href="/admin/settings" className={styles.navLink}>⚙️ Ajustes & Tema</Link>
        </nav>
        
        <div className={styles.sidebarFooter}>
          <a href="/es" target="_blank" className={styles.navLink}>↗ Ver Web Pública</a>
          <form action={logoutAction}>
            <button type="submit" className={styles.logoutBtn}>Cerrar Sesión</button>
          </form>
        </div>
      </aside>
      
      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.topbarStats}>
            <span className={styles.statusDot}></span>
            Base de datos conectada (Supabase)
          </div>
        </header>
        <div className={styles.contentArea}>
          {children}
        </div>
      </main>
    </div>
  );
}
