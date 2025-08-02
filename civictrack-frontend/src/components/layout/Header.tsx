import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import styles from './Header.module.css';

interface Props { onReport(): void; view: 'map' | 'list'; onView(v: 'map' | 'list'): void; }

const Header: React.FC<Props> = ({ onReport, view, onView }) => {
  const { logout } = useAuth();
  return (
    <header className={styles.header}>
      <div className={styles.logo}>CivicTrack</div>
      <div className={styles.nav}>
        
        <Button variant="secondary" onClick={() => onView(view === 'map' ? 'list' : 'map')}>
          {view === 'map' ? 'List View' : 'Map View'}
        </Button>
        <Button variant="primary" onClick={onReport}>Report Issue</Button>
        <Button variant="secondary" onClick={logout}>Logout</Button>
      </div>
    </header>
  );
};

export default Header;
