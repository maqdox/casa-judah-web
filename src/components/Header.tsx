'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import TorchLogo from './TorchLogo';
import styles from './Header.module.css';

export default function Header({ dict, lang }: { dict: any, lang: string }) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const isHome = pathname === `/${lang}` || pathname === `/${lang}/`;

  useEffect(() => {
    // Scroll listener ...
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Init
    
    // Ensure the current language is saved into the cookie
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`;
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lang]);

  const isSolid = !isHome || scrolled;
  
  const switchLanguage = (e: React.MouseEvent) => {
    e.preventDefault();
    const newLang = lang === 'es' ? 'en' : 'es';
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
    router.push(pathname.replace(`/${lang}`, `/${newLang}`));
  };

  return (
    <>
      <header className={`${styles.header} ${isSolid ? styles.scrolled : styles.transparent}`}>
        <nav className={styles.nav}>
          <Link href={`/${lang}/rooms`}>{dict.rooms}</Link>
          <Link href={`/${lang}/experiences`}>{dict.experiences}</Link>
          <Link href={`/${lang}/policies`}>{dict.policies}</Link>
        </nav>
        <div className={styles.logo}>
          <Link href={`/${lang}`}>
            <TorchLogo />
            <span>CASA JUDAH</span>
          </Link>
        </div>
        <div className={styles.actions}>
          <a href="#" onClick={switchLanguage} className={styles.langBtn}>{lang === 'es' ? 'EN' : 'ES'}</a>
          <Link href={`/${lang}/booking`} className={styles.bookButton}>{dict.bookNow}</Link>
        </div>
      </header>
      {!isHome && <div style={{ height: '90px' }} />}
    </>
  );
}
