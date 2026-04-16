'use client';

import { useState } from 'react';
import { updateContent } from '../../actions';
import styles from './page.module.css';

interface ContentFieldProps {
  section: string;
  fieldKey: string;
  label: string;
  initialValue: string;
  type?: 'text' | 'textarea';
}

export default function ContentField({ section, fieldKey, label, initialValue, type = 'text' }: ContentFieldProps) {
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateContent(section, fieldKey, value);
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={styles.fieldRow}>
      <div className={styles.fieldInfo}>
        <label>{label}</label>
        <span className={styles.fieldKey}>{section}.{fieldKey}</span>
      </div>
      
      <div className={styles.fieldInputArea}>
        {type === 'textarea' ? (
          <textarea 
            value={value} 
            onChange={(e) => setValue(e.target.value)}
            className={styles.textarea}
            rows={3}
          />
        ) : (
          <input 
            type="text" 
            value={value} 
            onChange={(e) => setValue(e.target.value)} 
            className={styles.input}
          />
        )}
        
        <button 
          onClick={handleSave} 
          disabled={isSaving || value === initialValue}
          className={`${styles.saveBtn} ${saved ? styles.saved : ''}`}
        >
          {isSaving ? '...' : saved ? '✓' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
