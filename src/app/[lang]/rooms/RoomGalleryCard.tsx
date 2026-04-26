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

export default function RoomGalleryCard({ room, lang, dict }: RoomCardProps) {
  const images = room.imageUrls.split('|').filter(Boolean);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isInFocus, setIsInFocus] = useState(false);
  const t = dict.roomsPage;

  // Detect when card is in focus (centered on screen)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInFocus(entry.isIntersecting && entry.intersectionRatio > 0.5);
      },
      { threshold: [0, 0.5, 1.0], rootMargin: "-10% 0px -10% 0px" }
    );

    const card = document.getElementById(`room-${room.id}`);
    if (card) observer.observe(card);

    return () => observer.disconnect();
  }, [room.id]);

  // Auto-slide effect ONLY when in focus
  useEffect(() => {
    if (images.length <= 1 || !isInFocus) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length, isInFocus]);

  // Parse description for bullets
  const parseDescription = (desc: string) => {
    if (!desc) return { intro: '', amenities: [] };
    // Support both Spanish and English keywords
    const splitRegex = /Incluye:|Includes:/i;
    const parts = desc.split(splitRegex);
    const intro = parts[0].trim();
    const amenities = parts[1] ? parts[1].split(',').map(a => a.trim()).filter(Boolean) : [];
    return { intro, amenities };
  };

  const rawDescription = lang === 'es' ? (room.desc_es || room.description) : (room.desc_en || room.description);
  const { intro, amenities } = parseDescription(rawDescription);

  return (
    <article 
      id={`room-${room.id}`} 
      className={`${styles.card} ${isInFocus ? styles.cardFocus : ''}`}
    >
      {/* Gallery Section */}
      <div className={`${styles.imageWrapper} luxury-frame`}>
        {images.map((img: string, idx: number) => (
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
            {images.map((_: any, idx: number) => (
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
          <span className={styles.price}>L {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(room.basePrice)} {t.pricePerNight}</span>
        </div>
        
        <Link href={`/${lang}/booking?roomId=${room.id}`} className={styles.bookButton}>
          {t.bookBtn}
        </Link>
      </div>
    </article>
  );
}
