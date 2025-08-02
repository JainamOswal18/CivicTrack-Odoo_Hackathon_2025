import React from 'react';
import { Issue } from '../../types';
import styles from './IssueCard.module.css';

const IssueCard: React.FC<{ issue: Issue }> = ({ issue }) => (
  <div className={styles.card}>
    <div className={styles.title}>{issue.title}</div>
    <div className={styles.meta}>{issue.category} • {issue.status}</div>
    <div className={styles.desc}>{issue.description.slice(0, 60)}…</div>
    <div className={styles.footer}>
      <span>{issue.distance.toFixed(1)} km</span>
      <span>{new Date(issue.created_at).toLocaleDateString()}</span>
    </div>
  </div>
);

export default IssueCard;
