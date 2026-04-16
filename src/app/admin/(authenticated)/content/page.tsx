import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import ContentField from './ContentField';

export default async function ContentEditorPage() {
  const rawContent = await prisma.siteContent.findMany();
  
  // Transform DB rows into a key-value map for easy access
  const contentMap: Record<string, string> = {};
  rawContent.forEach(item => {
    contentMap[`${item.section}.${item.key}`] = item.value;
  });

  // Helper to get value or default
  const getValue = (section: string, key: string, fallback: string) => {
    return contentMap[`${section}.${key}`] || fallback;
  };

  return (
    <div className={styles.container}>
      <div>
        <h1 className={styles.pageTitle}>Contenido de la Página</h1>
        <p className={styles.subtitle}>Edita los textos principales del sitio. Los cambios se reflejarán instantáneamente.</p>
      </div>

      {/* --- SECCIÓN HERO --- */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Portada Principal (Hero)</h2>
          <p>Lo primero que ven los usuarios al entrar a Casa Judah.</p>
        </div>
        
        <div className={styles.fieldsContainer}>
          <ContentField 
            section="hero" 
            fieldKey="title_es" 
            label="Título Principal (ES)" 
            initialValue={getValue('hero', 'title_es', 'Simplicidad Elevada')} 
          />
          
          <ContentField 
            section="hero" 
            fieldKey="subtitle_es" 
            label="Subtítulo (ES)" 
            type="textarea"
            initialValue={getValue('hero', 'subtitle_es', 'El encuentro perfecto entre la tierra y el lujo orgánico.')} 
          />
        </div>
      </section>

      {/* --- SECCIÓN ACERCA DE --- */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>La Experiencia (About)</h2>
          <p>Textos que describen la filosofía de la granja y el hotel.</p>
        </div>
        
        <div className={styles.fieldsContainer}>
          <ContentField 
            section="about" 
            fieldKey="heading_es" 
            label="Encabezado (ES)" 
            initialValue={getValue('about', 'heading_es', 'La Granja')} 
          />
          
          <ContentField 
            section="about" 
            fieldKey="paragraph_1_es" 
            label="Párrafo 1 (ES)" 
            type="textarea"
            initialValue={getValue('about', 'paragraph_1_es', 'Nuestros huertos son el corazón de Casa Judah. Todo lo que servimos proviene directamente de la tierra húmeda y rica.')} 
          />
          
          <ContentField 
            section="about" 
            fieldKey="button_es" 
            label="Texto del Botón (ES)" 
            initialValue={getValue('about', 'button_es', 'Reserva tu Retiro')} 
          />
        </div>
      </section>
      
    </div>
  );
}
