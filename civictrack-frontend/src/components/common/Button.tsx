import React from 'react';
import styles from './Button.module.css';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant: 'primary' | 'secondary' }> = ({
  variant, children, ...props
}) => (
  <button className={styles[variant]} {...props}>{children}</button>
);
