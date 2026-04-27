import styles from "../page.module.css";
import Link from 'next/link';
import Image from 'next/image';
import { getDictionary } from "@/dictionaries";
import { prisma } from "@/lib/prisma";
import HeaderV2 from "@/components/v2/HeaderV2";
import FooterV2 from "@/components/v2/FooterV2";

export default async function HomeV2({ params }: { params: Promise<{ lang: string }> }) {
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
      <HeaderV2 dict={dict.navigation} lang={lang} />
      
      {/* 1. HERO — Cinematic entrance */}
      <section className={styles.hero}>
        <Image 
          src="/exterior.jpg" 
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

      {/* 2. BRAND PHILOSOPHY (Terracota: #804639) */}
      <section className={styles.intro} style={{ backgroundColor: '#804639', color: '#FFFFFF' }}>
        <div className={styles.introText}>
          <h2 style={{ color: '#FFFFFF' }}>{aboutHeading}</h2>
          <p style={{ color: '#FDFBF7' }}>{aboutParagraph}</p>
        </div>
      </section>

      {/* 3. ROOMS / STAY (Blanco: #FFFFFF) */}
      <section className={styles.showcaseSection} style={{ backgroundColor: '#FFFFFF' }}>
        <div className={styles.showcaseImage}>
          <div className={`${styles.showcaseImageInner} arch-frame`}>
            <Image src="/hero.jpg" alt={t.roomsTitle} fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
        <div className={styles.showcaseText}>
          <h2 style={{ color: 'var(--color-dark-brown)' }}>{t.roomsTitle}</h2>
          <p style={{ color: '#6b6560' }}>{t.roomsText}</p>
          <Link href={`/${lang}/rooms`} className={styles.linkButton}>{t.roomsCTA}</Link>
        </div>
      </section>

      {/* 4. EXPERIENCES / FARM (Marrón Medio: #A88E6D) */}
      <section className={`${styles.showcaseSection} ${styles.reverse}`} style={{ backgroundColor: '#A88E6D', color: '#FFFFFF' }}>
        <div className={styles.showcaseImage}>
          <div className={`${styles.showcaseImageInner} luxury-frame`}>
            <Image src="/ternero.jpg" alt={t.experiencesTitle} fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
        <div className={styles.showcaseText}>
          <h2 style={{ color: '#FFFFFF' }}>{t.experiencesTitle}</h2>
          <p style={{ color: '#FDFBF7' }}>{t.experiencesText}</p>
          <Link href={`/${lang}/experiences`} className={styles.linkButton} style={{ color: '#FFFFFF', borderColor: '#FFFFFF' }}>{t.experiencesCTA}</Link>
        </div>
      </section>

      {/* 5. AMENITIES / WELLNESS (Blanco: #FFFFFF) */}
      <section className={styles.showcaseSection} style={{ backgroundColor: '#FFFFFF' }}>
        <div className={styles.showcaseImage}>
          <div className={`${styles.showcaseImageInner} arch-frame`}>
            <Image src="/piscina.jpg" alt={t.amenitiesTitle} fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
        <div className={styles.showcaseText}>
          <h2 style={{ color: 'var(--color-dark-brown)' }}>{t.amenitiesTitle}</h2>
          <p style={{ color: '#6b6560' }}>{t.amenitiesText}</p>
        </div>
      </section>

      {/* 5.5. LOCATION / MAP (Verde Olivo: #4E583E) */}
      <section className={styles.locationSection} style={{ padding: '4rem 2rem', backgroundColor: '#4E583E', color: '#FFFFFF' }}>
        <div style={{ textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: '#FFFFFF', marginBottom: '1rem', fontWeight: 400 }}>{t.locationTitle}</h2>
          <p style={{ color: '#E8EBE4', marginBottom: '2rem' }}>{t.locationText}</p>
          <div style={{ width: '100%', height: '400px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15440.098877142724!2d-85.7619285!3d14.7970367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f6c6596269b0217%3A0x5e2fff1ae76e0c2e!2sCasa%20Judah%20Farm%20Hotel!5e0!3m2!1ses!2shn!4v1700000000000!5m2!1ses!2shn" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA — Conversion (Franja Blanca) */}
      <section className={styles.finalCta} style={{ backgroundColor: '#FFFFFF', color: 'var(--color-dark-brown)' }}>
        <h2 style={{ color: 'var(--color-dark-brown)' }}>{t.finalCtaTitle}</h2>
        <p style={{ color: '#6b6560' }}>{t.finalCtaText}</p>
        <Link href={`/${lang}/booking`} className={styles.ctaButton} style={{ backgroundColor: 'var(--color-dark-brown)', color: '#FFFFFF' }}>{t.reserveNow}</Link>
      </section>

      <FooterV2 lang={lang} />
    </main>
  );
}
