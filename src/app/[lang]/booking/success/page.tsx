import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function SuccessPage({ 
  searchParams, 
  params 
}: { 
  searchParams: Promise<{ resId: string }>,
  params: Promise<{ lang: string }>
}) {
  const { resId } = await searchParams;
  const { lang } = (await params) as { lang: 'en' | 'es' };
  
  const reservation = await prisma.reservation.findUnique({
    where: { id: resId },
    include: { guest: true, room: true, payment: true }
  });

  if (!reservation) {
    return (
      <main style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <h2>{lang === 'es' ? 'Reservación no encontrada' : 'Reservation Not Found'}</h2>
        <Link href={`/${lang}`}>{lang === 'es' ? 'Volver al Inicio' : 'Return Home'}</Link>
      </main>
    )
  }

  return (
    <main style={{ padding: '6rem 2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ color: 'var(--color-success)', marginBottom: '1rem' }}>
        {lang === 'es' ? '¡Reservación Confirmada!' : 'Booking Confirmed!'}
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '3rem' }}>
        {lang === 'es' ? 'Gracias' : 'Thank you'}, {reservation.guest.name}. {lang === 'es' ? 'Esperamos recibirte pronto en Casa Judah.' : 'We look forward to hosting you at Casa Judah.'}
      </p>

      <div style={{ backgroundColor: 'var(--color-white)', padding: '3rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)', textAlign: 'left' }}>
        <h2 style={{ borderBottom: '1px solid var(--color-beige-dark)', paddingBottom: '1rem', marginBottom: '2rem', color: 'var(--color-olive)' }}>
          {lang === 'es' ? 'Detalles de la Reservación' : 'Reservation Details'}
        </h2>
        
        <p style={{ margin: '0.5rem 0' }}><strong>{lang === 'es' ? 'ID de Reservación:' : 'Reservation ID:'}</strong> {reservation.id}</p>
        <p style={{ margin: '0.5rem 0' }}><strong>{lang === 'es' ? 'Habitación:' : 'Room:'}</strong> {reservation.room.contentName}</p>
        <p style={{ margin: '0.5rem 0' }}><strong>Check-in:</strong> {reservation.checkInDate.toLocaleDateString()}</p>
        <p style={{ margin: '0.5rem 0' }}><strong>Check-out:</strong> {reservation.checkOutDate.toLocaleDateString()}</p>
        <p style={{ margin: '0.5rem 0' }}><strong>{lang === 'es' ? 'Total:' : 'Total Price:'}</strong> L {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(reservation.totalPrice)}</p>
        <br/>
        <p style={{ margin: '0.5rem 0' }}><strong>{lang === 'es' ? 'Estado del Pago:' : 'Payment Status:'}</strong> {reservation.payment?.status}</p>
        <p style={{ margin: '0.5rem 0' }}><strong>{lang === 'es' ? 'Método:' : 'Method:'}</strong> {reservation.payment?.paymentMethod.replace('_', ' ')}</p>
        
        {reservation.payment?.paymentMethod === 'payment_link' && (
           <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--color-champagne)', borderRadius: '4px' }}>
              <p>
                {lang === 'es' 
                  ? `Has solicitado un link de pago por WhatsApp. Nuestro equipo designado contactará a la brevedad a tu número: ` 
                  : `You requested a WhatsApp payment link. Our designated team will reach out to you shortly to the number: `}
                <strong>{reservation.guest.phone}</strong>.
              </p>
           </div>
        )}
      </div>

      <div style={{ marginTop: '4rem' }}>
         <Link href={`/${lang}`} style={{ padding: '1rem 2rem', backgroundColor: 'var(--color-olive)', color: 'white', border: 'none', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {lang === 'es' ? 'Volver al Inicio' : 'Return to Home'}
         </Link>
      </div>
    </main>
  );
}
