'use client';

import { useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

const IconCleanliness = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconService = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20H6" />
    <path d="M12 4C8 4 4 7.58 4 12h16c0-4.42-4-8-8-8z" />
    <path d="M12 2v2" />
    <path d="M2 20h20" />
  </svg>
);

const IconFood = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
  </svg>
);

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
    icon 
  }: { 
    value: number; 
    onChange: (val: number) => void; 
    label: string;
    description: string;
    icon: React.ReactNode;
  }) => {
    const getDotColor = (dotNumber: number) => {
      if (dotNumber <= 3) return '#dc3545';
      if (dotNumber <= 6) return '#f5a623';
      return '#2e7d32';
    };

    return (
      <div className={styles.ratingSection}>
        <div className={styles.ratingHeader}>
          <h3 className={styles.ratingTitle}>
            <span className={styles.ratingIcon}>{icon}</span>
            {label}
          </h3>
          <p className={styles.ratingDesc}>{description}</p>
        </div>
        <div className={styles.dotsRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              type="button"
              className={`${styles.dot} ${value >= n ? styles.dotActive : ''}`}
              style={value >= n ? { backgroundColor: getDotColor(n), borderColor: getDotColor(n) } : {}}
              onClick={() => onChange(n)}
              aria-label={`${label}: ${n}`}
            >
              {n}
            </button>
          ))}
        </div>
        {value > 0 && (
          <div className={styles.scoreDisplay} style={{ color: getDotColor(value) }}>
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
            <Image src="/logo_dark.png" alt="Casa Judah Farm Hotel" width={500} height={150} className={styles.logo} />
          </div>

          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>

          <div className={styles.divider} />

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <RatingRow value={cleanliness} onChange={setCleanliness} label={t.cleanliness} description={t.cleanlinessDesc} icon={<IconCleanliness />} />
            <RatingRow value={service} onChange={setService} label={t.service} description={t.serviceDesc} icon={<IconService />} />
            <RatingRow value={food} onChange={setFood} label={t.food} description={t.foodDesc} icon={<IconFood />} />

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
