'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './RoomCarousel.module.css';

interface Room {
  id: string;
  contentName: string;
  basePrice: number;
  imageUrls: string | null;
}

export default function RoomCarousel({ rooms, lang }: { rooms: Room[], lang: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.offsetWidth * 0.6;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth'
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.scrollRow} ref={scrollRef}>
        {rooms.map((room) => {
          const firstImage = room.imageUrls?.split('|')[0] || '/exterior.jpg';
          return (
            <Link 
              href={`/${lang}/rooms`} 
              key={room.id} 
              className={styles.card}
            >
              <div className={styles.cardImage}>
                <Image 
                  src={firstImage} 
                  alt={room.contentName} 
                  fill 
                  style={{ objectFit: 'cover' }} 
                />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.cardName}>{room.contentName}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {rooms.length > 2 && (
        <div className={styles.arrows}>
          <button onClick={() => scroll('left')} className={styles.arrow} aria-label="Previous">←</button>
          <button onClick={() => scroll('right')} className={styles.arrow} aria-label="Next">→</button>
        </div>
      )}
    </div>
  );
}
