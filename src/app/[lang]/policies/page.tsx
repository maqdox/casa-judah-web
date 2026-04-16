import styles from './page.module.css';
import { getDictionary } from '@/dictionaries';

export default async function PoliciesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = (await params) as { lang: 'en' | 'es' };
  const dict = await getDictionary(lang);
  const t = dict.policies;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      <section className={styles.policySection}>
        <div className={styles.policyCard}>
          <h2>{t.g1}</h2>
          <p>{t.g1t}</p>
        </div>

        <div className={styles.policyCard}>
          <h2>{t.g2}</h2>
          <p>{t.g2t}</p>
        </div>

        <div className={styles.policyCard}>
          <h2>{t.g3}</h2>
          <p>{t.g3t}</p>
        </div>
      </section>
    </main>
  );
}
