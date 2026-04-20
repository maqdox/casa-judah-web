export default function TorchLogo({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      style={{ height: '1.2em', width: 'auto', verticalAlign: 'middle', marginRight: '8px' }}
    >
      {/* Torch Handle */}
      <path d="M45 90 L55 90 L58 50 L42 50 Z" fill="currentColor" />
      {/* Torch Cup */}
      <path d="M35 50 L65 50 L70 35 L30 35 Z" fill="currentColor" />
      {/* Flame */}
      <path d="M50 5 C35 25 40 40 50 40 C60 40 65 25 50 5Z" fill="#D4A017" />
      <path d="M50 15 C45 25 47 35 50 35 C53 35 55 25 50 15Z" fill="#FFD700" />
    </svg>
  );
}
