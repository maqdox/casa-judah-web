import styles from "./page.module.css";
import Link from 'next/link';
import Image from 'next/image';
import { getDictionary } from "@/dictionaries";
import { prisma } from "@/lib/prisma";
import HeaderV2 from "@/components/v2/HeaderV2";
import Footer from "@/components/Footer";

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
    <div className={styles.v2Wrapper}>
      <HeaderV2 dict={dict.navigation} lang={lang} />
      
      <main className={styles.main}>
        {/* 1. HERO — Minimalist & Immersive */}
        <section className={styles.hero}>
          <Image 
            src="/hero.jpg" 
            alt={t.heroTitle} 
            fill 
            priority
            style={{ objectFit: 'cover' }} 
            className={styles.heroImage}
          />
          <div className={styles.heroContent}>
            <span className={styles.heroLabel}>EST. 2024 — OLANCHO</span>
            <h1>{heroTitle}</h1>
            <p>{heroSubtitle}</p>
            <div className={styles.heroActions}>
               <Link href={`/${lang}/booking`} className={styles.mainCta}>{t.bookCTA}</Link>
               <div className={styles.scrollIndicator}>
                 <span>SCROLL</span>
                 <div className={styles.line}></div>
               </div>
            </div>
          </div>
        </section>

        {/* 2. THE STORY — Clean Typography */}
        <section className={styles.story}>
          <div className={styles.storyContent}>
            <h2 className={styles.storyHeading}>{aboutHeading}</h2>
            <div className={styles.storyBody}>
              <p>{aboutParagraph}</p>
              <Link href={`/${lang}/experiences`} className={styles.textLink}>
                {t.experiencesCTA} ↗
              </Link>
            </div>
          </div>
        </section>

        {/* 3. GRID SHOWCASE — Asymmetrical & Airy */}
        <section className={styles.gridShowcase}>
          <div className={styles.gridItem}>
             <div className={styles.imageBox}>
               <Image src="/exterior.jpg" alt={t.roomsTitle} fill style={{ objectFit: 'cover' }} />
             </div>
             <div className={styles.itemInfo}>
               <h3>{t.roomsTitle}</h3>
               <p>{t.roomsText}</p>
               <Link href={`/${lang}/rooms`} className={styles.minimalBtn}>{t.roomsCTA}</Link>
             </div>
          </div>

          <div className={`${styles.gridItem} ${styles.offset}`}>
             <div className={styles.imageBox}>
               <Image src="/ternero.jpg" alt={t.experiencesTitle} fill style={{ objectFit: 'cover' }} />
             </div>
             <div className={styles.itemInfo}>
               <h3>{t.experiencesTitle}</h3>
               <p>{t.experiencesText}</p>
               <Link href={`/${lang}/experiences`} className={styles.minimalBtn}>{t.experiencesCTA}</Link>
             </div>
          </div>
        </section>

        {/* 4. PHILOSOPHY QUOTE */}
        <section className={styles.quoteSection}>
           <div className={styles.quoteBox}>
             <blockquote>
               "Simplicity is the ultimate sophistication. A place where nature meets silence."
             </blockquote>
             <cite>— Casa Judah Philosophy</cite>
           </div>
        </section>

        {/* 5. FINAL INVITE */}
        <section className={styles.finalInvite}>
           <div className={styles.finalContent}>
             <h2>{t.finalCtaTitle}</h2>
             <p>{t.finalCtaText}</p>
             <Link href={`/${lang}/booking`} className={styles.elevatedBtn}>{t.reserveNow}</Link>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
