'use client';

import { useEffect, useState } from 'react';
import styles from './CustomCursor.module.css';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run on desktop devices with fine pointer
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const onPointerMove = (e: PointerEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      
      const target = e.target as HTMLElement;
      // Check if hovering over interactive elements
      const isInteractive = target.closest('a') || target.closest('button') || target.closest('input') || target.closest('select');
      setIsHovering(!!isInteractive);
    };

    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('mouseout', onMouseLeave);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('mouseout', onMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={isHovering ? styles.cursorHover : ''}>
      <div className={styles.cursorDot} style={{ '--x': position.x, '--y': position.y } as React.CSSProperties} />
      <div className={styles.cursorRing} style={{ '--x': position.x, '--y': position.y } as React.CSSProperties} />
    </div>
  );
}
