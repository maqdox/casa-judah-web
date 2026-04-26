'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import BrandLogo from '../BrandLogo';
import styles from './HeaderV2.module.css';

export default function HeaderV2({ dict, lang }: { dict: any, lang: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const switchLang = (e: React.MouseEvent) => {
    e.preventDefault();
    const newLang = lang === 'es' ? 'en' : 'es';
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
    router.push(pathname.replace(`/${lang}`, `/${newLang}`));
  };

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.solid : ''}`}>
        {/* Left: Book button */}
        <div className={styles.left}>
          <Link href={`/${lang}/booking`} className={styles.bookLink}>
            {dict.bookNow}
          </Link>
        </div>

        {/* Center: Logo */}
        <div className={styles.center}>
          <Link href={`/${lang}/v2`}>
            <BrandLogo scrolled={scrolled} className={styles.logo} />
          </Link>
        </div>

        {/* Right: Lang + Hamburger */}
        <div className={styles.right}>
          <a href="#" onClick={switchLang} className={styles.langLink}>
            {lang === 'es' ? 'En' : 'Es'}
          </a>
          <button 
            className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`} 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span /><span />
          </button>
        </div>
      </header>

      {/* Full-screen overlay nav */}
      <div className={`${styles.overlay} ${menuOpen ? styles.overlayVisible : ''}`}>
        <nav className={styles.overlayNav}>
          <Link href={`/${lang}/v2`} onClick={() => setMenuOpen(false)}>
            {dict.home || 'Inicio'}
          </Link>
          <Link href={`/${lang}/rooms`} onClick={() => setMenuOpen(false)}>
            {dict.rooms}
          </Link>
          <Link href={`/${lang}/experiences`} onClick={() => setMenuOpen(false)}>
            {dict.experiences}
          </Link>
          <Link href={`/${lang}/policies`} onClick={() => setMenuOpen(false)}>
            {dict.policies}
          </Link>
          <Link href={`/${lang}/booking`} onClick={() => setMenuOpen(false)}>
            {dict.bookNow}
          </Link>
        </nav>
      </div>
    </>
  );
}
