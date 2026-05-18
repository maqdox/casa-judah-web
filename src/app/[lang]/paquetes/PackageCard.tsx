'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import PackageBookingModal from '@/components/v2/PackageBookingModal';

export interface PackageIncludeItem {
  text: string;
  subItems?: string[];
  extraLabel?: string; // e.g. "+15 LPS"
}

export interface PackagePriceOption {
  label: string;
  price: number;
  baseGuests: number;
}

export interface PackageConfig {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  includes: PackageIncludeItem[];
  duration: string;
  capacity: string;
  basePrice: number;
  basePriceNote: string;
  extraPersonPrice: number;
  extraPersonLabel: string;
  extraChildPrice?: number;
  extraChildLabel?: string;
  maxCapacity: number;
  hasTimeSlots: boolean;
  timeSlots?: { value: string; label: string }[];
  hasDrinks?: boolean;
  priceOptions?: PackagePriceOption[];
  hasTax?: boolean;
  lang: string;
}

export default function PackageCard({ pkg }: { pkg: PackageConfig }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isEs = pkg.lang === 'es';

  return (
    <>
      <article className={styles.card}>
        {/* Image */}
        <div className={styles.cardImage}>
          <Image
            src={pkg.image}
            alt={pkg.title}
            fill
            style={{ 
              objectFit: 'cover', 
              objectPosition: pkg.id === 'cafe-entre-ovejas' ? 'center bottom' : (pkg.id === 'paquete-cumpleanos' ? 'center bottom' : 'center center') 
            }}
            priority
          />
        </div>

        {/* Body */}
        <div className={styles.cardBody}>
          <span className={styles.badge}>{pkg.badge}</span>
          <h2 className={styles.cardTitle}>{pkg.title}</h2>
          {pkg.subtitle && <p className={styles.cardSubtitle}>{pkg.subtitle}</p>}

          {/* Includes */}
          <p className={styles.includesLabel}>{isEs ? 'Incluye' : 'Includes'}</p>
          <ul className={styles.includesList}>
            {pkg.includes.map((item, i) => (
              <li key={i}>
                {item.text}
                {item.extraLabel && (
                  <span className={styles.extraBadge}>{item.extraLabel}</span>
                )}
                {item.subItems && item.subItems.map((sub, j) => (
                  <div key={j} className={styles.subItem}>{sub}</div>
                ))}
              </li>
            ))}
          </ul>

          {/* Info Boxes */}
          <div className={styles.infoBoxes}>
            <div className={styles.infoBox}>
              <span className={styles.infoLabel}>{isEs ? 'Duración' : 'Duration'}</span>
              <span className={styles.infoValue}>{pkg.duration}</span>
            </div>
            <div className={styles.infoBox}>
              <span className={styles.infoLabel}>{isEs ? 'Capacidad Base' : 'Base Capacity'}</span>
              <span className={styles.infoValue}>{pkg.capacity}</span>
            </div>
          </div>

          {/* Price */}
          <div className={styles.priceSection}>
            <span className={styles.priceAmount}>
              {pkg.basePrice.toLocaleString()}
              <span className={styles.priceCurrency}> LPS</span>
            </span>
            <span className={styles.priceNote}>{pkg.basePriceNote}</span>

            {pkg.priceOptions ? (
              <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                {pkg.priceOptions.map((opt, idx) => (
                  <div key={idx} className={styles.extraPriceRow}>
                    <span>{opt.label}</span>
                    <span className={styles.extraPriceAmount}>L. {opt.price.toLocaleString()} + ISV</span>
                  </div>
                ))}
                {pkg.extraChildPrice !== undefined && (
                  <div className={styles.extraPriceRow}>
                    <span>{pkg.extraChildLabel}</span>
                    <span className={styles.extraPriceAmount}>+ {pkg.extraChildPrice} Lps + ISV</span>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className={styles.extraPriceRow}>
                  <span>{pkg.extraPersonLabel}</span>
                  <span className={styles.extraPriceAmount}>+ {pkg.extraPersonPrice} Lps</span>
                </div>

                {pkg.extraChildPrice !== undefined && (
                  <div className={styles.extraPriceRow}>
                    <span>{pkg.extraChildLabel}</span>
                    <span className={styles.extraPriceAmount}>+ {pkg.extraChildPrice} Lps</span>
                  </div>
                )}
              </>
            )}

            <button
              className={styles.ctaButton}
              onClick={() => setIsModalOpen(true)}
            >
              {isEs ? 'Reservar Experiencia' : 'Book Experience'}
            </button>
          </div>
        </div>
      </article>

      <PackageBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pkg={pkg}
      />
    </>
  );
}
