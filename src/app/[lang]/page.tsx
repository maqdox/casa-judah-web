import styles from "./page.module.css";
import Link from 'next/link';
import Image from 'next/image';
import { getDictionary } from "@/dictionaries";
import { prisma } from "@/lib/prisma";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = (await params) as { lang: 'en' | 'es' };
  const dict = await getDictionary(lang);
  const t = dict.home;

  const dbContent = await prisma.siteContent.findMany();
  const contentMap: Record<string, string> = {};
  dbContent.forEach(item => {
    contentMap[`${item.section}.${item.key}`] = item.value;
  });

  const heroTitle = contentMap[`hero.title_${lang}`] || t.heroTitle;
  const heroSubtitle = contentMap[`hero.subtitle_${lang}`] || t.heroSubtitle;
  const aboutHeading = contentMap[`about.heading_${lang}`] || t.introTitle;
  const aboutParagraph = contentMap[`about.paragraph_1_${lang}`] || t.introText;

  return (
    <main className={styles.main}>
      {/* 1. HERO — Cinematic entrance */}
      <section className={styles.hero}>
        <Image 
          src="/hero.jpg" 
          alt={t.heroTitle} 
          fill 
          priority
          style={{ objectFit: 'cover' }} 
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1>{heroTitle}</h1>
          <p>{heroSubtitle}</p>
          <Link href={`/${lang}/booking`} className={styles.ctaButton}>{t.bookCTA}</Link>
        </div>
      </section>

      {/* 2. BRAND PHILOSOPHY */}
      <section className={styles.intro}>
        <div className={styles.introText}>
          <h2>{aboutHeading}</h2>
          <p>{aboutParagraph}</p>
        </div>
      </section>

      {/* 3. ROOMS / STAY */}
      <section className={styles.showcaseSection}>
        <div className={styles.showcaseImage}>
          <div className={`${styles.showcaseImageInner} arch-frame`}>
            <Image src="/exterior.jpg" alt={t.roomsTitle} fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
        <div className={styles.showcaseText}>
          <h2>{t.roomsTitle}</h2>
          <p>{t.roomsText}</p>
          <Link href={`/${lang}/rooms`} className={styles.linkButton}>{t.roomsCTA}</Link>
        </div>
      </section>

      {/* 4. EXPERIENCES / FARM */}
      <section className={`${styles.showcaseSection} ${styles.reverse}`}>
        <div className={styles.showcaseImage}>
          <div className={`${styles.showcaseImageInner} luxury-frame`}>
            <Image src="/ternero.jpg" alt={t.experiencesTitle} fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
        <div className={styles.showcaseText}>
          <h2>{t.experiencesTitle}</h2>
          <p>{t.experiencesText}</p>
          <Link href={`/${lang}/experiences`} className={styles.linkButton}>{t.experiencesCTA}</Link>
        </div>
      </section>

      {/* 5. AMENITIES / WELLNESS */}
      <section className={styles.showcaseSection}>
        <div className={styles.showcaseImage}>
          <div className={`${styles.showcaseImageInner} arch-frame`}>
            <Image src="/piscina.jpg" alt={t.amenitiesTitle} fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
        <div className={styles.showcaseText}>
          <h2>{t.amenitiesTitle}</h2>
          <p>{t.amenitiesText}</p>
        </div>
      </section>

      {/* 6. FINAL CTA — Conversion */}
      <section className={styles.finalCta}>
        <h2>{t.finalCtaTitle}</h2>
        <p>{t.finalCtaText}</p>
        <Link href={`/${lang}/booking`} className={styles.ctaButton}>{t.reserveNow}</Link>
      </section>
    </main>
  );
}
