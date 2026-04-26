import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import AmenityEditor from './AmenityEditor';
import CreateAmenityForm from './CreateAmenityForm';

export const dynamic = 'force-dynamic';

export default async function AmenitiesPage() {
  const amenities = await prisma.amenity.findMany({ orderBy: { sortOrder: 'asc' } });

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Gestión de Amenidades</h1>
      <p className={styles.subtitle}>Administra las amenidades reservables del hotel (piscina, fogata, etc.).</p>

      <CreateAmenityForm />

      <div className={styles.grid}>
        {amenities.length === 0 ? (
          <p className={styles.empty}>No hay amenidades creadas todavía.</p>
        ) : amenities.map((a) => (
          <AmenityEditor key={a.id} amenity={a} />
        ))}
      </div>
    </div>
  );
}
