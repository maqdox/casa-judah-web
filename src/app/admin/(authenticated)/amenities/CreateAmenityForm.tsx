'use client';

import { useState } from 'react';
import { createAmenity } from '../../actions';
import styles from './page.module.css';

export default function CreateAmenityForm() {
  const [open, setOpen] = useState(false);
  const [titleEs, setTitleEs] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!titleEs.trim()) return;
    setSaving(true);
    await createAmenity({
      title_es: titleEs,
      title_en: titleEn || titleEs,
      desc_es: '',
      desc_en: '',
      price: Number(price) || 0,
    });
    setTitleEs(''); setTitleEn(''); setPrice('');
    setOpen(false);
    setSaving(false);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={styles.addBtn}>
        + Agregar Amenidad
      </button>
    );
  }

  return (
    <div className={styles.createCard}>
      <h3>Nueva Amenidad</h3>
      <div className={styles.createRow}>
        <div className={styles.fieldGroup}>
          <label>Nombre (ES) *</label>
          <input type="text" value={titleEs} onChange={e => setTitleEs(e.target.value)} placeholder="Ej: Piscina" />
        </div>
        <div className={styles.fieldGroup}>
          <label>Nombre (EN)</label>
          <input type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)} placeholder="Ej: Swimming Pool" />
        </div>
        <div className={styles.fieldGroup}>
          <label>Precio (L)</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="500" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button onClick={handleCreate} disabled={saving} className={styles.saveBtn}>
          {saving ? 'Creando...' : 'Crear'}
        </button>
        <button onClick={() => setOpen(false)} className={styles.cancelBtn}>Cancelar</button>
      </div>
    </div>
  );
}
