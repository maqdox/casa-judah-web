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
    guests: pkg.id === 'test-pagadito' ? 1 : 2,
    children: 0,
    selectedOptionIndex: 0,
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
        guests: pkg.id === 'test-pagadito' ? 1 : 2,
        children: 0,
        selectedOptionIndex: 0,
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
      
      if (name === 'selectedOptionIndex') {
        finalValue = parseInt(value) || 0;
      } else if (name === 'guests') {
        let numValue = parseInt(value) || 0;
        const minVal = pkg.id === 'noche-de-fogata' ? 2 : 1;
        
        if (numValue < minVal) numValue = minVal;

        numValue = Math.min(numValue, pkg.maxCapacity - prev.children);
        finalValue = numValue;
      } else if (name === 'children') {
        let numValue = parseInt(value) || 0;
        if (numValue < 0) numValue = 0;

        numValue = Math.min(numValue, pkg.maxCapacity - prev.guests);
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
  const getSubtotal = () => {
    if (pkg.priceOptions) {
      const selectedOpt = pkg.priceOptions[formData.selectedOptionIndex] || pkg.priceOptions[0];
      let total = selectedOpt.price;
      if (formData.children > 0 && pkg.extraChildPrice) {
        total += formData.children * pkg.extraChildPrice;
      }
      return total;
    }

    const baseGuests = (pkg.id === 'cafe-entre-ovejas' || pkg.id === 'noche-de-fogata') ? 2 : 4;
    let total = pkg.basePrice;
    
    if (formData.guests > baseGuests) {
      total += (formData.guests - baseGuests) * pkg.extraPersonPrice;
    }
    
    if (formData.children > 0 && pkg.extraChildPrice) {
      total += formData.children * pkg.extraChildPrice;
    }
    
    if (pkg.hasDrinks && formData.drinks.chocolate > 0) {
      total += formData.drinks.chocolate * 15;
    }
    return total;
  };

  const getTax = () => {
    if (pkg.hasTax) {
      return Math.round(getSubtotal() * 0.15);
    }
    return 0;
  };

  const getTotalPrice = () => {
    return getSubtotal() + getTax();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (dateAvailable === false) return;
    setIsSubmitting(true);

    try {
      let notes = '';
      let totalChildrenCount = formData.children;
      if (pkg.priceOptions) {
        const selectedOpt = pkg.priceOptions[formData.selectedOptionIndex] || pkg.priceOptions[0];
        notes = `Paquete Base: ${selectedOpt.label}, Niños adicionales: ${formData.children}`;
        totalChildrenCount = selectedOpt.baseGuests + formData.children;
      } else {
        notes = `Adultos: ${formData.guests}, Niños: ${formData.children}${pkg.hasDrinks ? `, Bebidas: Café(${formData.drinks.cafe}) Té(${formData.drinks.te}) Chocolate(${formData.drinks.chocolate})` : ''}`;
      }

      const response = await fetch('/api/packages/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          adults: pkg.priceOptions ? 0 : formData.guests,
          children: totalChildrenCount,
          totalPrice: getTotalPrice(),
          amenityId: pkg.id,
          packageTitle: pkg.title,
          notes,
        }),
      });

      const result = await response.json();

      if (response.ok && result.redirectUrl) {
        // Redirect to Pagadito payment page
        window.location.href = result.redirectUrl;
      } else {
        alert(result.error || (isEs ? 'Ocurrió un error. Intenta de nuevo.' : 'An error occurred. Try again.'));
      }
    } catch {
      alert(isEs ? 'Error de conexión. Intenta de nuevo.' : 'Connection error. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const baseGuests = (pkg.id === 'cafe-entre-ovejas' || pkg.id === 'noche-de-fogata') ? 2 : 4;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} color="#333" />
        </button>

        {step === 1 ? (
          <>
            <div className={styles.singleHeaderImage}>
              <Image src={pkg.image} alt={pkg.title} fill style={{ objectFit: 'cover', objectPosition: pkg.id === 'paquete-cumpleanos' ? 'center bottom' : 'center center' }} />
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

                {pkg.priceOptions ? (
                  <>
                    <div className={styles.formGroup}>
                      <label>{isEs ? 'Selecciona el Paquete Base' : 'Select Base Package'}</label>
                      <select name="selectedOptionIndex" value={formData.selectedOptionIndex} onChange={handleChange} className={styles.formControl}>
                        {pkg.priceOptions.map((opt, idx) => (
                          <option key={idx} value={idx}>
                            {opt.label} - L. {opt.price.toLocaleString()} + ISV
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>{isEs ? 'Niños Adicionales (+ L. 320 c/u)' : 'Additional Children (+ L. 320 ea)'}</label>
                      <input type="number" name="children" min="0" max={pkg.maxCapacity - (pkg.priceOptions[formData.selectedOptionIndex]?.baseGuests || 10)} value={formData.children} onChange={handleChange} className={styles.formControl} />
                    </div>
                  </>
                ) : (
                  <div className={styles.row}>
                    <div className={styles.col}>
                      <div className={styles.formGroup}>
                        <label>{isEs ? `Adultos (Max: ${pkg.maxCapacity})` : `Adults (Max: ${pkg.maxCapacity})`}</label>
                        <input 
                          required 
                          type="number" 
                          name="guests" 
                          min={pkg.id === 'noche-de-fogata' ? 2 : 1} 
                          max={pkg.maxCapacity - formData.children} 
                          value={formData.guests} 
                          onChange={handleChange} 
                          className={styles.formControl} 
                        />
                      </div>
                    </div>
                    {pkg.extraChildPrice !== undefined && (
                      <div className={styles.col}>
                        <div className={styles.formGroup}>
                          <label>{isEs ? 'Niños' : 'Children'}</label>
                          <input type="number" name="children" min="0" max={pkg.maxCapacity - formData.guests} value={formData.children} onChange={handleChange} className={styles.formControl} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                  {pkg.priceOptions ? (
                    <>
                      <div className={styles.priceRow}>
                        <span>{isEs ? `Paquete Base (${pkg.priceOptions[formData.selectedOptionIndex]?.label})` : `Base Package (${pkg.priceOptions[formData.selectedOptionIndex]?.label})`}</span>
                        <span>L. {pkg.priceOptions[formData.selectedOptionIndex]?.price || 0}</span>
                      </div>
                      {formData.children > 0 && pkg.extraChildPrice !== undefined && (
                        <div className={styles.priceRow}>
                          <span>{isEs ? 'Niños Adicionales' : 'Additional Children'} ({formData.children}) x {pkg.extraChildPrice} Lps</span>
                          <span>L. {formData.children * pkg.extraChildPrice}</span>
                        </div>
                      )}
                      {pkg.hasTax && (
                        <div className={styles.priceRow}>
                          <span>{isEs ? '15% Impuesto sobre la venta (ISV)' : '15% Sales Tax'}</span>
                          <span>L. {getTax()}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
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
                      {pkg.extraChildPrice !== undefined && formData.children > 0 && (
                        <div className={styles.priceRow}>
                          <span>{isEs ? 'Niños Adicionales' : 'Additional Children'} ({formData.children}) x {pkg.extraChildPrice} Lps</span>
                          <span>L. {formData.children * pkg.extraChildPrice}</span>
                        </div>
                      )}
                      {pkg.hasDrinks && formData.drinks.chocolate > 0 && (
                        <div className={styles.priceRow}>
                          <span>{isEs ? 'Chocolate extra' : 'Extra chocolate'} ({formData.drinks.chocolate}) x 15 Lps</span>
                          <span>L. {formData.drinks.chocolate * 15}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className={styles.priceTotal}>
                    <span>{isEs ? 'Total Estimado' : 'Estimated Total'}</span>
                    <span>L. {getTotalPrice()}</span>
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
