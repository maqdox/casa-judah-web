"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import styles from './PackageBookingModal.module.css';
import type { PackageConfig } from '@/app/[lang]/paquetes/PackageCard';

interface PackageBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: PackageConfig;
}

export default function PackageBookingModal({ isOpen, onClose, pkg }: PackageBookingModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dateAvailable, setDateAvailable] = useState<boolean | null>(null);
  const [checkingDate, setCheckingDate] = useState(false);
  const isEs = pkg.lang === 'es';

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    timeSlot: pkg.timeSlots?.[0]?.value || '',
    guests: pkg.id === 'cafe-entre-ovejas' ? 2 : 4,
    children: 0,
    drinks: { cafe: 2, te: 0, chocolate: 0 },
  });

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setDateAvailable(null);
      setFormData({
        name: '',
        phone: '',
        email: '',
        date: '',
        timeSlot: pkg.timeSlots?.[0]?.value || '',
        guests: pkg.id === 'cafe-entre-ovejas' ? 2 : 4,
        children: 0,
        drinks: { cafe: 2, te: 0, chocolate: 0 },
      });
    }
  }, [isOpen, pkg]);

  // Check availability when date changes
  useEffect(() => {
    if (!formData.date) {
      setDateAvailable(null);
      return;
    }
    const checkAvailability = async () => {
      setCheckingDate(true);
      try {
        const timeSlotParam = pkg.hasTimeSlots ? `&timeSlot=${formData.timeSlot}` : '';
        const res = await fetch(`/api/packages/availability?date=${formData.date}&packageId=${pkg.id}${timeSlotParam}`);
        const data = await res.json();
        setDateAvailable(data.available);
      } catch {
        setDateAvailable(null);
      } finally {
        setCheckingDate(false);
      }
    };
    checkAvailability();
  }, [formData.date, formData.timeSlot, pkg.id, pkg.hasTimeSlots]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      let finalValue: string | number = value;
      
      if (name === 'guests') {
        let numValue = parseInt(value) || 0;
        const minVal = pkg.id === 'noche-de-fogata' ? 4 : 1;
        
        if (numValue < minVal) numValue = minVal;

        if (pkg.id === 'cafe-entre-ovejas') {
          numValue = Math.min(numValue, 10 - prev.children);
        } else {
          numValue = Math.min(numValue, pkg.maxCapacity);
        }
        finalValue = numValue;
      } else if (name === 'children') {
        let numValue = parseInt(value) || 0;
        if (numValue < 0) numValue = 0;

        if (pkg.id === 'cafe-entre-ovejas') {
          numValue = Math.min(numValue, 10 - prev.guests);
        }
        finalValue = numValue;
      }
      
      return {
        ...prev,
        [name]: finalValue
      };
    });
  };



  const handleDrinkChange = (drinkType: 'cafe' | 'te' | 'chocolate', value: number) => {
    setFormData(prev => ({
      ...prev,
      drinks: {
        ...prev.drinks,
        [drinkType]: value >= 0 ? value : 0
      }
    }));
  };

  // Pricing
  const getPrice = () => {
    if (pkg.id === 'noche-de-fogata') {
      let total = pkg.basePrice; // 650 for 4
      if (formData.guests > 4) {
        total += (formData.guests - 4) * pkg.extraPersonPrice;
      }
      return total;
    }

    // Café entre ovejas
    let total = pkg.basePrice; // 450 for 2
    if (formData.guests > 2) {
      total += (formData.guests - 2) * pkg.extraPersonPrice;
    }
    total += formData.children * 70;
    if (formData.drinks.chocolate > 0) {
      total += formData.drinks.chocolate * 15;
    }
    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dateAvailable === false) return;
    setIsSubmitting(true);

    try {
      const notes = pkg.id === 'cafe-entre-ovejas'
        ? `Adultos: ${formData.guests}, Niños: ${formData.children}, Bebidas: Café(${formData.drinks.cafe}) Té(${formData.drinks.te}) Chocolate(${formData.drinks.chocolate})`
        : `Personas: ${formData.guests}`;

      const response = await fetch('/api/experiences/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          adults: formData.guests,
          totalPrice: getPrice(),
          amenityId: pkg.id,
          packageTitle: pkg.title,
          notes,
        }),
      });

      if (response.ok) {
        setStep(2);
      } else {
        const errorData = await response.json();
        alert(errorData.error || (isEs ? 'Ocurrió un error. Intenta de nuevo.' : 'An error occurred. Try again.'));
      }
    } catch {
      alert(isEs ? 'Error de conexión. Intenta de nuevo.' : 'Connection error. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const baseGuests = pkg.id === 'cafe-entre-ovejas' ? 2 : 4;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} color="#333" />
        </button>

        {step === 1 ? (
          <>
            <div className={styles.singleHeaderImage}>
              <Image src={pkg.image} alt={pkg.title} fill style={{ objectFit: 'cover' }} />
            </div>

            <div className={styles.modalContent}>
              <h2>{pkg.title}</h2>
              <p className={styles.subtitle}>{pkg.subtitle}</p>

              <form onSubmit={handleSubmit}>
                <div className={styles.row}>
                  <div className={styles.col}>
                    <div className={styles.formGroup}>
                      <label>{isEs ? 'Nombre Completo' : 'Full Name'}</label>
                      <input required type="text" name="name" value={formData.name} onChange={handleChange} className={styles.formControl} placeholder={isEs ? 'Tu nombre' : 'Your name'} />
                    </div>
                  </div>
                  <div className={styles.col}>
                    <div className={styles.formGroup}>
                      <label>{isEs ? 'Celular' : 'Phone'}</label>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className={styles.formControl} placeholder="+504 0000-0000" />
                    </div>
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.col}>
                    <div className={styles.formGroup}>
                      <label>{isEs ? 'Fecha' : 'Date'}</label>
                      <input 
                        required 
                        type="date" 
                        name="date" 
                        value={formData.date} 
                        onChange={handleChange} 
                        className={styles.formControl} 
                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} 
                      />
                      {checkingDate && <span className={styles.checkingText}>{isEs ? 'Verificando disponibilidad...' : 'Checking availability...'}</span>}
                      {dateAvailable === false && <span className={styles.unavailableText}>{isEs ? 'Esta fecha ya está reservada' : 'This date is already booked'}</span>}
                      {dateAvailable === true && <span className={styles.availableText}>{isEs ? 'Disponible' : 'Available'}</span>}
                    </div>
                  </div>
                  {pkg.hasTimeSlots && pkg.timeSlots && (
                    <div className={styles.col}>
                      <div className={styles.formGroup}>
                        <label>{isEs ? 'Horario (Cupos)' : 'Time Slot'}</label>
                        <select name="timeSlot" value={formData.timeSlot} onChange={handleChange} className={styles.formControl}>
                          {pkg.timeSlots.map(slot => (
                            <option key={slot.value} value={slot.value}>{slot.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.row}>
                  <div className={styles.col}>
                    <div className={styles.formGroup}>
                      <label>{isEs ? `Personas (Max: ${pkg.maxCapacity})` : `Guests (Max: ${pkg.maxCapacity})`}</label>
                      <input 
                        required 
                        type="number" 
                        name="guests" 
                        min={pkg.id === 'noche-de-fogata' ? 4 : 1} 
                        max={pkg.id === 'cafe-entre-ovejas' ? 10 - formData.children : pkg.maxCapacity} 
                        value={formData.guests} 
                        onChange={handleChange} 
                        className={styles.formControl} 
                      />
                    </div>
                  </div>
                  {pkg.id === 'cafe-entre-ovejas' && (
                    <div className={styles.col}>
                      <div className={styles.formGroup}>
                        <label>{isEs ? 'Niños de 1 a 5 años' : 'Children (ages 1-5)'}</label>
                        <input type="number" name="children" min="0" max={10 - formData.guests} value={formData.children} onChange={handleChange} className={styles.formControl} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Drink options only for Café entre Ovejas */}
                {pkg.hasDrinks && (
                  <div className={styles.formGroup}>
                    <label>{isEs ? 'Opciones de Bebida (Por Persona)' : 'Drink Options (Per Person)'}</label>
                    <div className={styles.drinkOptions}>
                      <div className={styles.drinkOption}>
                        <span>{isEs ? 'Café Artesanal (Incluido)' : 'Artisan Coffee (Included)'}</span>
                        <input type="number" min="0" value={formData.drinks.cafe} onChange={(e) => handleDrinkChange('cafe', parseInt(e.target.value) || 0)} className={styles.drinkInput} />
                      </div>
                      <div className={styles.drinkOption}>
                        <span>{isEs ? 'Té (Incluido)' : 'Tea (Included)'}</span>
                        <input type="number" min="0" value={formData.drinks.te} onChange={(e) => handleDrinkChange('te', parseInt(e.target.value) || 0)} className={styles.drinkInput} />
                      </div>
                      <div className={styles.drinkOption}>
                        <span>{isEs ? 'Chocolate Caliente (+15 Lps)' : 'Hot Chocolate (+15 Lps)'}</span>
                        <input type="number" min="0" value={formData.drinks.chocolate} onChange={(e) => handleDrinkChange('chocolate', parseInt(e.target.value) || 0)} className={styles.drinkInput} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>{isEs ? `Paquete Base (${baseGuests} Personas)` : `Base Package (${baseGuests} Guests)`}</span>
                    <span>L. {pkg.basePrice}</span>
                  </div>
                  {formData.guests > baseGuests && (
                    <div className={styles.priceRow}>
                      <span>{isEs ? 'Personas Adicionales' : 'Additional Guests'} ({formData.guests - baseGuests}) x {pkg.extraPersonPrice} Lps</span>
                      <span>L. {(formData.guests - baseGuests) * pkg.extraPersonPrice}</span>
                    </div>
                  )}
                  {pkg.id === 'cafe-entre-ovejas' && formData.children > 0 && (
                    <div className={styles.priceRow}>
                      <span>{isEs ? 'Niños' : 'Children'} ({formData.children}) x 70 Lps</span>
                      <span>L. {formData.children * 70}</span>
                    </div>
                  )}
                  {pkg.hasDrinks && formData.drinks.chocolate > 0 && (
                    <div className={styles.priceRow}>
                      <span>{isEs ? 'Chocolate extra' : 'Extra chocolate'} ({formData.drinks.chocolate}) x 15 Lps</span>
                      <span>L. {formData.drinks.chocolate * 15}</span>
                    </div>
                  )}
                  <div className={styles.priceTotal}>
                    <span>{isEs ? 'Total Estimado' : 'Estimated Total'}</span>
                    <span>L. {getPrice()}</span>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={isSubmitting || dateAvailable === false}>
                  {isSubmitting
                    ? (isEs ? 'Procesando...' : 'Processing...')
                    : (isEs ? 'Solicitar Reserva' : 'Request Booking')}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className={styles.successMessage}>
            <h3>{isEs ? '¡Solicitud Recibida!' : 'Request Received!'}</h3>
            <p>
              {isEs
                ? <>Gracias por querer vivir esta experiencia mágica con nosotros. Hemos recibido tus datos y te contactaremos por WhatsApp al <strong>{formData.phone}</strong> para confirmar tu cupo y el método de pago.</>
                : <>Thank you for wanting to live this magical experience with us. We have received your details and will contact you via WhatsApp at <strong>{formData.phone}</strong> to confirm your spot and payment method.</>
              }
            </p>
            <button className={styles.submitBtn} style={{ marginTop: '2rem' }} onClick={onClose}>
              {isEs ? 'Cerrar' : 'Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
