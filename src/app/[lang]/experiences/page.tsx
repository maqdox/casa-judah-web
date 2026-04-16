import styles from './page.module.css';
import Image from 'next/image';
import { getDictionary } from '@/dictionaries';

export default async function ExperiencesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = (await params) as { lang: 'en' | 'es' };
  const dict = await getDictionary(lang);
  const t = dict.experiences;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>{t.headerTitle}</h1>
        <p>{t.headerSubtitle}</p>
      </header>

      <section className={styles.section}>
        <div className={styles.textContent}>
          <h2>{t.section1Title}</h2>
          <p>{t.section1Text}</p>
        </div>
        <div className={`${styles.imageContent} luxury-frame`}>
           <Image src="/hero.jpg" alt="Organic farming overview" fill style={{ objectFit: 'cover' }} />
        </div>
      </section>

      <section className={`${styles.section} ${styles.reverse}`}>
        <div className={styles.textContent}>
          <h2>{t.section2Title}</h2>
          <p>{t.section2Text}</p>
        </div>
        <div className={`${styles.imageContent} arch-frame`}>
           <Image src="/ternero.jpg" alt="Farm animals view" fill style={{ objectFit: 'cover' }} />
        </div>
      </section>

      <section className={styles.section}>
         <div className={styles.textContent}>
          <h2>{t.section3Title}</h2>
          <p>{t.section3Text}</p>
        </div>
        <div className={`${styles.imageContent} luxury-frame`}>
           <Image src="/piscina.jpg" alt="Culinary setting" fill style={{ objectFit: 'cover' }} />
        </div>
      </section>
    </main>
  );
}
