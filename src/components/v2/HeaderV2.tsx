'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import BrandLogo from '../BrandLogo';
import styles from './HeaderV2.module.css';

export default function HeaderV2({ dict, lang }: { dict: any, lang: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const switchLanguage = (e: React.MouseEvent) => {
    e.preventDefault();
    const newLang = lang === 'es' ? 'en' : 'es';
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
    router.push(pathname.replace(`/${lang}`, `/${newLang}`));
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        <div className={styles.left}>
          <button className={styles.menuToggle} onClick={() => setMenuOpen(!menuOpen)}>
            <div className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}>
              <span></span>
              <span></span>
            </div>
            <span className={styles.menuLabel}>{dict.menu || 'MENU'}</span>
          </button>
        </div>

        <div className={styles.center}>
          <Link href={`/${lang}/v2`}>
            <BrandLogo scrolled={true} className={styles.logo} />
          </Link>
        </div>

        <div className={styles.right}>
          <a href="#" onClick={switchLanguage} className={styles.langBtn}>
            {lang === 'es' ? 'EN' : 'ES'}
          </a>
          <Link href={`/${lang}/booking`} className={styles.bookBtn}>
            {dict.bookNow}
          </Link>
        </div>
      </div>

      {/* Overlay Menu */}
      <nav className={`${styles.overlay} ${menuOpen ? styles.overlayOpen : ''}`}>
        <div className={styles.overlayContent}>
          <Link href={`/${lang}/v2`} onClick={() => setMenuOpen(false)}>{dict.home || 'Inicio'}</Link>
          <Link href={`/${lang}/rooms`} onClick={() => setMenuOpen(false)}>{dict.rooms}</Link>
          <Link href={`/${lang}/experiences`} onClick={() => setMenuOpen(false)}>{dict.experiences}</Link>
          <Link href={`/${lang}/policies`} onClick={() => setMenuOpen(false)}>{dict.policies}</Link>
        </div>
      </nav>
    </header>
  );
}
