'use client';

import { useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

export default function EncuestaPage() {
  const { lang } = useParams() as { lang: string };
  const isEs = lang === 'es';
  const router = useRouter();
  
  const [cleanliness, setCleanliness] = useState<number>(0);
  const [service, setService] = useState<number>(0);
  const [food, setFood] = useState<number>(0);
  const [comments, setComments] = useState('');
  const [guestName, setGuestName] = useState('');
  
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const t = {
    title: isEs ? 'Evalúa tu Estancia' : 'Rate your Stay',
    subtitle: isEs 
      ? 'Tu opinión nos ayuda a seguir creando experiencias inolvidables.'
      : 'Your feedback helps us continue creating unforgettable experiences.',
    cleanliness: isEs ? 'Limpieza' : 'Cleanliness',
    cleanlinessDesc: isEs ? '¿Cómo calificarías la limpieza de las instalaciones?' : 'How would you rate the cleanliness of the facilities?',
    service: isEs ? 'Atención' : 'Service',
    serviceDesc: isEs ? '¿Cómo fue el trato y la atención del personal?' : 'How was the staff treatment and attention?',
    food: isEs ? 'Comida' : 'Food',
    foodDesc: isEs ? '¿Cómo calificarías la calidad de la comida?' : 'How would you rate the food quality?',
    comments: isEs ? 'Comentarios adicionales' : 'Additional comments',
    guestName: isEs ? 'Tu nombre' : 'Your name',
    optional: isEs ? 'opcional' : 'optional',
    submit: isEs ? 'Enviar Calificación' : 'Submit Rating',
    submitting: isEs ? 'Enviando...' : 'Submitting...',
    thankYou: isEs ? '¡Muchas Gracias!' : 'Thank You!',
    thankYouMsg: isEs ? 'Tu opinión es muy valiosa para nosotros. Esperamos verte pronto de nuevo en Casa Judah.' : 'Your feedback is very valuable to us. We hope to see you again soon at Casa Judah.',
    backToHome: isEs ? 'Visitar Sitio Web' : 'Visit Website',
    error: isEs ? 'Ocurrió un error. Por favor intenta de nuevo.' : 'An error occurred. Please try again.',
    errorIncomplete: isEs ? 'Por favor califica las tres categorías antes de enviar.' : 'Please rate all three categories before submitting.'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (cleanliness === 0 || service === 0 || food === 0) {
      setError(t.errorIncomplete);
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cleanliness, service, food, comments, guestName }),
        });

        if (response.ok) {
          setIsSubmitted(true);
        } else {
          setError(t.error);
        }
      } catch {
        setError(t.error);
      }
    });
  };

  const RatingRow = ({ 
    value, 
    onChange, 
    label, 
    description,
    emoji 
  }: { 
    value: number; 
    onChange: (val: number) => void; 
    label: string;
    description: string;
    emoji: string;
  }) => {
    const getColor = (score: number) => {
      if (score <= 3) return '#e74c3c';
      if (score <= 5) return '#f39c12';
      if (score <= 7) return '#c9a96e';
      return '#4E583E';
    };

    return (
      <div className={styles.ratingSection}>
        <div className={styles.ratingHeader}>
          <span className={styles.ratingEmoji}>{emoji}</span>
          <div>
            <h3 className={styles.ratingTitle}>{label}</h3>
            <p className={styles.ratingDesc}>{description}</p>
          </div>
        </div>
        <div className={styles.dotsRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              type="button"
              className={`${styles.dot} ${value >= n ? styles.dotActive : ''}`}
              style={value >= n ? { backgroundColor: getColor(value), borderColor: getColor(value) } : {}}
              onClick={() => onChange(n)}
              aria-label={`${label}: ${n}`}
            >
              {n}
            </button>
          ))}
        </div>
        {value > 0 && (
          <div className={styles.scoreDisplay} style={{ color: getColor(value) }}>
            {value}/10
          </div>
        )}
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <main className={styles.page}>
        <div className={styles.wrapper}>
          <div className={styles.card}>
            <div className={styles.successCheck}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <h1 className={styles.title}>{t.thankYou}</h1>
            <p className={styles.subtitle}>{t.thankYouMsg}</p>
            <button className={styles.submitBtn} onClick={() => router.push(`/${lang}`)}>
              {t.backToHome}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.logoWrap}>
            <Image src="/logo_dark_final.png" alt="Casa Judah" width={80} height={80} className={styles.logo} />
          </div>

          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>

          <div className={styles.divider} />

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <RatingRow value={cleanliness} onChange={setCleanliness} label={t.cleanliness} description={t.cleanlinessDesc} emoji="✨" />
            <RatingRow value={service} onChange={setService} label={t.service} description={t.serviceDesc} emoji="🤝" />
            <RatingRow value={food} onChange={setFood} label={t.food} description={t.foodDesc} emoji="🍽️" />

            <div className={styles.divider} />

            <div className={styles.fieldGroup}>
              <label htmlFor="guestName" className={styles.fieldLabel}>
                {t.guestName} <span className={styles.optionalTag}>({t.optional})</span>
              </label>
              <input
                type="text"
                id="guestName"
                className={styles.field}
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder={isEs ? 'Ej. Juan Pérez' : 'e.g. John Doe'}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="comments" className={styles.fieldLabel}>
                {t.comments} <span className={styles.optionalTag}>({t.optional})</span>
              </label>
              <textarea
                id="comments"
                className={`${styles.field} ${styles.textarea}`}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
                placeholder={isEs ? 'Cuéntanos tu experiencia...' : 'Tell us about your experience...'}
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isPending}>
              {isPending ? t.submitting : t.submit}
            </button>
          </form>
        </div>

        <p className={styles.footer}>Casa Judah Farm Hotel · Copán Ruinas, Honduras</p>
      </div>
    </main>
  );
}
