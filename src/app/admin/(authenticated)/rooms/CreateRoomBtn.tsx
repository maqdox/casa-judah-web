'use client';

import { useState } from 'react';
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
                  <label>Precio Base ($ USD)</label>
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
                <label>URL de Imagen Principal</label>
                <input 
                  type="text" 
                  value={imageUrls} 
                  onChange={e => setImageUrls(e.target.value)} 
                  placeholder="Ej: /media/foto.jpg"
                />
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
