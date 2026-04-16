import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import Uploader from './Uploader';

export default async function MediaLibraryPage() {
  const mediaItems = await prisma.mediaItem.findMany({
    orderBy: { uploadedAt: 'desc' }
  });

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Librería de Media</h1>
          <p className={styles.subtitle}>Sube y administra las fotografías utilizadas en el sitio web.</p>
        </div>
      </div>

      <div className={styles.uploadSection}>
        <h2>Subir Nueva Imagen</h2>
        <Uploader />
      </div>

      <div className={styles.gallery}>
        {mediaItems.length === 0 ? (
          <p className={styles.empty}>La librería está vacía. ¡Sube tu primera foto arriba!</p>
        ) : (
          mediaItems.map((item) => (
            <div key={item.id} className={styles.mediaCard}>
              <div 
                className={styles.imagePreview} 
                style={{ backgroundImage: `url('${item.url}')` }}
              ></div>
              <div className={styles.mediaInfo}>
                <p className={styles.urlText}>{item.url}</p>
                <div className={styles.actions}>
                  <button className={styles.copyBtn}>Copiar Enlace</button>
                  <button className={styles.deleteBtn}>Borrar</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
