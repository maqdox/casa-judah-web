'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import BrandLogo from './BrandLogo';
import styles from './Header.module.css';

export default function Header({ dict, lang }: { dict: any, lang: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const isHome = pathname === `/${lang}` || pathname === `/${lang}/`;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000`;
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lang]);

  const isSolid = !isHome || scrolled;
  
  const switchLanguage = (e: React.MouseEvent) => {
    e.preventDefault();
    const newLang = lang === 'es' ? 'en' : 'es';
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
    router.push(pathname.replace(`/${lang}`, `/${newLang}`));
    setIsMobileMenuOpen(false);
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className={`${styles.header} ${isSolid ? styles.scrolled : styles.transparent}`}>
        <div 
          className={styles.burgerIcon} 
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={28} color={isSolid ? "var(--color-dark-brown)" : "var(--color-white)"} />
        </div>
        
        <nav className={styles.nav}>
          <Link href={`/${lang}/rooms`}>{dict.rooms}</Link>
          <Link href={`/${lang}/experiences`}>{dict.experiences}</Link>
          <Link href={`/${lang}/faqs`}>{dict.faqs}</Link>
          <Link href={`/${lang}/policies`}>{dict.policies}</Link>
        </nav>
        <div className={styles.logo}>
          <Link href={`/${lang}`}>
            <BrandLogo scrolled={isSolid || isMobileMenuOpen} className={styles.mainLogo} />
          </Link>
        </div>
        <div className={styles.actions}>
          <a href="#" onClick={switchLanguage} className={styles.langBtn}>{lang === 'es' ? 'EN' : 'ES'}</a>
          <Link href={`/${lang}/booking`} className={styles.bookButton}>{dict.bookNow}</Link>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div 
          className={styles.burgerIcon} 
          style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}
          onClick={closeMenu}
        >
          <X size={32} color="var(--color-dark-brown)" />
        </div>
        <Link href={`/${lang}/rooms`} onClick={closeMenu}>{dict.rooms}</Link>
        <Link href={`/${lang}/experiences`} onClick={closeMenu}>{dict.experiences}</Link>
        <Link href={`/${lang}/faqs`} onClick={closeMenu}>{dict.faqs}</Link>
        <Link href={`/${lang}/policies`} onClick={closeMenu}>{dict.policies}</Link>
        <Link href={`/${lang}/booking`} onClick={closeMenu} style={{ marginTop: '1rem', color: 'var(--color-olive)', fontWeight: 'bold' }}>{dict.bookNow}</Link>
      </div>
      
      {!isHome && <div style={{ height: '90px' }} />}
    </>
  );
}
