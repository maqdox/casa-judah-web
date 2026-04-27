'use client';

import { useState } from 'react';
import styles from './FAQ.module.css';

interface FAQItem {
  q: string;
  a: string;
}

export default function FAQ({ items, title }: { items: FAQItem[], title: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className={styles.faq}>
      <h2>{title}</h2>
      <div className={styles.list}>
        {items.map((item, i) => (
          <div key={i} className={`${styles.item} ${openIndex === i ? styles.open : ''}`}>
            <button className={styles.question} onClick={() => setOpenIndex(openIndex === i ? null : i)}>
              <span>{item.q}</span>
              <span className={styles.icon}>{openIndex === i ? '−' : '+'}</span>
            </button>
            <div className={styles.answer} style={{ maxHeight: openIndex === i ? '300px' : '0' }}>
              <p>{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
