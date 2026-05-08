import styles from './page.module.css';
import Image from 'next/image';
import { getDictionary } from '@/dictionaries';
import SwipeCarousel from '@/components/v2/SwipeCarousel';
import ExperienceBookingCTA from './ExperienceBookingCTA';

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

      {/* Estilo de Vida Orgánico — gallery */}
      <section className={styles.section}>
        <div className={styles.textContent}>
          <h2>{t.section1Title}</h2>
          <p>{t.section1Text}</p>
        </div>
        <div className={`${styles.imageContent} square-frame`}>
          <SwipeCarousel
            images={['/vida1.jpg', '/vida2.jpg', '/vida3.jpg']}
            altBase={t.section1Title}
          />
        </div>
      </section>

      {/* Nuestros Animales — gallery */}
      <section className={`${styles.section} ${styles.reverse}`}>
        <div className={styles.textContent}>
          <h2>{t.section2Title}</h2>
          <p>{t.section2Text}</p>
        </div>
        <div className={`${styles.imageContent} square-frame`}>
          <SwipeCarousel
            images={['/granja1.jpg', '/granja2.jpg', '/granja3.jpg', '/granja4.jpg', '/granja5.jpg', '/granja6.jpg', '/oveja_final.jpeg']}
            altBase={t.section2Title}
            objectFits={['cover', 'cover', 'cover', 'cover', 'cover', 'cover', 'contain']}
          />
        </div>
      </section>

      {/* Deleite Culinario */}
      <section className={styles.section}>
        <div className={styles.textContent}>
          <h2>{t.section3Title}</h2>
          <p>{t.section3Text}</p>
        </div>
        <div className={`${styles.imageContent} square-frame`}>
           <Image src="/desayuno.jpg" alt="Culinary setting" fill style={{ objectFit: 'cover' }} />
        </div>
      </section>

      <ExperienceBookingCTA />
    </main>
  );
}
