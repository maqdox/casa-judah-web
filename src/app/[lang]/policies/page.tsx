import styles from './page.module.css';
import { getDictionary } from '@/dictionaries';

export default async function PoliciesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = (await params) as { lang: 'en' | 'es' };
  const dict = await getDictionary(lang);
  const t = dict.policies;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      <section className={styles.policySection}>
        {t.sections.map((section: { heading: string; intro?: string; items?: string[]; subsections?: { heading: string; items: string[] }[] }, i: number) => (
          <div key={i} className={styles.policyCard}>
            <h2>{section.heading}</h2>
            {section.intro && <p className={styles.intro}>{section.intro}</p>}
            {section.items && (
              <ul>
                {section.items.map((item: string, j: number) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            )}
            {section.subsections && section.subsections.map((sub: { heading: string; items: string[] }, k: number) => (
              <div key={k} className={styles.subsection}>
                <h3>{sub.heading}</h3>
                <ul>
                  {sub.items.map((item: string, l: number) => (
                    <li key={l}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </section>
    </main>
  );
}
