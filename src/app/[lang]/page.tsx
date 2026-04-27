import styles from "./page.module.css";
import Link from 'next/link';
import Image from 'next/image';
import { getDictionary } from "@/dictionaries";
import { prisma } from "@/lib/prisma";
import FAQ from '@/components/FAQ';

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

      {/* 5.5. LOCATION / MAP */}
      <section className={styles.locationSection} style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--color-dark-brown)', marginBottom: '1rem', fontWeight: 400 }}>{t.locationTitle}</h2>
        <p style={{ color: '#555', marginBottom: '2rem' }}>{t.locationText}</p>
        <div style={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15440.098877142724!2d-85.88219!3d14.85191!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f7009001b97ad89%3A0x6b77ad92dc5ccb9!2sCasa%20Judah%20Farm%20Hotel!5e0!3m2!1sen!2shn!4v1700000000000!5m2!1sen!2shn" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </section>

      {/* 5.6. FAQ */}
      <FAQ title={t.faqTitle} items={t.faqItems as any} />

      {/* 6. FINAL CTA — Conversion */}
      <section className={styles.finalCta}>
        <h2>{t.finalCtaTitle}</h2>
        <p>{t.finalCtaText}</p>
        <Link href={`/${lang}/booking`} className={styles.ctaButton}>{t.reserveNow}</Link>
      </section>
    </main>
  );
}
