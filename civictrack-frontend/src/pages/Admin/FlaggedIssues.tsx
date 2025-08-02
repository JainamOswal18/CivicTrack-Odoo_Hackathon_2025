import React, { useEffect, useState } from 'react';
import { Button } from '../../components/common/Button';
import API from '../../services/api';
import { Issue } from '../../types';
import styles from './FlaggedIssues.module.css';

const FlaggedIssues: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/flagged-issues')
      .then(res => setIssues(res.data.issues))
      .finally(() => setLoading(false));
  }, []);
 

  const handleUnflag = async (id: number) => {
    await API.post(`/admin/issues/${id}/unflag`);
    setIssues(issues.filter(i => i.id !== id));
  };

  const handleBanReporter = async (reporterId?: number) => {
    if (!reporterId) return;
    await API.post(`/admin/users/${reporterId}/ban`);
    // Optionally refresh flagged list
  };

  if (loading) return <div>Loading flagged issues...</div>;

  return (
    <div className={styles.list}>
      {issues.map(issue => (
        <div key={issue.id} className={styles.issueCard}>
          <div className={styles.title}>{issue.title}</div>
          <div className={styles.meta}>
            Reported by {issue.is_anonymous ? 'Anonymous' : `User ${issue.reporter_id}`}
          </div>
          <div className={styles.meta}>{issue.category} • {issue.distance.toFixed(1)} km</div>
          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => handleUnflag(issue.id)}>
              Unflag
            </Button>
            {!issue.is_anonymous && issue.reporter_id && (
              <Button variant="primary" onClick={() => handleBanReporter(issue.reporter_id!)}> Ban User</Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlaggedIssues;
