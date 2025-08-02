// src/components/map/CivicMap.tsx
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Issue } from '../../types';
import styles from './CivicMap.module.css';

interface Props {
  center: [number, number];    // tuple type
  issues: Issue[];
}

const defaultIcon = L.icon({
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const CivicMap: React.FC<Props> = ({ center, issues }) => (
  <MapContainer center={center} zoom={14} className={styles.mapContainer}>
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {issues.map(issue => (
      <Marker
        key={issue.id}
        position={[issue.latitude, issue.longitude]}
        icon={defaultIcon}
      >
        <Popup>
          <strong>{issue.title}</strong><br />
          {issue.category} • {issue.status}<br />
          {issue.distance.toFixed(2)} km
        </Popup>
      </Marker>
    ))}
  </MapContainer>
);

export default CivicMap;
