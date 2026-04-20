'use client';

import Image from 'next/image';

interface LogoProps {
  scrolled?: boolean;
  className?: string;
}

export default function BrandLogo({ scrolled, className }: LogoProps) {
  // We use the light logo (Arena color) when the header is transparent (over hero images)
  // We use the dark logo (Tabaco color) when on a light background.
  
  const logoSrc = scrolled ? '/logo_dark.png' : '/logo_light.png';

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Image
        src={logoSrc}
        alt="Casa Judah Farm Hotel"
        width={220}
        height={60}
        priority
        style={{ 
          objectFit: 'contain',
          width: 'auto',
          height: '40px' // Default mobile height
        }}
        className="brand-logo-img"
      />
      <style jsx>{`
        @media (min-width: 768px) {
          .brand-logo-img {
            height: 50px !important;
          }
        }
      `}</style>
    </div>
  );
}
