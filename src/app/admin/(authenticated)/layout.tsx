import Link from 'next/link';
import { cookies } from 'next/headers';
import styles from './layout.module.css';

import { prisma } from '@/lib/prisma';

const THEME_MAP: Record<string, { primary: string, accent: string }> = {
  'verde_olivo': { primary: '#4E583E', accent: '#D6BE9B' },
  'terracota': { primary: '#804639', accent: '#D6BE9B' },
  'marron_medio': { primary: '#A88E6D', accent: '#D6BE9B' },
  'cafe_profundo': { primary: '#5A4334', accent: '#D6BE9B' },
  'negro': { primary: '#000000', accent: '#D6BE9B' },
};

async function logoutAction() {
  'use server'
  ;(await cookies()).delete('casa_admin_auth');
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const themeSetting = await prisma.siteSetting.findUnique({ where: { key: 'activeTheme' } });
  const themeKey = themeSetting?.value || 'verde_olivo';
  const activeColors = THEME_MAP[themeKey] || THEME_MAP['verde_olivo'];

  return (
    <div className={styles.adminLayout} style={{
      '--color-dark-brown': activeColors.primary,
      '--color-olive': activeColors.primary,
      '--color-accent': activeColors.accent,
    } as React.CSSProperties}>
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
