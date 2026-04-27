import Link from 'next/link';
import { cookies } from 'next/headers';
import styles from './layout.module.css';

import { prisma } from '@/lib/prisma';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  BedDouble, 
  Waves, 
  FileText, 
  Image as ImageIcon, 
  Settings, 
  LogOut, 
  Globe 
} from 'lucide-react';
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
          <Link href="/admin" className={styles.navLink}><LayoutDashboard size={18} /> Dashboard</Link>
          <Link href="/admin/reservations" className={styles.navLink}><CalendarCheck size={18} /> Reservaciones</Link>
          <Link href="/admin/rooms" className={styles.navLink}><BedDouble size={18} /> Habitaciones</Link>
          <Link href="/admin/amenities" className={styles.navLink}><Waves size={18} /> Amenidades</Link>
          <Link href="/admin/content" className={styles.navLink}><FileText size={18} /> Contenido</Link>
          <Link href="/admin/media" className={styles.navLink}><ImageIcon size={18} /> Media</Link>
          <Link href="/admin/settings" className={styles.navLink}><Settings size={18} /> Ajustes & Tema</Link>
        </nav>
        
        <div className={styles.sidebarFooter}>
          <a href="/es" target="_blank" className={styles.navLink}><Globe size={18} /> Ver Web Pública</a>
          <form action={logoutAction}>
            <button type="submit" className={styles.logoutBtn}><LogOut size={18} /> Cerrar Sesión</button>
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
