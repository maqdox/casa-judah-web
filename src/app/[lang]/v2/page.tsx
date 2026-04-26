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
    select: { id: true, contentName: true, basePrice: true, imageUrls: true }
  });

  const heroTitle = contentMap[`hero.title_${lang}`] || t.heroTitle;
  const heroSubtitle = contentMap[`hero.subtitle_${lang}`] || t.heroSubtitle;
  const aboutHeading = contentMap[`about.heading_${lang}`] || t.introTitle;
  const aboutParagraph = contentMap[`about.paragraph_1_${lang}`] || t.introText;
  const isEs = lang === 'es';

  return (
    <div className={styles.page}>
      <HeaderV2 dict={dict.navigation} lang={lang} />

      {/* ═══ 1. HERO — Full bleed cinematic ═══ */}
      <section className={styles.hero}>
        <Image src="/hero.jpg" alt={heroTitle} fill priority style={{ objectFit: 'cover' }} />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.heroTag}>OLANCHO, HONDURAS</span>
          <h1>{heroTitle}</h1>
          <p>{heroSubtitle}</p>
          <Link href={`/${lang}/booking`} className={styles.heroBtn}>{t.bookCTA}</Link>
        </div>
      </section>

      {/* ═══ 2. WHO WE ARE — Centered editorial text ═══ */}
      <section className={styles.whoWeAre}>
        <span className={styles.sectionTag}>{isEs ? 'QUIÉNES SOMOS' : 'WHO WE ARE'}</span>
        <h2>{aboutHeading}</h2>
        <p>{aboutParagraph}</p>
        <Link href={`/${lang}/experiences`} className={styles.textCta}>
          {isEs ? 'DESCUBRIR MÁS' : 'DISCOVER MORE'}
        </Link>
      </section>

      {/* ═══ 3. FULL BLEED IMAGE — Garden/Farm ═══ */}
      <section className={styles.fullBleed}>
        <Image src="/ternero.jpg" alt="Casa Judah Farm" fill style={{ objectFit: 'cover' }} />
      </section>

      {/* ═══ 4. THE EXPERIENCE — Asymmetric image + text ═══ */}
      <section className={styles.featureBlock}>
        <div className={styles.featureImage}>
          <Image src="/piscina.jpg" alt={t.experiencesTitle} fill style={{ objectFit: 'cover' }} />
        </div>
        <div className={styles.featureText}>
          <span className={styles.sectionTag}>{isEs ? 'LA EXPERIENCIA' : 'THE EXPERIENCE'}</span>
          <h2>{t.experiencesTitle}</h2>
          <p>{t.experiencesText}</p>
          <Link href={`/${lang}/experiences`} className={styles.textCta}>
            {isEs ? 'EXPLORAR' : 'EXPLORE'}
          </Link>
        </div>
      </section>

      {/* ═══ 5. ROOMS — Horizontal carousel ═══ */}
      <section className={styles.roomsSection}>
        <div className={styles.roomsHeader}>
          <span className={styles.sectionTag}>{isEs ? 'ALOJAMIENTO' : 'ACCOMMODATION'}</span>
          <h2>{t.roomsTitle}</h2>
          <p>{t.roomsText}</p>
        </div>
        <RoomCarousel rooms={rooms} lang={lang} />
      </section>

      {/* ═══ 6. STAY — Reverse asymmetric ═══ */}
      <section className={`${styles.featureBlock} ${styles.featureReverse}`}>
        <div className={styles.featureImage}>
          <Image src="/exterior.jpg" alt={t.roomsTitle} fill style={{ objectFit: 'cover' }} />
        </div>
        <div className={styles.featureText}>
          <span className={styles.sectionTag}>{isEs ? 'TU RETIRO' : 'YOUR RETREAT'}</span>
          <h2>{isEs ? 'Huésped de Casa Judah' : 'Guest of Casa Judah'}</h2>
          <p>
            {isEs
              ? 'Al reservar directamente con nosotros, eres parte de la familia. Nos esforzamos al máximo para cuidar cada detalle de tu estadía. Disfruta de beneficios exclusivos, atención personalizada y la mejor tarifa garantizada.'
              : 'When booking directly with us, you\'re family. We go to great lengths to take care of every detail during your stay. Enjoy exclusive benefits, personalized attention, and our best rate guarantee.'}
          </p>
          <Link href={`/${lang}/booking`} className={styles.solidBtn}>
            {isEs ? 'RESERVAR TU ESTADÍA' : 'BOOK YOUR STAY'}
          </Link>
        </div>
      </section>

      {/* ═══ 7. QUOTE — Philosophy ═══ */}
      <section className={styles.quoteBlock}>
        <blockquote>
          "{isEs
            ? 'Nuestro propósito es preservar la conexión auténtica entre el ser humano, la tierra y los animales. Un espacio donde el tiempo se detiene.'
            : 'Our purpose is to preserve the authentic connection between people, the land, and animals. A space where time stands still.'}"
        </blockquote>
      </section>

      {/* ═══ 8. FINAL CTA ═══ */}
      <section className={styles.finalCta}>
        <Image src="/hero.jpg" alt="" fill style={{ objectFit: 'cover' }} />
        <div className={styles.finalOverlay} />
        <div className={styles.finalContent}>
          <h2>{t.finalCtaTitle}</h2>
          <p>{t.finalCtaText}</p>
          <Link href={`/${lang}/booking`} className={styles.heroBtn}>{t.reserveNow}</Link>
        </div>
      </section>

      <FooterV2 lang={lang} />
    </div>
  );
}
