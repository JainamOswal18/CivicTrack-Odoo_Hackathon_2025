// import React, { useEffect, useState } from 'react';
// import FilterPanel from '../../components/common/FilterPanel/FilterPanel';
// import ReportModal from '../../components/forms/ReportModal/ReportModal';
// import IssueList from '../../components/issues/IssueList/IssueList';
// import Header from '../../components/layout/Header/Header';
// import CivicMap from '../../components/map/CivicMap/CivicMap';
// import { useAuth } from '../../context/AuthContext';
// import useGeolocation from '../../hooks/useGeolocation';
// import useIssues from '../../hooks/useIssues';
// import styles from './Dashboard.module.css';

// export interface Issue {
//   id: number;
//   title: string;
//   description: string;
//   category: string;
//   status: 'reported' | 'in_progress' | 'resolved';
//   latitude: number;
//   longitude: number;
//   distance: number;
//   created_at: string;
//   images: string[];
//   reporter_id?: number;
//   is_anonymous: boolean;
// }

// export interface IssueFilters {
//   category?: string;
//   status?: string;
//   radius: number;
// }

// const Dashboard: React.FC = () => {
//   const { user, socket } = useAuth();
//   const { location, error: locationError, requestLocation } = useGeolocation();
//   const [showReportModal, setShowReportModal] = useState(false);
//   const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
//   const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
//   const [filters, setFilters] = useState<IssueFilters>({
//     radius: 3
//   });

//   const {
//     issues,
//     loading,
//     error,
//     fetchIssues,
//     createIssue
//   } = useIssues(location, filters);

//   // Request location on component mount
//   useEffect(() => {
//     requestLocation();
//   }, []);

//   // Join location-based socket room
//   useEffect(() => {
//     if (socket && location) {
//       socket.emit('join-location', location);
//     }
//   }, [socket, location]);

//   // Listen for real-time issue updates
//   useEffect(() => {
//     if (socket) {
//       const handleNewIssue = (issue: Issue) => {
//         fetchIssues(); // Refresh issues list
//       };

//       const handleIssueUpdate = (issueUpdate: any) => {
//         fetchIssues(); // Refresh issues list
//       };

//       socket.on('new-issue', handleNewIssue);
//       socket.on('issue-update', handleIssueUpdate);

//       return () => {
//         socket.off('new-issue', handleNewIssue);
//         socket.off('issue-update', handleIssueUpdate);
//       };
//     }
//   }, [socket, fetchIssues]);

//   const handleReportSuccess = () => {
//     setShowReportModal(false);
//     fetchIssues(); // Refresh issues
//   };

//   const handleIssueClick = (issue: Issue) => {
//     setSelectedIssue(issue);
//   };

//   if (locationError) {
//     return (
//       <div className={styles.errorContainer}>
//         <div className={styles.errorCard}>
//           <h2>Location Access Required</h2>
//           <p>CivicTrack needs your location to show nearby civic issues.</p>
//           <button onClick={requestLocation} className={styles.retryButton}>
//             Enable Location
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!location) {
//     return (
//       <div className={styles.loadingContainer}>
//         <div className={styles.spinner}></div>
//         <p>Getting your location...</p>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.dashboard}>
//       <Header
//         onReportClick={() => setShowReportModal(true)}
//         viewMode={viewMode}
//         onViewModeChange={setViewMode}
//       />

//       <div className={styles.content}>
//         <aside className={styles.sidebar}>
//           <FilterPanel
//             filters={filters}
//             onFiltersChange={setFilters}
//             issueCount={issues.length}
//           />
//         </aside>

//         <main className={styles.mainContent}>
//           {viewMode === 'map' ? (
//             <CivicMap
//               center={[location.lat, location.lng]}
//               issues={issues}
//               onIssueClick={handleIssueClick}
//               userLocation={location}
//             />
//           ) : (
//             <IssueList
//               issues={issues}
//               loading={loading}
//               onIssueClick={handleIssueClick}
//             />
//           )}
//         </main>
//       </div>

//       {showReportModal && (
//         <ReportModal
//           userLocation={location}
//           onClose={() => setShowReportModal(false)}
//           onSuccess={handleReportSuccess}
//         />
//       )}

//       {selectedIssue && (
//         <div className={styles.issueModal}>
//           {/* Issue detail modal content */}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;
import React, { useEffect, useState } from 'react';
import ReportModal from '../../components/forms/ReportModal';
import IssueList from '../../components/issues/IssueList';
import Header from '../../components/layout/Header';
import CivicMap from '../../components/map/CivicMap';
import useGeolocation from '../../hooks/useGeolocation';
import useIssues from '../../hooks/useIssues';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const { location, error: locErr, requestLocation } = useGeolocation();
  const [view, setView] = useState<'map'|'list'>('map');
  const [showModal, setShowModal] = useState(false);
  const { issues, loading, fetchIssues } = useIssues(location, { radius: 3 });

//   useEffect(() => { if (location) fetchIssues(); }, [location, fetchIssues]);
 useEffect(() => {
    if (!location) {
      requestLocation();        // call to request browser location
    } else {
      fetchIssues();
    }
  }, [location, requestLocation, fetchIssues]);
  if (locErr) return <div>Error: {locErr}</div>;
  if (!location) return <div>Loading location...</div>;
  

  if (locErr) {
    return <div>Error: {locErr}</div>;
  }
  if (!location) {
    return <div>Requesting location...</div>;
  }
  if (loading) {
    return <div>Loading issues...</div>;
  }

  return (
    <>
      <Header onReport={() => setShowModal(true)} view={view} onView={setView} />
      <div className={styles.container}>
        <aside className={styles.sidebar}>
          {/* filters UI */}
        </aside>
        <main className={styles.main}>
          {view === 'map'
            ? <CivicMap center={[location.lat, location.lng]} issues={issues} />
            : <IssueList issues={issues} />
          }
        </main>
      </div>
      {showModal && <ReportModal location={location} onClose={() => setShowModal(false)} onSuccess={fetchIssues} />}
    </>
  );
};

export default Dashboard;
