import React, { useState } from 'react';
import styles from './AdminPanel.module.css';
import Analytics from './Analytics';
import FlaggedIssues from './FlaggedIssues';

type Tab = 'analytics' | 'flagged';

const AdminPanel: React.FC = () => {
  const [tab, setTab] = useState<Tab>('analytics');

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <button
          className={`${styles.navButton} ${tab === 'analytics' ? styles.active : ''}`}
          onClick={() => setTab('analytics')}
        >
          Analytics
        </button>
        <button
          className={`${styles.navButton} ${tab === 'flagged' ? styles.active : ''}`}
          onClick={() => setTab('flagged')}
        >
          Flagged Issues
        </button>
      </aside>
      <main className={styles.main}>
        {tab === 'analytics' && <Analytics />}
        {tab === 'flagged' && <FlaggedIssues />}
      </main>
    </div>
  );
};

export default AdminPanel;
