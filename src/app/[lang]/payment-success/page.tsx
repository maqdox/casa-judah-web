import styles from './page.module.css';
import Link from 'next/link';

export default async function PaymentSuccessPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = (await params) as { lang: 'en' | 'es' };
  
  const isEs = lang === 'es';

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className={styles.title}>
          {isEs ? '¡Gracias por tu pago!' : 'Thank you for your payment!'}
        </h1>
        
        <p className={styles.subtitle}>
          {isEs 
            ? 'Tu transacción se ha procesado con éxito. Hemos enviado un correo con los detalles de tu reservación. Pronto nos pondremos en contacto contigo vía WhatsApp para darte la bienvenida.' 
            : 'Your transaction was successful. We have sent an email with your reservation details. We will contact you soon via WhatsApp to welcome you.'}
        </p>

        <Link href={`/${lang}`} className={styles.button}>
          {isEs ? 'Volver al Inicio' : 'Return to Home'}
        </Link>
      </div>
    </main>
  );
}
