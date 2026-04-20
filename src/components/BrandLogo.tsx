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
        {/* The Leaf/Flame from branding */}
        <path 
          d="M50 10 C30 35 35 65 50 90 C65 65 70 35 50 10Z" 
          fill={color} 
        />
        <path 
          d="M50 30 C42 45 45 65 50 80 C55 65 58 45 50 30Z" 
          fill="rgba(255,255,255,0.3)" 
        />
      </svg>
    );
  }

  if (type === 'monogram') {
    return (
      <div className={className} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 0.8 }}>
        <svg viewBox="0 0 100 100" style={{ height: '0.8em', width: 'auto', marginBottom: '-5px' }}>
           <path d="M50 10 C35 35 40 65 50 90 C60 65 65 35 50 10Z" fill={color} />
        </svg>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5em', fontWeight: 700, textTransform: 'lowercase' }}>cj</span>
      </div>
    );
  }

  // Full Logo Style
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '4px' }}>CASA J</span>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '4px' }}>U</span>
          <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: '15%', height: '0.6em', width: 'auto' }}>
            <path d="M50 10 C40 35 45 65 50 90 C55 65 60 35 50 10Z" fill={color} />
          </svg>
        </div>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '4px' }}>DAH</span>
      </div>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '6px', opacity: 0.8, textTransform: 'uppercase', marginTop: '-4px' }}>
        FARM HOTEL
      </span>
    </div>
  );
}
