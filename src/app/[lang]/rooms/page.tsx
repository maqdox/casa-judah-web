import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';

import { getDictionary } from '@/dictionaries';

export const revalidate = 0;

export default async function RoomsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = (await params) as { lang: 'en' | 'es' };
  const dict = await getDictionary(lang);
  const t = dict.roomsPage;

  const rooms = await prisma.room.findMany({
    where: { status: 'AVAILABLE' }
  });

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>
      
      <div className={styles.grid}>
        {rooms.map((room) => {
          const images = room.imageUrls.split('|');
          const mainImage = images[0] || '/placeholder.webp';

          return (
            <article key={room.id} className={styles.card}>
              <div className={`${styles.imageWrapper} luxury-frame`}>
                <Image 
                  src={mainImage} 
                  alt={room.contentName} 
                  fill 
                  style={{ objectFit: 'cover' }} 
                />
              </div>
              <div className={styles.content}>
                <h2>{room.contentName}</h2>
                <p className={styles.description}>{room.description}</p>
                <div className={styles.details}>
                  <span>{lang === 'es' ? 'Hasta' : 'Up to'} {room.capacity} {lang === 'es' ? 'Huéspedes' : 'Guests'}</span>
                  <span className={styles.price}>L {room.basePrice.toFixed(2)} {t.pricePerNight}</span>
                </div>
                <Link href={`/${lang}/booking?roomId=${room.id}`} className={styles.bookButton}>{t.bookBtn}</Link>
              </div>
            </article>
          )
        })}
      </div>
    </main>
  );
}
