'use client'

import { useState, useEffect, Suspense } from 'react';
import { createReservation } from '../../actions';
import { useSearchParams, useRouter } from 'next/navigation';
import PhoneInput from '@/components/PhoneInput';
import styles from './page.module.css';

function BookingFormContent({ rooms, lang }: { rooms: any[], lang: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialRoomId = searchParams.get('roomId') || '';

  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>(initialRoomId ? [initialRoomId] : []);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // Date helpers
  const today = new Date().toISOString().split('T')[0];
  const minCheckOut = checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0] : today;

  const handleCheckInChange = (val: string) => {
    setCheckIn(val);
    // Reset check-out if it's now invalid
    if (checkOut && val >= checkOut) setCheckOut('');
  };
  const [paymentMethod, setPaymentMethod] = useState('full_card');
  const [earlyCheckIn, setEarlyCheckIn] = useState(false);
  const [lateCheckOut, setLateCheckOut] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (checkIn && checkOut) {
      const checkAvailability = async () => {
        setIsCheckingAvailability(true);
        try {
          const newAvailabilityMap: Record<string, boolean> = {};
          await Promise.all(rooms.map(async (room) => {
            const res = await fetch(`/api/rooms/availability?roomId=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}`);
            const data = await res.json();
            if (res.ok && typeof data.available === 'boolean') {
              newAvailabilityMap[room.id] = data.available;
            } else {
              newAvailabilityMap[room.id] = false;
            }
          }));
          setAvailabilityMap(newAvailabilityMap);
          // Auto-deselect unavailable rooms
          setSelectedRoomIds(prev => prev.filter(id => newAvailabilityMap[id]));
        } catch (e) {
          setAvailabilityMap({});
        } finally {
          setIsCheckingAvailability(false);
        }
      };
      checkAvailability();
    } else {
      setAvailabilityMap({});
    }
  }, [checkIn, checkOut, rooms]);

  const toggleRoom = (id: string) => {
    setSelectedRoomIds(prev => 
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  const selectedRooms = rooms.filter(r => selectedRoomIds.includes(r.id));
  
  let subtotal = 0;
  let tax = 0;
  let totalPrice = 0;
  let addonsTotal = 0;
  const numRooms = selectedRooms.length;

  if (numRooms > 0 && checkIn && checkOut) {
    const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24));
    if (days > 0) {
      subtotal = selectedRooms.reduce((acc, r) => acc + (days * r.basePrice), 0);
      if (earlyCheckIn) addonsTotal += 500 * numRooms;
      if (lateCheckOut) addonsTotal += 500 * numRooms;
      tax = (subtotal + addonsTotal) * 0.15;
      totalPrice = subtotal + addonsTotal + tax;
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (selectedRoomIds.length === 0) {
      setError(lang === 'es' ? 'Debes seleccionar al menos una habitación.' : 'You must select at least one room.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const phoneInput = formData.get('phone') as string;
      const emailInput = formData.get('email') as string;
      const checkInD = formData.get('checkIn') as string;
      const checkOutD = formData.get('checkOut') as string;
      const method = formData.get('paymentMethod') as string;

      // Card payments go through Pagadito
      if (method === 'full_card' || method === 'partial_card') {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomIds: selectedRoomIds,
            checkIn: checkInD,
            checkOut: checkOutD,
            name,
            email: emailInput,
            phone: phoneInput,
            paymentMethod: method,
            earlyCheckIn,
            lateCheckOut
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Error al procesar el pago.');
        }

        // Redirect to Pagadito payment page
        window.location.href = data.redirectUrl;
        return;
      }

      // Non-card payments
      // Append all roomIds to formData so server action can process them
      formData.delete('roomId');
      selectedRoomIds.forEach(id => formData.append('roomIds', id));

      const resId = await createReservation(formData);

      let whatsappMsgExtra = '';
      if (method === 'payment_link') {
        whatsappMsgExtra = `\nPor favor envíenme un *Link de Pago* para confirmar esta solicitud.`;
      } else if (method === 'bank_transfer') {
        whatsappMsgExtra = `\nHe adjuntado mi comprobante de transferencia en su sistema.`;
      } else {
        whatsappMsgExtra = `\nPor favor confírmenme disponibilidad.`;
      }

      let addonsText = '';
      if (earlyCheckIn || lateCheckOut) {
        addonsText = `*Servicios Adicionales:* ${earlyCheckIn ? 'Early Check-in (x' + numRooms + ')' : ''} ${lateCheckOut ? 'Late Check-out (x' + numRooms + ')' : ''}\n`;
      }

      const roomNames = selectedRooms.map(r => r.contentName).join(', ');

      const whatsappMessage = `*Nueva Solicitud de Reservación*\n\n` +
        `*Huésped:* ${name}\n` +
        `*Teléfono:* ${phoneInput}\n` +
        `*Habitaciones:* ${roomNames}\n` +
        `*Fechas:* ${checkInD} al ${checkOutD}\n` +
        addonsText +
        `*Total:* L ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(totalPrice)}\n` +
        `*Pago:* ${method}\n` +
        whatsappMsgExtra;

      const whatsappUrl = `https://wa.me/50498316555?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');

      // Use the returned ID for success page
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
    selectRoom: "Selecciona una o más habitaciones:",
    night: "noche",
    available: "Disponible",
    unavailable: "Ocupada",
    section3: "3. Servicios Adicionales (Opcional)",
    earlyTitle: "Early Check-in",
    earlyTime: "Ingreso: 10:00 am - 1:00 pm",
    subjectDisp: "Sujeto a disponibilidad",
    addonCost: "L.500 por habitación",
    lateTitle: "Late Check-out",
    lateTime: "Salida: Hasta las 2:00 pm",
    lateWarning: "DESPUÉS DE LAS 2:00 PM RECARGO DE LA NOCHE COMPLETA.",
    section4: "4. Detalles del Huésped",
    name: "Nombre Completo",
    email: "Correo Electrónico",
    phone: "Teléfono",
    section5: "5. Método de Pago",
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
    processing: "Procesando...",
    selectDatesFirst: "Selecciona fechas para ver disponibilidad"
  } : {
    section1: "1. Travel Dates",
    checkIn: "Check-in Date",
    checkOut: "Check-out Date",
    section2: "2. Select Accommodation",
    selectRoom: "Select one or more rooms:",
    night: "night",
    available: "Available",
    unavailable: "Unavailable",
    section3: "3. Additional Services (Optional)",
    earlyTitle: "Early Check-in",
    earlyTime: "Check-in: 10:00 AM - 1:00 PM",
    subjectDisp: "Subject to availability",
    addonCost: "L.500 per room",
    lateTitle: "Late Check-out",
    lateTime: "Check-out: Until 2:00 PM",
    lateWarning: "AFTER 2:00 PM FULL NIGHT CHARGE APPLIES.",
    section4: "4. Guest Details",
    name: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    section5: "5. Payment Method",
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
    processing: "Processing...",
    selectDatesFirst: "Select dates to check availability"
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.sectionTitle}>{t.section1}</div>
      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label>{t.checkIn}</label>
          <input type="date" name="checkIn" required min={today} value={checkIn} onChange={e => handleCheckInChange(e.target.value)} />
        </div>
        <div className={styles.formGroup}>
          <label>{t.checkOut}</label>
          <input type="date" name="checkOut" required min={minCheckOut} value={checkOut} onChange={e => setCheckOut(e.target.value)} />
        </div>
      </div>

      <div className={styles.sectionTitle}>{t.section2}</div>
      <div className={styles.formGroup}>
        <label>{t.selectRoom}</label>
        
        {!checkIn || !checkOut ? (
          <p className={styles.helperText} style={{marginBottom: '1rem'}}>{t.selectDatesFirst}</p>
        ) : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          {rooms.map(room => {
            const available = availabilityMap[room.id];
            const checking = isCheckingAvailability;
            const canSelect = !checking && available;

            return (
              <label 
                key={room.id} 
                style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: canSelect ? '#fff' : '#f9f9f9',
                  opacity: canSelect || checking || (!checkIn || !checkOut) ? 1 : 0.6,
                  cursor: canSelect ? 'pointer' : 'not-allowed'
                }}
              >
                <input 
                  type="checkbox" 
                  value={room.id}
                  checked={selectedRoomIds.includes(room.id)}
                  onChange={() => toggleRoom(room.id)}
                  disabled={!canSelect}
                  style={{ marginRight: '1rem', width: '20px', height: '20px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{room.contentName}</div>
                  <div style={{ fontSize: '0.9rem', color: '#555' }}>
                    L {new Intl.NumberFormat('en-US').format(room.basePrice)}/{t.night}
                  </div>
                </div>
                {checkIn && checkOut && !checking && (
                  <span style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 600, 
                    color: available ? '#16a34a' : '#dc2626',
                    backgroundColor: available ? '#dcfce7' : '#fee2e2',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px'
                  }}>
                    {available ? t.available : t.unavailable}
                  </span>
                )}
                {checking && (
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>...</span>
                )}
              </label>
            );
          })}
        </div>
      </div>

      <div className={styles.sectionTitle}>{t.section3}</div>
      <div className={styles.addonsGrid}>
        <div 
          className={`${styles.addonCard} ${earlyCheckIn ? styles.addonCardActive : ''}`}
          onClick={() => setEarlyCheckIn(!earlyCheckIn)}
        >
          <div className={styles.addonHeader}>
            <input 
              type="checkbox" 
              name="earlyCheckIn" 
              checked={earlyCheckIn} 
              onChange={e => setEarlyCheckIn(e.target.checked)}
              onClick={e => e.stopPropagation()}
            />
            <span className={styles.addonTitle}>{t.earlyTitle}</span>
          </div>
          <div className={styles.addonDetails}>
            <span>{t.earlyTime}</span>
            <span>{t.subjectDisp}</span>
            <span className={styles.addonPrice}>{t.addonCost}</span>
          </div>
        </div>

        <div 
          className={`${styles.addonCard} ${lateCheckOut ? styles.addonCardActive : ''}`}
          onClick={() => setLateCheckOut(!lateCheckOut)}
        >
          <div className={styles.addonHeader}>
            <input 
              type="checkbox" 
              name="lateCheckOut" 
              checked={lateCheckOut} 
              onChange={e => setLateCheckOut(e.target.checked)}
              onClick={e => e.stopPropagation()}
            />
            <span className={styles.addonTitle}>{t.lateTitle}</span>
          </div>
          <div className={styles.addonDetails}>
            <span>{t.lateTime}</span>
            <span>{t.subjectDisp}</span>
            <span className={styles.addonPrice}>{t.addonCost}</span>
            <span className={styles.addonWarning}>{t.lateWarning}</span>
          </div>
        </div>
      </div>

      <div className={styles.sectionTitle}>{t.section4}</div>
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

      <div className={styles.sectionTitle}>{t.section5}</div>
      <div className={styles.formGroup}>
        <select name="paymentMethod" required value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
          <option value="full_card">{t.optFull}</option>
          <option value="partial_card">{t.optPart}</option>
          <option value="bank_transfer">{t.optBank}</option>
          <option value="payment_link">{t.optLink}</option>
        </select>
        <p className={styles.helperText}>{t.helper}</p>
      </div>

      {paymentMethod === 'bank_transfer' && (
        <div className={styles.formGroup} style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '8px' }}>
          <label style={{ marginBottom: '0.5rem', display: 'block', fontWeight: 600 }}>Adjuntar Comprobante (Requerido)</label>
          <input type="file" name="receipt" accept="image/png, image/jpeg, image/webp, application/pdf" required style={{ width: '100%' }} />
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>Aceptamos JPG, PNG o PDF. Máximo 10MB.</p>
        </div>
      )}

      {totalPrice > 0 && selectedRooms.length > 0 && checkIn && checkOut && (
        <div className={styles.financialSummary}>
          <div className={styles.summaryTitle}>{t.summaryTitle}</div>
          
          {selectedRooms.map(room => (
            <div key={room.id} className={styles.summaryRow}>
              <span>{room.contentName} (L {new Intl.NumberFormat('en-US').format(room.basePrice)} x {Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24))} {t.nightsLabel})</span>
              <span>L {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(room.basePrice * Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)))}</span>
            </div>
          ))}

          {earlyCheckIn && (
            <div className={styles.summaryRow}>
              <span>{t.earlyTitle} (10:00 AM - 1:00 PM) x {numRooms}</span>
              <span>L {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(500 * numRooms)}</span>
            </div>
          )}

          {lateCheckOut && (
            <div className={styles.summaryRow}>
              <span>{t.lateTitle} (Hasta 2:00 PM) x {numRooms}</span>
              <span>L {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(500 * numRooms)}</span>
            </div>
          )}

          <div className={styles.summaryRow} style={{ borderTop: '1px solid #ddd', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
            <span>{t.subtotalLabel}</span>
            <span>L {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(subtotal + addonsTotal)}</span>
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

      <button type="submit" className={styles.submitButton} disabled={loading || selectedRoomIds.length === 0 || isCheckingAvailability}>
        {loading || isCheckingAvailability ? t.processing : t.submit}
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
