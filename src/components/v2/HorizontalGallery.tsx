'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './HorizontalGallery.module.css';

interface GalleryImage {
  src: string;
  objectFit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

interface Props {
  images: GalleryImage[];
  title: string;
}

export default function HorizontalGallery({ images, title }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 0);
      setShowRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [images]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const isSingle = images.length === 1;

  return (
    <div className={styles.galleryWrapper}>
      {!isSingle && showLeft && (
        <button className={`${styles.navButton} ${styles.left}`} onClick={() => scroll('left')} aria-label="Anterior">
          <ChevronLeft size={24} />
        </button>
      )}
      
      <div 
        className={`${styles.galleryGrid} ${isSingle ? styles.centered : ''}`} 
        ref={scrollRef} 
        onScroll={checkScroll}
      >
        {images.map((img, i) => (
          <div key={i} className={styles.galleryCard}>
            <Image 
              src={img.src} 
              alt={`${title} ${i + 1}`} 
              fill 
              style={{ objectFit: img.objectFit }} 
              className={styles.cardImage} 
            />
          </div>
        ))}
      </div>

      {!isSingle && showRight && (
        <button className={`${styles.navButton} ${styles.right}`} onClick={() => scroll('right')} aria-label="Siguiente">
          <ChevronRight size={24} />
        </button>
      )}
    </div>
  );
}
