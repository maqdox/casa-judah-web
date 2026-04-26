import Link from 'next/link';
import styles from './FooterV2.module.css';

export default function FooterV2({ lang }: { lang: string }) {
  const isEs = lang === 'es';

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.col}>
          <h4>{isEs ? 'Conócenos' : 'Get to know us'}</h4>
          <Link href={`/${lang}/experiences`}>{isEs ? 'Sobre Casa Judah' : 'About Casa Judah'}</Link>
          <Link href={`/${lang}/experiences`}>{isEs ? 'La Granja' : 'The Farm'}</Link>
          <Link href={`/${lang}/policies`}>{isEs ? 'Políticas' : 'Policies'}</Link>
        </div>

        <div className={styles.col}>
          <h4>{isEs ? 'Contacto' : 'Get in touch'}</h4>
          <a href="tel:+50431861032">+504 3186-1032</a>
          <a href="mailto:info@casajudah.com">info@casajudah.com</a>
        </div>

        <div className={styles.col}>
          <h4>{isEs ? 'Síguenos' : 'Follow us'}</h4>
          <a href="https://www.instagram.com/casajudah/" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://www.facebook.com/casajudah" target="_blank" rel="noopener noreferrer">Facebook</a>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} Casa Judah. {isEs ? 'Todos los derechos reservados.' : 'All rights reserved.'}</span>
      </div>
    </footer>
  );
}
