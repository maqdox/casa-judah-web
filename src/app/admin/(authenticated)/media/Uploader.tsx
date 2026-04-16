'use client';

import { useState } from 'react';
import { uploadMedia } from '../../actions';
import styles from './page.module.css';

export default function Uploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    try {
      setIsUploading(true);
      const data = new FormData();
      data.set('file', file);
      await uploadMedia(data);
      setFile(null);
    } catch (e) {
      console.error(e);
      alert('Error uploading file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className={styles.uploaderForm}>
      <div className={styles.dropZone}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className={styles.fileInput}
        />
        {file ? (
          <p className={styles.fileSelected}>Archivo seleccionado: <strong>{file.name}</strong></p>
        ) : (
          <p>Haz clic para seleccionar una imagen desde tu computadora</p>
        )}
      </div>
      <button 
        type="submit" 
        disabled={!file || isUploading}
        className={styles.uploadBtn}
      >
        {isUploading ? 'Subiendo...' : 'Subir Imagen'}
      </button>
    </form>
  );
}
