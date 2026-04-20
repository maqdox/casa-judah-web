'use client';

interface LogoProps {
  type?: 'full' | 'monogram';
  className?: string;
  color?: string;
}

export default function BrandLogo({ type = 'full', className, color = 'currentColor' }: LogoProps) {
  if (type === 'monogram') {
    return (
      <div className={className} style={{ alignItems: 'flex-start', color }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 700, lineHeight: 1 }}>c</span>
        <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg viewBox="0 0 100 100" style={{ width: '0.8rem', height: 'auto', marginBottom: '-6px', zIndex: 1 }}>
             <path d="M50 10 C38 35 42 65 50 90 C58 65 62 35 50 10Z" fill="currentColor" />
          </svg>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', fontWeight: 700, lineHeight: 0.8, marginTop: '-4px' }}>j</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ flexDirection: 'column', alignItems: 'center', gap: '0px', color }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1 }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '4px' }}>CASA J</span>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.4rem' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '4px' }}>U</span>
          <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: '15%', height: '0.6em', width: 'auto' }}>
            <path d="M50 10 C42 35 45 65 50 90 C55 65 58 35 50 10Z" fill="currentColor" />
          </svg>
        </div>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '4px' }}>DAH</span>
      </div>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '6px', opacity: 0.9, textTransform: 'uppercase', marginTop: '2px' }}>
        FARM HOTEL
      </span>
    </div>
  );
}
