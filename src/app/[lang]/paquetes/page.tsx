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
        { text: isEs ? 'Kit de malvaviscos para asar' : 'Marshmallow roasting kit' },
        { text: isEs ? 'Café y Té de hierbas (incluido)' : 'Coffee and Herbal tea (included)' },
        { text: isEs ? 'Chocolate caliente' : 'Hot chocolate', extraLabel: '+15 LPS' },
        { text: isEs ? 'Área de cine al aire libre' : 'Outdoor cinema area' },
      ],
      duration: isEs ? '2 horas' : '2 hours',
      capacity: isEs ? '4 personas' : '4 guests',
      basePrice: 650,
      basePriceNote: isEs ? 'Paquete base para hasta 4 personas' : 'Base package for up to 4 guests',
      extraPersonPrice: 120,
      extraPersonLabel: isEs ? 'Persona adicional' : 'Additional person',
      maxCapacity: 20,
      hasTimeSlots: false,
      lang,
    },
    {
      id: 'cafe-entre-ovejas',
      title: isEs ? 'Café entre Ovejas' : 'Coffee with Sheep',
      subtitle: '',
      image: '/cafe_ovejas_new.jpeg',
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
      basePrice: 450,
      basePriceNote: isEs ? 'Paquete base para 2 personas' : 'Base package for 2 guests',
      extraPersonPrice: 150,
      extraPersonLabel: isEs ? 'Adulto adicional' : 'Additional adult',
      maxCapacity: 10,
      hasTimeSlots: true,
      timeSlots: [
        { value: '15:00', label: isEs ? 'Cupo 1: 3:00 PM - 4:30 PM' : 'Slot 1: 3:00 PM - 4:30 PM' },
        { value: '16:30', label: isEs ? 'Cupo 2: 4:30 PM - 6:00 PM' : 'Slot 2: 4:30 PM - 6:00 PM' },
      ],
      hasDrinks: true,
      lang,
    },
    // TEST PACKAGE — Remove after Pagadito testing
    {
      id: 'test-pagadito',
      title: '🧪 Test de Pago',
      subtitle: '',
      image: '/fogata.jpeg',
      badge: '⚠️ Solo para pruebas',
      includes: [
        { text: 'Paquete de prueba para verificar pasarela de pago' },
      ],
      duration: 'N/A',
      capacity: '1 persona',
      basePrice: 100,
      basePriceNote: 'L 100 para verificar conversión a USD',
      extraPersonPrice: 0,
      extraPersonLabel: '',
      maxCapacity: 1,
      hasTimeSlots: false,
      lang,
    },
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
