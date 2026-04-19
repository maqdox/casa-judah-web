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
  const [basePrice, setBasePrice] = useState(100);
  const [capacity, setCapacity] = useState(2);
  const [imageUrls, setImageUrls] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress image to Base64 to bypass Vercel Storage limits
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200; // Limit width to prevent DB bloat
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
        
        // Export as JPEG with 80% quality (great for Base64)
        const base64String = canvas.toDataURL('image/jpeg', 0.8);
        setImageUrls(base64String);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    setIsCreating(true);
    await createRoom({
      contentName: contentName || 'Nueva Habitación',
      basePrice: Number(basePrice) || 0,
      capacity: Number(capacity) || 1,
      imageUrls: imageUrls.trim()
    });
    setIsCreating(false);
    setIsOpen(false);
    // Reset Form
    setContentName('');
    setBasePrice(100);
    setCapacity(2);
    setImageUrls('');
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
                    onChange={e => setBasePrice(Number(e.target.value))} 
                  />
                </div>
                
                <div className={modalStyles.fieldGroup}>
                  <label>Capacidad (Personas)</label>
                  <input 
                    type="number" 
                    value={capacity} 
                    onChange={e => setCapacity(Number(e.target.value))} 
                  />
                </div>
              </div>

              <div className={modalStyles.fieldGroup}>
                <label>Fotografía Principal (Sube desde tu dispositivo)</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload} 
                    style={{ flex: 1, padding: '0.6rem' }}
                  />
                  {imageUrls && (
                    <div style={{ width: '50px', height: '50px', backgroundImage: `url(${imageUrls})`, backgroundSize: 'cover', borderRadius: '4px' }} />
                  )}
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
