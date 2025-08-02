import React from 'react';
import styles from './Input.module.css';

export const Input: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }
> = ({ label, error, ...props }) => (
  <div className={styles.wrapper}>
    <label className={styles.label}>{label}</label>
    <input className={`${styles.input} ${error ? styles.error : ''}`} {...props} />
    {error && <span className={styles.errorMsg}>{error}</span>}
  </div>
);
