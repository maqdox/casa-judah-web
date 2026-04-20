'use client';

import { useState, useRef } from 'react';
import { updateRoom } from '../../actions';
import styles from './page.module.css';

export default function RoomEditorRow({ room }: { room: any }) {
  const [contentName, setContentName] = useState(room.contentName);
  const [basePrice, setBasePrice] = useState(room.basePrice);
  const [capacity, setCapacity] = useState(room.capacity);
  const [imageUrls, setImageUrls] = useState<string[]>(room.imageUrls ? room.imageUrls.split('|') : []);
  const [status, setStatus] = useState(room.status);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
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
          
          const base64String = canvas.toDataURL('image/jpeg', 0.6); // Higher compression (60%)
          setImageUrls(prev => [...prev, base64String]);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateRoom(room.id, {
      contentName,
      basePrice: Number(basePrice),
      capacity: Number(capacity),
      imageUrls: imageUrls.join('|'),
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
      imageUrls: imageUrls.join('|'),
      status: newStatus
    });
  };

  return (
    <div className={styles.roomCard}>
      {/* Visual Image Preview */}
      <div className={styles.roomImage} style={{ backgroundImage: `url('${imageUrls[0] || ''}')` }}>
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
          <label>Fotografías (Sube una o varias)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="file" 
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleImageUpload} 
              style={{ padding: '0.6rem', fontSize: '0.85rem' }}
            />
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {imageUrls.map((url, idx) => (
                <div key={idx} style={{ position: 'relative', width: '80px', height: '80px' }}>
                  <img src={url} alt="Room" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                  <button 
                    onClick={() => removeImage(idx)}
                    style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            {imageUrls.length > 0 && imageUrls.some(u => u.startsWith('data:')) && (
               <span style={{color: 'green', fontSize: '0.8rem'}}>📸 Imágenes nuevas listas para guardar</span>
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
