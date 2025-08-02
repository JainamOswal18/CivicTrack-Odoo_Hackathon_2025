import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import styles from './Analytics.module.css';

interface Stats {
  totalIssues: number;
  flaggedIssues: number;
  topCategory: string;
}

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    API.get('/admin/analytics').then(res => setStats(res.data));
  }, []);

  if (!stats) return <div>Loading analytics...</div>;

  return (
    <div className={styles.stats}>
      <div className={styles.statCard}>
        <div className={styles.statValue}>{stats.totalIssues}</div>
        <div className={styles.statLabel}>Total Issues</div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statValue}>{stats.flaggedIssues}</div>
        <div className={styles.statLabel}>Flagged Issues</div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statValue}>{stats.topCategory}</div>
        <div className={styles.statLabel}>Top Category</div>
      </div>
    </div>
  );
};

export default Analytics;
