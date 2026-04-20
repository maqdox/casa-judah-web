'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

interface RoomCardProps {
  room: any;
  lang: string;
  dict: any;
}

export default function RoomCard({ room, lang, dict }: RoomCardProps) {
  const images = room.imageUrls.split('|').filter(Boolean);
  const [currentIdx, setCurrentIdx] = useState(0);
  const t = dict.roomsPage;

  // Auto-slide effect
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  // Parse description for bullets
  const parseDescription = (desc: string) => {
    const parts = desc.split('Incluye:');
    const intro = parts[0].trim();
    const amenities = parts[1] ? parts[1].split(',').map(a => a.trim()).filter(Boolean) : [];
    return { intro, amenities };
  };

  const { intro, amenities } = parseDescription(room.description);

  return (
    <article className={styles.card}>
      {/* Gallery Section */}
      <div className={`${styles.imageWrapper} luxury-frame`}>
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className={`${styles.slide} ${idx === currentIdx ? styles.active : ''}`}
          >
            <Image 
              src={img} 
              alt={`${room.contentName} - ${idx + 1}`} 
              fill 
              style={{ objectFit: 'cover' }} 
              priority={idx === 0}
            />
          </div>
        ))}
        
        {/* Navigation Dots */}
        {images.length > 1 && (
          <div className={styles.dots}>
            {images.map((_, idx) => (
              <button 
                key={idx} 
                className={`${styles.dot} ${idx === currentIdx ? styles.dotActive : ''}`}
                onClick={() => setCurrentIdx(idx)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className={styles.content}>
        <h2>{room.contentName}</h2>
        
        <div className={styles.descriptionArea}>
          <ul className={styles.amenityList}>
            <li>{intro}</li>
            {amenities.map((amenity, i) => (
              <li key={i}>{amenity}</li>
            ))}
          </ul>
        </div>

        <div className={styles.details}>
          <span>{lang === 'es' ? 'Hasta' : 'Up to'} {room.capacity} {lang === 'es' ? 'Huéspedes' : 'Guests'}</span>
          <span className={styles.price}>L {room.basePrice.toFixed(2)} {t.pricePerNight}</span>
        </div>
        
        <Link href={`/${lang}/booking?roomId=${room.id}`} className={styles.bookButton}>
          {t.bookBtn}
        </Link>
      </div>
    </article>
  );
}
