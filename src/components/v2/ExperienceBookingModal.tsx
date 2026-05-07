"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import styles from './ExperienceBookingModal.module.css';

interface ExperienceBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExperienceBookingModal({ isOpen, onClose }: ExperienceBookingModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    timeSlot: '15:00', // Default Cupo 1
    adults: 2,
    children: 0,
    drinks: { cafe: 2, te: 0, chocolate: 0 },
  });

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        name: '',
        phone: '',
        email: '',
        date: '',
        timeSlot: '15:00',
        adults: 2,
        children: 0,
        drinks: { cafe: 2, te: 0, chocolate: 0 },
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'adults' || name === 'children' ? parseInt(value) || 0 : value
    }));
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

  // Pricing calculation
  const getPrice = () => {
    let total = 450; // Base package for 2 adults
    
    // Extra adults
    if (formData.adults > 2) {
      total += (formData.adults - 2) * 150;
    } else if (formData.adults === 1) {
      // If someone wants to do it alone, they still pay the base package
      // total stays 450
    }

    // Children
    total += formData.children * 70;

    // Drinks (Chocolate costs extra per quantity)
    if (formData.drinks.chocolate > 0) {
      total += formData.drinks.chocolate * 15;
    }

    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/experiences/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalPrice: getPrice(),
          amenityId: 'cafe-entre-ovejas' // hardcoded ID for this specific experience
        }),
      });

      if (response.ok) {
        setStep(2); // Success step
      } else {
        alert("Ocurrió un error al procesar tu solicitud. Por favor intenta de nuevo.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={20} color="#333" />
        </button>

        {step === 1 ? (
          <>
            <div className={styles.singleHeaderImage}>
              <Image src="/cafe_ovejas_new.jpeg" alt="Café entre Ovejas" fill style={{ objectFit: 'cover' }} />
            </div>

            <div className={styles.modalContent}>
              <h2>Café entre Ovejas</h2>
              <p className={styles.subtitle}>Una tarde para detener el tiempo, entre lana suave y café recién hecho</p>

              <form onSubmit={handleSubmit}>
                <div className={styles.row}>
                  <div className={styles.col}>
                    <div className={styles.formGroup}>
                      <label>Nombre Completo</label>
                      <input required type="text" name="name" value={formData.name} onChange={handleChange} className={styles.formControl} placeholder="Tu nombre" />
                    </div>
                  </div>
                  <div className={styles.col}>
                    <div className={styles.formGroup}>
                      <label>Celular</label>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className={styles.formControl} placeholder="+504 0000-0000" />
                    </div>
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.col}>
                    <div className={styles.formGroup}>
                      <label>Fecha</label>
                      <input required type="date" name="date" value={formData.date} onChange={handleChange} className={styles.formControl} min={new Date().toISOString().split('T')[0]} />
                    </div>
                  </div>
                  <div className={styles.col}>
                    <div className={styles.formGroup}>
                      <label>Horario (Cupos)</label>
                      <select name="timeSlot" value={formData.timeSlot} onChange={handleChange} className={styles.formControl}>
                        <option value="15:00">Cupo 1: 3:00 PM - 4:30 PM</option>
                        <option value="16:30">Cupo 2: 4:30 PM - 6:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.col}>
                    <div className={styles.formGroup}>
                      <label>Adultos (Max: {10 - formData.children})</label>
                      <input required type="number" name="adults" min="1" max={10 - formData.children} value={formData.adults} onChange={handleChange} className={styles.formControl} />
                    </div>
                  </div>
                  <div className={styles.col}>
                    <div className={styles.formGroup}>
                      <label>Niños de 1 a 5 años (Max: {10 - formData.adults})</label>
                      <input required type="number" name="children" min="0" max={10 - formData.adults} value={formData.children} onChange={handleChange} className={styles.formControl} />
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Opciones de Bebida (Por Persona)</label>
                  <div className={styles.drinkOptions}>
                    <div className={styles.drinkOption}>
                      <span>Café Artesanal (Incluido)</span>
                      <input type="number" min="0" value={formData.drinks.cafe} onChange={(e) => handleDrinkChange('cafe', parseInt(e.target.value) || 0)} className={styles.drinkInput} />
                    </div>
                    <div className={styles.drinkOption}>
                      <span>Té (Incluido)</span>
                      <input type="number" min="0" value={formData.drinks.te} onChange={(e) => handleDrinkChange('te', parseInt(e.target.value) || 0)} className={styles.drinkInput} />
                    </div>
                    <div className={styles.drinkOption}>
                      <span>Chocolate Caliente (+15 Lps)</span>
                      <input type="number" min="0" value={formData.drinks.chocolate} onChange={(e) => handleDrinkChange('chocolate', parseInt(e.target.value) || 0)} className={styles.drinkInput} />
                    </div>
                  </div>
                </div>

                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>Paquete Base (2 Personas)</span>
                    <span>L. 450</span>
                  </div>
                  {formData.adults > 2 && (
                    <div className={styles.priceRow}>
                      <span>Adultos Adicionales ({formData.adults - 2}) x 150 Lps</span>
                      <span>L. {(formData.adults - 2) * 150}</span>
                    </div>
                  )}
                  {formData.children > 0 && (
                    <div className={styles.priceRow}>
                      <span>Niños ({formData.children}) x 70 Lps</span>
                      <span>L. {formData.children * 70}</span>
                    </div>
                  )}
                  {formData.drinks.chocolate > 0 && (
                    <div className={styles.priceRow}>
                      <span>Chocolate extra ({formData.drinks.chocolate} tazas) x 15 Lps</span>
                      <span>L. {formData.drinks.chocolate * 15}</span>
                    </div>
                  )}
                  <div className={styles.priceTotal}>
                    <span>Total Estimado</span>
                    <span>L. {getPrice()}</span>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Procesando...' : 'Solicitar Reserva'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className={styles.successMessage}>
            <h3>¡Solicitud Recibida!</h3>
            <p>Gracias por querer vivir esta experiencia mágica con nosotros. Hemos recibido tus datos y te contactaremos por WhatsApp al <strong>{formData.phone}</strong> para confirmar tu cupo y el método de pago.</p>
            <button className={styles.submitBtn} style={{ marginTop: '2rem' }} onClick={onClose}>Cerrar</button>
          </div>
        )}
      </div>
    </div>
  );
}
