'use client';

import { useState } from 'react';
import { updateAmenity, deleteAmenity } from '../../actions';
import styles from './page.module.css';

export default function AmenityEditor({ amenity }: { amenity: any }) {
  const [titleEs, setTitleEs] = useState(amenity.title_es);
  const [titleEn, setTitleEn] = useState(amenity.title_en);
  const [descEs, setDescEs] = useState(amenity.desc_es);
  const [descEn, setDescEn] = useState(amenity.desc_en);
  const [price, setPrice] = useState(String(amenity.price));
  const [isActive, setIsActive] = useState(amenity.isActive);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await updateAmenity(amenity.id, {
      title_es: titleEs, title_en: titleEn,
      desc_es: descEs, desc_en: descEn,
      price: Number(price), isActive,
    });
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('¿Eliminar esta amenidad y todas sus reservaciones?')) return;
    await deleteAmenity(amenity.id);
  };

  const handleToggle = async () => {
    const next = !isActive;
    setIsActive(next);
    await updateAmenity(amenity.id, { isActive: next });
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <button onClick={handleToggle} className={`${styles.statusBadge} ${isActive ? styles.active : styles.inactive}`}>
          {isActive ? '✅ Activa' : '❌ Inactiva'}
        </button>
        <button onClick={handleDelete} className={styles.deleteBtn} title="Eliminar">🗑</button>
      </div>

      <div className={styles.fieldGroup}>
        <label>Nombre (ES)</label>
        <input type="text" value={titleEs} onChange={e => setTitleEs(e.target.value)} />
      </div>
      <div className={styles.fieldGroup}>
        <label>Nombre (EN)</label>
        <input type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)} />
      </div>
      <div className={styles.fieldGroup}>
        <label>Descripción (ES)</label>
        <textarea value={descEs} onChange={e => setDescEs(e.target.value)} rows={2} />
      </div>
      <div className={styles.fieldGroup}>
        <label>Descripción (EN)</label>
        <textarea value={descEn} onChange={e => setDescEn(e.target.value)} rows={2} />
      </div>
      <div className={styles.fieldGroup}>
        <label>Precio (Lempiras L)</label>
        <input type="number" value={price} onChange={e => setPrice(e.target.value)} />
      </div>

      <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
        {saving ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </div>
  );
}
