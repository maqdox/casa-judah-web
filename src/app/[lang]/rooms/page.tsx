import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';
import RoomCard from './RoomCard';

import { getDictionary } from '@/dictionaries';

export const revalidate = 0;

// Force revalidation for layout updates
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
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} lang={lang} dict={dict} />
        ))}
      </div>
    </main>
  );
}
