import styles from './page.module.css';
import Image from 'next/image';
import { getDictionary } from '@/dictionaries';
import HorizontalGallery from '@/components/v2/HorizontalGallery';

export default async function ExperiencesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = (await params) as { lang: 'en' | 'es' };
  const isEs = lang === 'es';
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
    { src: '/conejos/conejo10.jpg', objectFit: 'cover' },
    { src: '/granja3.jpg', objectFit: 'cover' },
    { src: '/conejos/conejo11.jpg', objectFit: 'cover' },
    { src: '/granja4.jpg', objectFit: 'cover' },
    { src: '/granja5.jpg', objectFit: 'cover' },
    { src: '/granja6.jpg', objectFit: 'cover' },
    { src: '/oveja_final.jpeg', objectFit: 'contain' },
  ];

  const section3Images = [
    { src: '/desayuno.jpg', objectFit: 'cover' },
    { src: '/deleite-culinario/1.jpg', objectFit: 'cover' },
    { src: '/deleite-culinario/2.jpg', objectFit: 'cover' },
    { src: '/deleite-culinario/3.jpg', objectFit: 'cover' },
  ];

  const experienciaGranjaImages = [
    { src: '/experiencia-granja/2.jpg', objectFit: 'cover' },
    { src: '/experiencia-granja/3.jpg', objectFit: 'cover' },
    { src: '/experiencia-granja/4.jpg', objectFit: 'cover' },
    { src: '/experiencia-granja/5.jpg', objectFit: 'cover' },
    { src: '/experiencia-granja/6.jpg', objectFit: 'cover' },
    { src: '/experiencia-granja/7.jpg', objectFit: 'cover' },
    { src: '/experiencia-granja/9.jpg', objectFit: 'cover' },
  ];

  const cafeOvejasImages = [
    { src: '/cafe-ovejas/1.jpg', objectFit: 'cover' },
    { src: '/cafe-ovejas/2.jpg', objectFit: 'cover' },
    { src: '/cafe-ovejas/3.jpg', objectFit: 'cover' },
    { src: '/cafe-ovejas/4.jpg', objectFit: 'cover' },
  ];

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>{t.headerTitle}</h1>
        <p>{t.headerSubtitle}</p>
      </header>

      <section className={styles.sectionBlock} style={{ paddingTop: 0 }}>
        <HorizontalGallery images={experienciaGranjaImages as any} title={t.headerTitle} />
      </section>

      {/* Estilo de Vida Orgánico */}
      <section className={styles.sectionBlock}>
        <div className={styles.textContent}>
          <h2>{t.section1Title}</h2>
          <p>{t.section1Text}</p>
        </div>
        <HorizontalGallery images={section1Images as any} title={t.section1Title} />
      </section>

      {/* Café entre Ovejas */}
      <section className={styles.sectionBlock}>
        <div className={styles.textContent}>
          <h2>{isEs ? 'Café entre Ovejas' : 'Coffee among Sheep'}</h2>
          <p>{isEs ? 'Disfruta de una tarde mágica rodeado de naturaleza. Nuestro paquete incluye café artesanal o té, y la oportunidad única de interactuar de cerca con nuestras adorables ovejas y otros animales de la granja. Llévate un recuerdo inolvidable con una foto grupal.' : 'Enjoy a magical afternoon surrounded by nature. Our package includes artisan coffee or tea, and the unique opportunity to interact closely with our adorable sheep and other farm animals. Take home an unforgettable memory with a group photo.'}</p>
        </div>
        <HorizontalGallery images={cafeOvejasImages as any} title={isEs ? 'Café entre Ovejas' : 'Coffee among Sheep'} />
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
