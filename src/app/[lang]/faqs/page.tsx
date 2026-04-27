import { getDictionary } from '@/dictionaries';
import styles from './page.module.css';
import FAQ from '@/components/FAQ';

export default async function FAQsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = (await params) as { lang: 'en' | 'es' };
  const dict = await getDictionary(lang);
  const t = dict.faqsPage;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>
      
      <div className={styles.content}>
        <FAQ title="" items={t.items as any} />
      </div>
    </main>
  );
}
