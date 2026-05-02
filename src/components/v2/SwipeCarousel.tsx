"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from './SwipeCarousel.module.css';

interface SwipeCarouselProps {
  images: string[];
  altBase: string;
}

export default function SwipeCarousel({ images, altBase }: SwipeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (trackRef.current) {
      const scrollLeft = trackRef.current.scrollLeft;
      const width = trackRef.current.clientWidth;
      const newIndex = Math.round(scrollLeft / width);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    }
  };

  return (
    <div className={styles.carouselContainer}>
      <div 
        className={styles.carouselTrack} 
        ref={trackRef} 
        onScroll={handleScroll}
      >
        {images.map((src, index) => (
          <div key={index} className={styles.slide}>
            <Image 
              src={src} 
              alt={`${altBase} - Foto ${index + 1}`} 
              fill 
              style={{ objectFit: 'cover' }} 
            />
          </div>
        ))}
      </div>
      
      {images.length > 1 && (
        <div className={styles.indicators}>
          {images.map((_, index) => (
            <div 
              key={index} 
              className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
