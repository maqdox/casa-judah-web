import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import BookingForm from './BookingForm';

export const revalidate = 0;

export default async function BookingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = (await params) as { lang: 'en' | 'es' };
  
  const rooms = await prisma.room.findMany({
    where: { status: 'AVAILABLE' }
  });

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>{lang === 'es' ? 'Completa tu Reservación' : 'Complete Your Reservation'}</h1>
        <p>{lang === 'es' ? 'Asegura tu escape pacífico en Casa Judah.' : 'Secure your serene getaway at Casa Judah.'}</p>
      </header>
      
      <div className={styles.formWrapper}>
        <BookingForm rooms={rooms} lang={lang} />
      </div>
    </main>
  );
}
