import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import { updateSetting } from '../../actions';

type Theme = {
  key: string;
  name: string;
  primary: string;
  accent: string;
  desc: string;
};

const THEMES: Theme[] = [
  { key: 'verde_olivo', name: 'Verde Olivo', primary: '#4F5A3E', accent: '#D5BD9B', desc: 'Natural, orgánico y pacífico. El color de crecimiento.' },
  { key: 'terracota', name: 'Terracota', primary: '#8B4D3B', accent: '#D5BD9B', desc: 'Cálido, tierra y arcilla. Tono mediterráneo rústico.' },
  { key: 'marron_medio', name: 'Marrón Medio', primary: '#7E644B', accent: '#D5BD9B', desc: 'Sofisticado, neutral, color piel relajante.' },
  { key: 'cafe_profundo', name: 'Café Profundo', primary: '#5D3518', accent: '#D5BD9B', desc: 'Oscuro, tostado, premium y con muchísimo carácter.' },
  { key: 'negro', name: 'Negro Elegante', primary: '#000000', accent: '#D5BD9B', desc: 'Contraste absoluto. Ultra-premium y moderno.' },
];

export default async function SettingsPage() {
  const activeThemeSetting = await prisma.siteSetting.findUnique({
    where: { key: 'activeTheme' }
  });
  
  // Default to verde_olivo if none set
  const currentTheme = activeThemeSetting?.value || 'verde_olivo';

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Ajustes & Tema</h1>
      <p className={styles.subtitle}>Configura las políticas, links de contacto y la identidad visual del sitio.</p>

      <section className={styles.section}>
        <h2>Paleta de Colores (Identidad de Marca)</h2>
        <p className={styles.helpText}>Selecciona la combinación de colores que se aplicará en todo el sitio web público. El color Dorado Champagne se mantiene como acento unificador.</p>

        <div className={styles.themeGrid}>
          {THEMES.map((theme) => {
            const isActive = currentTheme === theme.key;
            
            return (
              <div key={theme.key} className={`${styles.themeCard} ${isActive ? styles.activeCard : ''}`}>
                <div className={styles.colorPalette}>
                  <div className={styles.colorBlock} style={{ backgroundColor: theme.primary }}></div>
                  <div className={styles.colorBlock} style={{ backgroundColor: '#FAF8F4' }}></div>
                  <div className={styles.colorBlock} style={{ backgroundColor: theme.accent }}></div>
                </div>
                
                <div className={styles.themeInfo}>
                  <h3>{theme.name}</h3>
                  <p>{theme.desc}</p>
                </div>

                <form action={async () => {
                  'use server'
                  await updateSetting('activeTheme', theme.key);
                }}>
                  <button 
                    type="submit" 
                    className={styles.themeBtn} 
                    disabled={isActive}
                  >
                    {isActive ? '✓ Seleccionado' : 'Aplicar Tema'}
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </section>

      {/* Placeholder for future settings */}
      <section className={styles.section}>
        <h2>Datos de Contacto (Próximamente)</h2>
        <p className={styles.helpText}>Aquí podrás cambiar el número de teléfono, correo de recepción y links de WhatsApp.</p>
      </section>
    </div>
  );
}
