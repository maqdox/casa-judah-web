'use client';

import { useState } from 'react';
import { updateRoom } from '../../actions';
import styles from './page.module.css';

export default function RoomEditorRow({ room }: { room: any }) {
  const [contentName, setContentName] = useState(room.contentName);
  const [basePrice, setBasePrice] = useState(room.basePrice);
  const [capacity, setCapacity] = useState(room.capacity);
  const [imageUrls, setImageUrls] = useState(room.imageUrls);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateRoom(room.id, {
      contentName,
      basePrice: Number(basePrice),
      capacity: Number(capacity),
      imageUrls
    });
    setIsSaving(false);
  };

  return (
    <div className={styles.roomCard}>
      {/* Visual Image Preview */}
      <div className={styles.roomImage} style={{ backgroundImage: `url('${room.imageUrls.split(',')[0]}')` }}>
        <span className={styles.statusBadge}>{room.status}</span>
      </div>

      {/* Editor Fields */}
      <div className={styles.roomEditor}>
        <div className={styles.fieldGroup}>
          <label>Nombre de Habitación</label>
          <input 
            type="text" 
            value={contentName} 
            onChange={(e) => setContentName(e.target.value)} 
          />
        </div>
        
        <div className={styles.row}>
          <div className={styles.fieldGroup}>
            <label>Precio Base ($ USD)</label>
            <input 
              type="number" 
              value={basePrice} 
              onChange={(e) => setBasePrice(e.target.value)} 
            />
          </div>
          
          <div className={styles.fieldGroup}>
            <label>Capacidad (Personas)</label>
            <input 
              type="number" 
              value={capacity} 
              onChange={(e) => setCapacity(e.target.value)} 
            />
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label>URL de Imagen Principal</label>
          <input 
            type="text" 
            value={imageUrls} 
            onChange={(e) => setImageUrls(e.target.value)} 
            placeholder="Ej: /exterior.jpg"
          />
        </div>

        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className={`${styles.saveBtn} ${isSaving ? styles.saving : ''}`}
        >
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}
