import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.brand}>
          <h3>Casa Judah</h3>
          <p>A premium farm hotel experience.</p>
        </div>
        <div className={styles.links}>
          <Link href="/policies">Policies & Rules</Link>
          <Link href="/admin">Admin Access</Link>
        </div>
      </div>
      <p className={styles.copyright}>© {new Date().getFullYear()} Casa Judah Farm Hotel. All rights reserved.</p>
    </footer>
  );
}
