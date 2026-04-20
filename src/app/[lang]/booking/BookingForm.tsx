'use client'

import { useState, Suspense } from 'react';
import { createReservation } from '../../actions';
import { useSearchParams, useRouter } from 'next/navigation';
import PhoneInput from '@/components/PhoneInput';
import styles from './page.module.css';

function BookingFormContent({ rooms, lang }: { rooms: any[], lang: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialRoomId = searchParams.get('roomId') || '';

  const [roomId, setRoomId] = useState(initialRoomId);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedRoom = rooms.find(r => r.id === roomId);
  
  let subtotal = 0;
  let tax = 0;
  let totalPrice = 0;
  if (selectedRoom && checkIn && checkOut) {
    const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24));
    if (days > 0) {
      subtotal = days * selectedRoom.basePrice;
      tax = subtotal * 0.15;
      totalPrice = subtotal + tax;
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData(e.currentTarget);
      const resId = await createReservation(formData);
      router.push(`/${lang}/booking/success?resId=${resId}`);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  const t = lang === 'es' ? {
    section1: "1. Fechas de Viaje",
    checkIn: "Fecha de Llegada",
    checkOut: "Fecha de Salida",
    section2: "2. Selecciona Alojamiento",
    roomType: "Tipo de Habitación",
    selectRoom: "Selecciona una habitación...",
    night: "noche",
    section3: "3. Detalles del Huésped",
    name: "Nombre Completo",
    email: "Correo Electrónico",
    phone: "Teléfono",
    section4: "4. Método de Pago",
    optFull: "Pagar Monto Total (Tarjeta)",
    optPart: "Pagar 50% de Depósito",
    optHotel: "Pagar en el Hotel",
    optBank: "Transferencia Bancaria",
    optLink: "Solicitar Link de Pago (WhatsApp)",
    helper: "* Pasarela flexible para simular diferentes métodos.",
    summaryTitle: "Resumen de Reservación",
    nightsLabel: "noches",
    cleaning: "Gastos de Limpieza",
    included: "Incluido",
    subtotalLabel: "Subtotal",
    taxLabel: "Impuesto (15%)",
    total: "Total a Pagar:",
    rules: "Acepto las Reglas de la Casa, incluyendo la política estricta de no fumar y cancelaciones.",
    submit: "Confirmar Reservación",
    processing: "Procesando..."
  } : {
    section1: "1. Travel Dates",
    checkIn: "Check-in Date",
    checkOut: "Check-out Date",
    section2: "2. Select Accommodation",
    roomType: "Room Type",
    selectRoom: "Select a room...",
    night: "night",
    section3: "3. Guest Details",
    name: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    section4: "4. Payment Method",
    optFull: "Pay Full Amount Now (Credit Card)",
    optPart: "Pay 50% Deposit Now",
    optHotel: "Pay at Hotel",
    optBank: "Bank Transfer",
    optLink: "Request WhatsApp Payment Link",
    helper: "* Flexible simulation integration for different gateways.",
    summaryTitle: "Reservation Summary",
    nightsLabel: "nights",
    cleaning: "Cleaning & Resort Fees",
    included: "Included",
    subtotalLabel: "Subtotal",
    taxLabel: "Tax (15%)",
    total: "Total to Pay:",
    rules: "I agree to the House Rules, including the strict no-smoking policy, and understand the cancellation terms.",
    submit: "Confirm Reservation",
    processing: "Processing..."
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.sectionTitle}>{t.section1}</div>
      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label>{t.checkIn}</label>
          <input type="date" name="checkIn" required onChange={e => setCheckIn(e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label>{t.checkOut}</label>
          <input type="date" name="checkOut" required onChange={e => setCheckOut(e.target.value)} />
        </div>
      </div>

      <div className={styles.sectionTitle}>{t.section2}</div>
      <div className={styles.formGroup}>
        <label>{t.roomType}</label>
        <select name="roomId" required value={roomId} onChange={e => setRoomId(e.target.value)}>
          <option value="">{t.selectRoom}</option>
          {rooms.map(room => (
            <option key={room.id} value={room.id}>
              {room.contentName} - L {new Intl.NumberFormat('en-US').format(room.basePrice)}/{t.night}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.sectionTitle}>{t.section3}</div>
      <div className={styles.formGroup}>
        <label>{t.name}</label>
        <input type="text" name="name" required placeholder="Jane Doe" />
      </div>
      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label>{t.email}</label>
          <input type="email" name="email" required placeholder="contact@example.com" />
        </div>
        <div className={styles.formGroup}>
          <label>{t.phone}</label>
          <PhoneInput name="phone" />
        </div>
      </div>

      <div className={styles.sectionTitle}>{t.section4}</div>
      <div className={styles.formGroup}>
        <select name="paymentMethod" required>
          <option value="full_card">{t.optFull}</option>
          <option value="partial_card">{t.optPart}</option>
          <option value="hotel">{t.optHotel}</option>
          <option value="bank_transfer">{t.optBank}</option>
          <option value="payment_link">{t.optLink}</option>
        </select>
        <p className={styles.helperText}>{t.helper}</p>
      </div>

      {totalPrice > 0 && selectedRoom && checkIn && checkOut && (
        <div className={styles.financialSummary}>
          <div className={styles.summaryTitle}>{t.summaryTitle}</div>
          
          <div className={styles.summaryRow}>
            <span>{selectedRoom.contentName} (L {new Intl.NumberFormat('en-US').format(selectedRoom.basePrice)} x {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24))} {t.nightsLabel})</span>
            <span>L {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(subtotal)}</span>
          </div>

          <div className={styles.summaryRow}>
            <span>{t.taxLabel}</span>
            <span>L {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(tax)}</span>
          </div>
          
          <div className={styles.summaryRow}>
            <span>{t.cleaning}</span>
            <span>{t.included}</span>
          </div>
          
          <div className={styles.summaryTotal}>
            <span>{t.total}</span>
            <span>L {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(totalPrice)}</span>
          </div>
        </div>
      )}

      <div className={styles.checkboxGroup}>
        <input type="checkbox" id="rulesAccepted" name="rulesAccepted" required />
        <label htmlFor="rulesAccepted">{t.rules}</label>
      </div>

      <button type="submit" className={styles.submitButton} disabled={loading}>
        {loading ? t.processing : t.submit}
      </button>
    </form>
  )
}

export default function BookingForm({ rooms, lang }: { rooms: any[], lang: string }) {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <BookingFormContent rooms={rooms} lang={lang} />
    </Suspense>
  )
}
