'use client';

interface LogoProps {
  type?: 'full' | 'monogram' | 'leaf';
  className?: string;
  color?: string;
}

export default function BrandLogo({ type = 'full', className, color = 'currentColor' }: LogoProps) {
  if (type === 'leaf') {
    return (
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        style={{ height: '1.2em', width: 'auto', verticalAlign: 'middle' }}
      >
        <path 
          d="M50 5 C35 30 40 65 50 90 C60 65 65 30 50 5Z" 
          fill={color} 
        />
      </svg>
    );
  }

  if (type === 'monogram') {
    return (
      <div className={className} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 0.6 }}>
        <svg viewBox="0 0 100 100" style={{ height: '0.9em', width: 'auto', marginBottom: '-2px' }}>
           <path d="M50 10 C38 35 42 65 50 90 C58 65 62 35 50 10Z" fill={color} />
        </svg>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8em', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '-1px' }}>cj</span>
      </div>
    );
  }

  // Full Logo Style
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '4px' }}>CASA J</span>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.4rem' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '4px' }}>U</span>
          <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: '12%', height: '0.6em', width: 'auto' }}>
            <path d="M50 10 C42 35 45 65 50 90 C55 65 58 35 50 10Z" fill="currentColor" />
          </svg>
        </div>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '4px' }}>DAH</span>
      </div>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.6rem', letterSpacing: '5px', opacity: 0.9, textTransform: 'uppercase', marginTop: '-2px' }}>
        FARM HOTEL
      </span>
    </div>
  );
}
