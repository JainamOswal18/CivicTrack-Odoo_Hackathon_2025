import React from 'react';
import { Issue } from '../../types';
import IssueCard from './IssueCard';
import styles from './IssueList.module.css';

const IssueList: React.FC<{ issues: Issue[] }> = ({ issues }) => (
  <div className={styles.list}>
    {issues.map(issue => <IssueCard key={issue.id} issue={issue} />)}
  </div>
);

export default IssueList;
