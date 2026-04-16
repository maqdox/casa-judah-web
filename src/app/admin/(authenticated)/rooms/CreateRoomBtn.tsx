'use client';

import { useState } from 'react';
import { createRoom } from '../../actions';
import styles from './page.module.css';

export default function CreateRoomBtn() {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    await createRoom();
    setIsCreating(false);
  };

  return (
    <button 
      className={styles.addBtn} 
      onClick={handleCreate} 
      disabled={isCreating}
    >
      {isCreating ? 'Creando...' : '+ Añadir Habitación'}
    </button>
  );
}
