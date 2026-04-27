import Link from 'next/link';
import styles from './Footer.module.css';

interface FooterProps {
  lang?: string;
}

export default function Footer({ lang = 'es' }: FooterProps) {
  const isEs = lang === 'es';

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        {/* Brand */}
        <div className={styles.col}>
          <h3>Casa Judah</h3>
          <p>{isEs ? 'Un farm hotel de experiencia premium en el corazón de Olancho.' : 'A premium farm hotel experience in the heart of Olancho.'}</p>
        </div>

        {/* Navigation */}
        <div className={styles.col}>
          <h4>{isEs ? 'Explorar' : 'Explore'}</h4>
          <Link href={`/${lang}/rooms`}>{isEs ? 'Habitaciones' : 'Rooms'}</Link>
          <Link href={`/${lang}/experiences`}>{isEs ? 'Experiencias' : 'Experiences'}</Link>
          <Link href={`/${lang}/booking`}>{isEs ? 'Reservar' : 'Book Now'}</Link>
          <Link href={`/${lang}/policies`}>{isEs ? 'Políticas' : 'Policies'}</Link>
        </div>

        {/* Contact */}
        <div className={styles.col}>
          <h4>{isEs ? 'Contacto' : 'Contact'}</h4>
          <a href="tel:+50431861032">+504 3186-1032</a>
          <a href="mailto:info@casajudah.com">info@casajudah.com</a>
          <span>{isEs ? 'Catacamas, Olancho, Honduras' : 'Catacamas, Olancho, Honduras'}</span>
        </div>

        {/* Social & Hours */}
        <div className={styles.col}>
          <h4>{isEs ? 'Síguenos' : 'Follow Us'}</h4>
          <a href="https://www.instagram.com/casajudah/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.facebook.com/casajudah" target="_blank" rel="noopener noreferrer">Facebook</a>
          <span className={styles.hours}>
            Check-in: 3:00 PM<br/>
            Check-out: 11:00 AM
          </span>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} Casa Judah Farm Hotel. {isEs ? 'Todos los derechos reservados.' : 'All rights reserved.'}</p>
      </div>
    </footer>
  );
}
