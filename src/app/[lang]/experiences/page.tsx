import styles from './page.module.css';
import Image from 'next/image';
import { getDictionary } from '@/dictionaries';
import HorizontalGallery from '@/components/v2/HorizontalGallery';

export default async function ExperiencesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = (await params) as { lang: 'en' | 'es' };
  const dict = await getDictionary(lang);
  const t = dict.experiences;

  const section1Images = [
    { src: '/bicicletas.jpeg', objectFit: 'cover' },
    { src: '/conejos/conejo4.jpg', objectFit: 'cover' },
    { src: '/ninos.jpeg', objectFit: 'cover' },
    { src: '/conejos/conejo5.jpg', objectFit: 'cover' },
    { src: '/conejos/conejo6.jpg', objectFit: 'cover' },
    { src: '/conejos/conejo7.jpg', objectFit: 'cover' },
    { src: '/ternero_nino.jpeg', objectFit: 'cover' },
    { src: '/fogata.jpeg', objectFit: 'cover' },
  ];

  const section2Images = [
    { src: '/granja1.jpg', objectFit: 'cover' },
    { src: '/conejos/conejo8.jpg', objectFit: 'cover' },
    { src: '/granja2.jpg', objectFit: 'cover' },
    { src: '/conejos/conejo9.jpg', objectFit: 'cover' },
    { src: '/conejos/conejo10.jpg', objectFit: 'cover' },
    { src: '/granja3.jpg', objectFit: 'cover' },
    { src: '/conejos/conejo11.jpg', objectFit: 'cover' },
    { src: '/granja4.jpg', objectFit: 'cover' },
    { src: '/granja5.jpg', objectFit: 'cover' },
    { src: '/granja6.jpg', objectFit: 'cover' },
    { src: '/oveja_final.jpeg', objectFit: 'contain' },
  ];

  const section3Images = [
    { src: '/desayuno.jpg', objectFit: 'cover' }
  ];

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>{t.headerTitle}</h1>
        <p>{t.headerSubtitle}</p>
      </header>

      {/* Estilo de Vida Orgánico */}
      <section className={styles.sectionBlock}>
        <div className={styles.textContent}>
          <h2>{t.section1Title}</h2>
          <p>{t.section1Text}</p>
        </div>
        <HorizontalGallery images={section1Images as any} title={t.section1Title} />
      </section>

      {/* Nuestros Animales */}
      <section className={styles.sectionBlock}>
        <div className={styles.textContent}>
          <h2>{t.section2Title}</h2>
          <p>{t.section2Text}</p>
        </div>
        <HorizontalGallery images={section2Images as any} title={t.section2Title} />
      </section>

      {/* Deleite Culinario */}
      <section className={styles.sectionBlock}>
        <div className={styles.textContent}>
          <h2>{t.section3Title}</h2>
          <p>{t.section3Text}</p>
        </div>
        <HorizontalGallery images={section3Images as any} title={t.section3Title} />
      </section>
    </main>
  );
}
