import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import { Star } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Reseñas de Clientes</h1>
        <p className={styles.subtitle}>Calificaciones recibidas mediante el formulario de WhatsApp.</p>
      </header>

      {reviews.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Aún no hay reseñas registradas.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {reviews.map((review) => {
            const average = ((review.cleanliness + review.service + review.food) / 3).toFixed(1);
            
            return (
              <div key={review.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.guestInfo}>
                    <h3 className={styles.guestName}>{review.guestName || 'Anónimo'}</h3>
                    <span className={styles.date}>
                      {new Date(review.createdAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className={styles.averageScore}>
                    <Star size={16} fill="currentColor" />
                    <span>{average}</span>
                  </div>
                </div>

                <div className={styles.scoresGrid}>
                  <div className={styles.scoreItem}>
                    <span className={styles.scoreLabel}>Limpieza</span>
                    <div className={styles.scoreValue}>
                      <span className={styles.scoreBar} style={{ width: `${(review.cleanliness / 10) * 100}%` }}></span>
                    </div>
                    <span className={styles.scoreNumber}>{review.cleanliness}/10</span>
                  </div>
                  <div className={styles.scoreItem}>
                    <span className={styles.scoreLabel}>Atención</span>
                    <div className={styles.scoreValue}>
                      <span className={styles.scoreBar} style={{ width: `${(review.service / 10) * 100}%` }}></span>
                    </div>
                    <span className={styles.scoreNumber}>{review.service}/10</span>
                  </div>
                  <div className={styles.scoreItem}>
                    <span className={styles.scoreLabel}>Comida</span>
                    <div className={styles.scoreValue}>
                      <span className={styles.scoreBar} style={{ width: `${(review.food / 10) * 100}%` }}></span>
                    </div>
                    <span className={styles.scoreNumber}>{review.food}/10</span>
                  </div>
                </div>

                {review.comments && (
                  <div className={styles.comments}>
                    <p>"{review.comments}"</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
