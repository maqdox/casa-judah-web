'use client';

import { useState, useRef } from 'react';
import { createRoom } from '../../actions';
import pageStyles from './page.module.css';
import modalStyles from './modal.module.css';

export default function CreateRoomBtn() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [contentName, setContentName] = useState('');
  const [basePrice, setBasePrice] = useState<string>('100');
  const [capacity, setCapacity] = useState<string>('2');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress image to Base64 to bypass Vercel Storage limits
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
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
          
          const base64String = canvas.toDataURL('image/jpeg', 0.5); // 50% quality
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

  const handleCreate = async () => {
    setIsCreating(true);
    await createRoom({
      contentName: contentName || 'Nueva Habitación',
      basePrice: Number(basePrice) || 0,
      capacity: Number(capacity) || 1,
      imageUrls: imageUrls.join('|')
    });
    setIsCreating(false);
    setIsOpen(false);
    // Reset Form
    setContentName('');
    setBasePrice('100');
    setCapacity('2');
    setImageUrls([]);
  };

  return (
    <>
      <button 
        className={pageStyles.addBtn} 
        onClick={() => setIsOpen(true)} 
      >
        + Añadir Habitación
      </button>

      {isOpen && (
        <div className={modalStyles.backdrop}>
          <div className={modalStyles.modal}>
            <button className={modalStyles.closeBtn} onClick={() => setIsOpen(false)}>×</button>
            
            <h2 className={modalStyles.modalTitle}>Nueva Habitación</h2>

            <div className={modalStyles.formGrid}>
              <div className={modalStyles.fieldGroup}>
                <label>Nombre de Habitación</label>
                <input 
                  type="text" 
                  value={contentName} 
                  onChange={e => setContentName(e.target.value)} 
                  placeholder="Ej: Suite Panorámica"
                />
              </div>

              <div className={modalStyles.row}>
                <div className={modalStyles.fieldGroup}>
                  <label>Precio Base (Lempiras L)</label>
                  <input 
                    type="number" 
                    value={basePrice} 
                    onChange={e => setBasePrice(e.target.value)} 
                  />
                </div>
                
                <div className={modalStyles.fieldGroup}>
                  <label>Capacidad (Personas)</label>
                  <input 
                    type="number" 
                    value={capacity} 
                    onChange={e => setCapacity(e.target.value)} 
                  />
                </div>
              </div>

              <div className={modalStyles.fieldGroup}>
                <label>Fotografías (Sube una o varias)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleImageUpload} 
                    style={{ padding: '0.6rem' }}
                  />
                  
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {imageUrls.map((url, idx) => (
                      <div key={idx} style={{ position: 'relative', width: '60px', height: '60px' }}>
                        <img src={url} alt="Room" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                        <button 
                          onClick={() => removeImage(idx)}
                          style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '10px' }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button 
                className={modalStyles.submitBtn} 
                onClick={handleCreate} 
                disabled={isCreating}
              >
                {isCreating ? 'Guardando...' : 'Confirmar y Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
