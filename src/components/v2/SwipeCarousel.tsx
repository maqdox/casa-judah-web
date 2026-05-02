"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  const scrollToIndex = (index: number) => {
    if (trackRef.current) {
      const width = trackRef.current.clientWidth;
      trackRef.current.scrollTo({
        left: width * index,
        behavior: 'smooth'
      });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) scrollToIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) scrollToIndex(currentIndex + 1);
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
        <>
          <button 
            className={`${styles.navButton} ${styles.prevButton}`} 
            onClick={handlePrev}
            style={{ opacity: currentIndex === 0 ? 0 : 1, pointerEvents: currentIndex === 0 ? 'none' : 'auto' }}
            aria-label="Anterior"
          >
            <ChevronLeft size={24} color="#5A4334" />
          </button>
          <button 
            className={`${styles.navButton} ${styles.nextButton}`} 
            onClick={handleNext}
            style={{ opacity: currentIndex === images.length - 1 ? 0 : 1, pointerEvents: currentIndex === images.length - 1 ? 'none' : 'auto' }}
            aria-label="Siguiente"
          >
            <ChevronRight size={24} color="#5A4334" />
          </button>

          <div className={styles.indicators}>
            {images.map((_, index) => (
              <div 
                key={index} 
                className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
                onClick={() => scrollToIndex(index)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
