import styles from './page.module.css';
import { getDictionary } from '@/dictionaries';
import PackageCard, { PackageConfig } from './PackageCard';

export default async function PaquetesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = (await params) as { lang: 'en' | 'es' };
  const isEs = lang === 'es';

  const packages: PackageConfig[] = [
    {
      id: 'noche-de-fogata',
      title: isEs ? 'Noche de Fogata' : 'Bonfire Night',
      subtitle: '',
      image: '/fogata.jpeg',
      badge: isEs ? 'Experiencia Especial · Paquete' : 'Special Experience · Package',
      includes: [
        { text: isEs ? 'Fogata encendida en zona privada' : 'Lit bonfire in private area' },
        { text: isEs ? 'Kit de malvaviscos para asar o palomitas' : 'Marshmallow roasting kit or popcorn' },
        { text: isEs ? 'Café y Té de hierbas (incluido)' : 'Coffee and Herbal tea (included)' },
        { text: isEs ? 'Chocolate caliente' : 'Hot chocolate', extraLabel: '+15 LPS' },
        { text: isEs ? 'Área de cine al aire libre' : 'Outdoor cinema area' },
      ],
      duration: isEs ? '2 horas' : '2 hours',
      capacity: isEs ? '2 personas' : '2 guests',
      basePrice: 1240,
      basePriceNote: isEs ? 'Paquete base para 2 personas (ISV inc.)' : 'Base package for 2 guests (Tax inc.)',
      extraPersonPrice: 120,
      extraPersonLabel: isEs ? 'Adulto adicional' : 'Additional adult',
      extraChildPrice: 75,
      extraChildLabel: isEs ? 'Niño adicional' : 'Additional child',
      maxCapacity: 10,
      hasTimeSlots: false,
      lang,
    },
    {
      id: 'cafe-entre-ovejas',
      title: isEs ? 'Café entre Ovejas' : 'Coffee with Sheep',
      subtitle: '',
      image: '/cafe-ovejas/1.jpg',
      badge: isEs ? 'Experiencia Especial · Paquete' : 'Special Experience · Package',
      includes: [
        { text: isEs ? 'Café artesanal o Té (incluido)' : 'Artisan coffee or Tea (included)' },
        {
          text: isEs ? 'Chocolate caliente' : 'Hot chocolate',
          extraLabel: '+15 LPS'
        },
        { text: isEs ? 'Interacción con ovejas y animales' : 'Interaction with sheep & animals' },
        { text: isEs ? 'Foto grupal de recuerdo' : 'Group souvenir photo' },
      ],
      duration: isEs ? '1.5 horas' : '1.5 hours',
      capacity: isEs ? '2 personas' : '2 guests',
      basePrice: 1170,
      basePriceNote: isEs ? 'Paquete base para 2 personas (ISV inc.)' : 'Base package for 2 guests (Tax inc.)',
      extraPersonPrice: 150,
      extraPersonLabel: isEs ? 'Adulto adicional' : 'Additional adult',
      extraChildPrice: 75,
      extraChildLabel: isEs ? 'Niño adicional' : 'Additional child',
      maxCapacity: 10,
      hasTimeSlots: true,
      timeSlots: [
        { value: '15:00', label: isEs ? 'Cupo 1: 3:00 PM - 4:30 PM' : 'Slot 1: 3:00 PM - 4:30 PM' },
        { value: '16:30', label: isEs ? 'Cupo 2: 4:30 PM - 6:00 PM' : 'Slot 2: 4:30 PM - 6:00 PM' },
      ],
      hasDrinks: true,
      lang,
    },
    {
      id: 'paquete-cumpleanos',
      title: isEs ? 'Paquete Cumpleaños Edición Infantil' : 'Kids Birthday Package',
      subtitle: isEs ? 'Celebra un cumpleaños inolvidable en medio de la naturaleza' : 'Celebrate an unforgettable birthday surrounded by nature',
      image: '/cumpleanos-infantil.png',
      badge: isEs ? 'Experiencia Especial · Paquete' : 'Special Experience · Package',
      includes: [
        { text: isEs ? 'Acceso a piscina' : 'Pool access' },
        { text: isEs ? 'Interacción con animales' : 'Animal interaction' },
        { text: isEs ? 'Fotos con nuestras ovejas' : 'Photos with our sheep' },
        { text: isEs ? 'Paseo en bicicletas' : 'Bicycle ride' },
        { text: isEs ? 'Áreas verdes para juegos y recreación' : 'Green areas for games & recreation' },
        { text: isEs ? 'Juegos de mesa' : 'Board games' },
        { text: isEs ? 'Palomitas' : 'Popcorn' },
        { text: isEs ? 'Algodón de azúcar' : 'Cotton candy' },
        { text: isEs ? 'Mesas y sillas para el grupo' : 'Tables & chairs for the group' },
      ],
      duration: isEs ? 'Horario flexible' : 'Flexible schedule',
      capacity: isEs ? '10 a 20+ niños' : '10 to 20+ children',
      basePrice: 3800,
      basePriceNote: isEs ? 'A partir de 10 niños (+15% ISV)' : 'Starting at 10 children (+15% tax)',
      extraPersonPrice: 0,
      extraPersonLabel: isEs ? 'Adulto acompañante' : 'Accompanying adult',
      extraChildPrice: 320,
      extraChildLabel: isEs ? 'Niño adicional' : 'Additional child',
      maxCapacity: 50,
      hasTimeSlots: false,
      hasTax: true,
      priceOptions: [
        { label: isEs ? 'Grupo de 10 niños' : 'Group of 10 children', price: 3800, baseGuests: 10 },
        { label: isEs ? 'Grupo de 15 niños' : 'Group of 15 children', price: 4800, baseGuests: 15 },
        { label: isEs ? 'Grupo de 20 niños' : 'Group of 20 children', price: 6500, baseGuests: 20 },
      ],
      lang,
    },
    // TEST PACKAGE — Hidden, DO NOT DELETE. Re-enable for Pagadito testing.
    // {
    //   id: 'test-pagadito',
    //   title: '🧪 Test de Pago',
    //   subtitle: '',
    //   image: '/fogata.jpeg',
    //   badge: '⚠️ Solo para pruebas',
    //   includes: [
    //     { text: 'Paquete de prueba para verificar pasarela de pago' },
    //   ],
    //   duration: 'N/A',
    //   capacity: '1 persona',
    //   basePrice: 26.62,
    //   basePriceNote: 'L 26.62 ÷ tasa de cambio = ~$1 USD',
    //   extraPersonPrice: 0,
    //   extraPersonLabel: '',
    //   maxCapacity: 1,
    //   hasTimeSlots: false,
    //   lang,
    // },
  ];

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>{isEs ? 'Experiencias Especiales' : 'Special Experiences'}</h1>
        <p>{isEs
          ? 'Vive momentos inolvidables en Casa Judah. Reserva tu paquete y déjate envolver por la magia del campo.'
          : 'Live unforgettable moments at Casa Judah. Book your package and let yourself be embraced by the magic of the countryside.'}
        </p>
      </header>

      <div className={styles.grid}>
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>

      <p className={styles.tagline}>
        Casa Judah · {isEs ? 'Experiencias únicas bajo el cielo' : 'Unique experiences under the sky'}
      </p>
    </main>
  );
}
