"use client";

import React, { useState } from 'react';
import ExperienceBookingModal from '@/components/v2/ExperienceBookingModal';

export default function ExperienceBookingCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div style={{ textAlign: 'center', marginTop: '4rem', marginBottom: '2rem' }}>
      <button 
        onClick={() => setIsModalOpen(true)}
        style={{
          backgroundColor: 'var(--color-olive)',
          color: '#FFFFFF',
          padding: '1rem 3rem',
          fontSize: '1.2rem',
          fontFamily: 'var(--font-serif)',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s, background-color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
      >
        Reservar Experiencia
      </button>

      <ExperienceBookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
