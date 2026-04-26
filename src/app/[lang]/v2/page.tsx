import styles from "./page.module.css";
import Link from 'next/link';
import Image from 'next/image';
import { getDictionary } from "@/dictionaries";
import { prisma } from "@/lib/prisma";
import HeaderV2 from "@/components/v2/HeaderV2";
import FooterV2 from "@/components/v2/FooterV2";
import RoomCarousel from "@/components/v2/RoomCarousel";

export default async function HomeV2({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = (await params) as { lang: 'en' | 'es' };
  const dict = await getDictionary(lang);
  const t = dict.home;

  const dbContent = await prisma.siteContent.findMany();
  const contentMap: Record<string, string> = {};
  dbContent.forEach(item => {
    contentMap[`${item.section}.${item.key}`] = item.value;
  });

  const rooms = await prisma.room.findMany({
    where: { status: 'AVAILABLE' },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      contentName: true,
      basePrice: true,
      imageUrls: true,
    }
  });

  const heroTitle = contentMap[`hero.title_${lang}`] || t.heroTitle;
  const heroSubtitle = contentMap[`hero.subtitle_${lang}`] || t.heroSubtitle;
  const aboutHeading = contentMap[`about.heading_${lang}`] || t.introTitle;
  const aboutParagraph = contentMap[`about.paragraph_1_${lang}`] || t.introText;

  const isEs = lang === 'es';

  return (
    <div className={styles.page}>
      <HeaderV2 dict={dict.navigation} lang={lang} />
      
      {/* ═══ HERO ═══ */}
      <section className={styles.hero}>
        <Image 
          src="/hero.jpg" 
          alt={heroTitle} 
          fill 
          priority
          style={{ objectFit: 'cover' }} 
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1>{heroTitle}</h1>
          <p>{heroSubtitle}</p>
        </div>
      </section>

      {/* ═══ WELCOME TEXT ═══ */}
      <section className={styles.welcome}>
        <div className={styles.welcomeInner}>
          <h2>{aboutHeading}</h2>
          <p>{aboutParagraph}</p>
          <Link href={`/${lang}/experiences`} className={styles.link}>
            {isEs ? '¿Deseas saber más sobre Casa Judah?' : 'Want to know more about Casa Judah?'}
          </Link>
        </div>
      </section>

      {/* ═══ FRIEND OF CASA JUDAH ═══ */}
      <section className={styles.splitSection}>
        <div className={styles.splitImage}>
          <Image src="/exterior.jpg" alt="Casa Judah" fill style={{ objectFit: 'cover' }} />
        </div>
        <div className={styles.splitText}>
          <h3>{isEs ? 'Huésped de Casa Judah' : 'Guest of Casa Judah'}</h3>
          <p>
            {isEs 
              ? 'Al reservar directamente con nosotros, eres parte de la familia. Eso significa que nos esforzamos al máximo para cuidar cada detalle de tu estadía. Disfruta de beneficios exclusivos, atención personalizada y la mejor tarifa garantizada.'
              : 'When booking directly with us, you\'re family. That means we go to great lengths to take care of every detail during your stay. Enjoy exclusive benefits, personalized attention, and our best rate guarantee.'
            }
          </p>
          <Link href={`/${lang}/booking`} className={styles.ctaBtn}>
            {isEs ? 'Reservar tu estadía' : 'Book your stay'}
          </Link>
        </div>
      </section>

      {/* ═══ ROOMS CAROUSEL ═══ */}
      <section className={styles.roomsSection}>
        <RoomCarousel rooms={rooms} lang={lang} />
      </section>

      {/* ═══ BREAKFAST / EXPERIENCE ═══ */}
      <section className={styles.splitSectionAlt}>
        <div className={styles.splitTextAlt}>
          <h3>{isEs ? 'Desayuno en Casa Judah' : 'Breakfast at Casa Judah'}</h3>
          <p>
            {isEs 
              ? 'Nuestros huéspedes disfrutan de un desayuno campestre con productos frescos de nuestra granja. Servimos café de origen, pan artesanal recién horneado, huevos de granja, frutas de temporada y más, para comenzar tu día con la energía de la tierra.'
              : 'Our guests enjoy a farm-fresh breakfast with products straight from our land. We serve single-origin coffee, freshly baked bread, farm eggs, seasonal fruits, and more, to start your day with the energy of the earth.'
            }
          </p>
        </div>
        <div className={styles.splitImage}>
          <Image src="/ternero.jpg" alt={isEs ? 'La Granja' : 'The Farm'} fill style={{ objectFit: 'cover' }} />
        </div>
      </section>

      {/* ═══ EXPERIENCE / CAFÉ SECTION ═══ */}
      <section className={styles.twoColCards}>
        <div className={styles.colCard}>
          <div className={styles.colCardImage}>
            <Image src="/piscina.jpg" alt={t.amenitiesTitle} fill style={{ objectFit: 'cover' }} />
          </div>
          <h3>{t.amenitiesTitle}</h3>
          <p>{t.amenitiesText}</p>
          <Link href={`/${lang}/experiences`} className={styles.link}>
            {isEs ? 'Ver más' : 'See more'}
          </Link>
        </div>
        <div className={styles.colCard}>
          <div className={styles.colCardImage}>
            <Image src="/exterior.jpg" alt={t.experiencesTitle} fill style={{ objectFit: 'cover' }} />
          </div>
          <h3>{t.experiencesTitle}</h3>
          <p>{t.experiencesText}</p>
          <Link href={`/${lang}/experiences`} className={styles.link}>
            {isEs ? 'Ver más' : 'See more'}
          </Link>
        </div>
      </section>

      {/* ═══ SUSTAINABILITY / PHILOSOPHY ═══ */}
      <section className={styles.philosophy}>
        <div className={styles.philosophyInner}>
          <h2>{isEs ? 'Sostenibilidad en Casa Judah' : 'Sustainability at Casa Judah'}</h2>
          <p>
            {isEs 
              ? 'En Casa Judah creemos en un futuro sostenible. Nuestra granja opera con principios orgánicos, aprovechamos la energía natural y trabajamos en armonía con la tierra para ofrecer una experiencia que respeta el medio ambiente.'
              : 'At Casa Judah we believe in a sustainable future. Our farm operates on organic principles, we harness natural energy, and we work in harmony with the land to offer an experience that respects the environment.'
            }
          </p>
          <Link href={`/${lang}/experiences`} className={styles.link}>
            {isEs ? 'Ver más' : 'See more'}
          </Link>
        </div>
      </section>

      <FooterV2 lang={lang} />
    </div>
  );
}
