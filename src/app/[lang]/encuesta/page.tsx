'use client';

import { useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
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
    title: isEs ? '¡Evalúa tu Estancia!' : 'Rate your Stay!',
    subtitle: isEs 
      ? 'Tu opinión es muy importante para seguir mejorando Casa Judah.'
      : 'Your opinion is very important to keep improving Casa Judah.',
    cleanliness: isEs ? 'Limpieza' : 'Cleanliness',
    service: isEs ? 'Atención' : 'Service',
    food: isEs ? 'Comida' : 'Food',
    comments: isEs ? 'Comentarios adicionales (opcional)' : 'Additional comments (optional)',
    guestName: isEs ? 'Tu nombre (opcional)' : 'Your name (optional)',
    submit: isEs ? 'Enviar Calificación' : 'Submit Rating',
    submitting: isEs ? 'Enviando...' : 'Submitting...',
    thankYou: isEs ? '¡Gracias por tu opinión!' : 'Thank you for your feedback!',
    thankYouMsg: isEs ? 'Hemos recibido tu calificación con éxito. ¡Esperamos verte pronto de nuevo!' : 'We have successfully received your rating. We hope to see you again soon!',
    backToHome: isEs ? 'Volver al Inicio' : 'Back to Home',
    error: isEs ? 'Ocurrió un error. Por favor intenta de nuevo.' : 'An error occurred. Please try again.',
    errorIncomplete: isEs ? 'Por favor califica todas las categorías (Limpieza, Atención y Comida).' : 'Please rate all categories (Cleanliness, Service and Food).'
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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cleanliness,
            service,
            food,
            comments,
            guestName,
          }),
        });

        if (response.ok) {
          setIsSubmitted(true);
        } else {
          setError(t.error);
        }
      } catch (err) {
        setError(t.error);
      }
    });
  };

  const RatingStars = ({ value, onChange, label }: { value: number, onChange: (val: number) => void, label: string }) => {
    return (
      <div className={styles.ratingGroup}>
        <label className={styles.ratingLabel}>{label}</label>
        <div className={styles.starsContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <button
              key={star}
              type="button"
              className={`${styles.starBtn} ${value >= star ? styles.starActive : ''}`}
              onClick={() => onChange(star)}
            >
              <Star className={styles.starIcon} fill={value >= star ? 'currentColor' : 'none'} />
              <span className={styles.starNumber}>{star}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (isSubmitted) {
    return (
      <main className={styles.container}>
        <div className={styles.card}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.title}>{t.thankYou}</h1>
          <p className={styles.subtitle}>{t.thankYouMsg}</p>
          <button 
            className={styles.submitBtn} 
            onClick={() => router.push(`/${lang}`)}
          >
            {t.backToHome}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t.title}</h1>
        <p className={styles.subtitle}>{t.subtitle}</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <RatingStars value={cleanliness} onChange={setCleanliness} label={t.cleanliness} />
          <RatingStars value={service} onChange={setService} label={t.service} />
          <RatingStars value={food} onChange={setFood} label={t.food} />

          <div className={styles.inputGroup}>
            <label htmlFor="guestName" className={styles.inputLabel}>{t.guestName}</label>
            <input
              type="text"
              id="guestName"
              className={styles.input}
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder={isEs ? 'Ej. Juan Pérez' : 'Ex. John Doe'}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="comments" className={styles.inputLabel}>{t.comments}</label>
            <textarea
              id="comments"
              className={styles.textarea}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              placeholder={isEs ? 'Cuéntanos cómo fue tu experiencia...' : 'Tell us about your experience...'}
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={isPending}
          >
            {isPending ? t.submitting : t.submit}
          </button>
        </form>
      </div>
    </main>
  );
}
