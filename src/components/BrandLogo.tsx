'use client';

interface LogoProps {
  type?: 'full' | 'monogram';
  className?: string;
  color?: string;
}

export default function BrandLogo({ type = 'full', className, color = 'currentColor' }: LogoProps) {
  // Asymmetrical "Organic Leaf/Flame" from branding
  const flamePath = "M48 95 C30 95 25 75 42 45 C52 25 58 8 68 2 C62 30 72 50 72 75 C72 90 62 95 48 95Z";

  if (type === 'monogram') {
    return (
      <div className={className} style={{ display: 'inline-flex', alignItems: 'flex-start', color }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 700, lineHeight: 1 }}>c</span>
        <div style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginLeft: '-2px' }}>
          <svg viewBox="0 0 100 100" style={{ width: '1.1rem', height: 'auto', marginBottom: '-10px', zIndex: 1 }}>
             <path d={flamePath} fill="currentColor" />
          </svg>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', fontWeight: 700, lineHeight: 0.85, marginTop: '-6px' }}>j</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px', color }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', lineHeight: 1 }}>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '4px' }}>CASA J</span>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '1.6rem' }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '4px' }}>U</span>
          <svg viewBox="0 0 100 100" style={{ position: 'absolute', top: '15%', height: '0.85em', width: 'auto', transform: 'translateX(2px)' }}>
            <path d={flamePath} fill="currentColor" />
          </svg>
        </div>
        <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '4px' }}>DAH</span>
      </div>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: '0.65rem', letterSpacing: '6px', opacity: 0.9, textTransform: 'uppercase', marginTop: '4px' }}>
        FARM HOTEL
      </span>
    </div>
  );
}
