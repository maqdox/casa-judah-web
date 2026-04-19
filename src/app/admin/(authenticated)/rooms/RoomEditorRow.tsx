'use client';

import { useState, useRef } from 'react';
import { updateRoom } from '../../actions';
import styles from './page.module.css';

export default function RoomEditorRow({ room }: { room: any }) {
  const [contentName, setContentName] = useState(room.contentName);
  const [basePrice, setBasePrice] = useState(room.basePrice);
  const [capacity, setCapacity] = useState(room.capacity);
  const [imageUrls, setImageUrls] = useState(room.imageUrls);
  const [status, setStatus] = useState(room.status);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const base64String = canvas.toDataURL('image/jpeg', 0.8);
        setImageUrls(base64String);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateRoom(room.id, {
      contentName,
      basePrice: Number(basePrice),
      capacity: Number(capacity),
      imageUrls,
      status
    });
    setIsSaving(false);
  };
  
  const toggleStatus = async () => {
    const newStatus = status === 'AVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE';
    setStatus(newStatus);
    // Instant save status toggle to DB for UX
    await updateRoom(room.id, {
      contentName,
      basePrice: Number(basePrice),
      capacity: Number(capacity),
      imageUrls,
      status: newStatus
    });
  };

  return (
    <div className={styles.roomCard}>
      {/* Visual Image Preview */}
      <div className={styles.roomImage} style={{ backgroundImage: `url('${imageUrls.split(',')[0]}')` }}>
        <button 
          onClick={toggleStatus} 
          className={`${styles.statusBadge} ${status === 'AVAILABLE' ? styles.available : styles.unavailable}`}
          title="Clic para cambiar de estado"
        >
          {status} ⟳
        </button>
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
            <label>Precio Base (Lempiras L)</label>
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
          <label>Fotografía Principal</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              type="file" 
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload} 
              style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem' }}
            />
            {imageUrls && imageUrls.startsWith('data:') && (
               <span style={{color: 'green', fontSize: '0.8rem'}}>📸 Lista para guardar</span>
            )}
          </div>
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
