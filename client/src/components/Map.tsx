// // import React, { useEffect, useRef, useState } from 'react';
// // import mapboxgl from 'mapbox-gl';
// // import 'mapbox-gl/dist/mapbox-gl.css';
// // import { Card, CardContent } from "@/components/ui/card";
// // import { Input } from "@/components/ui/input";
// // import { Button } from "@/components/ui/button";

// // interface MapProps {
// //   apiKey?: string;
// // }

// // const Map: React.FC<MapProps> = ({ apiKey }) => {
// //   const mapContainer = useRef<HTMLDivElement>(null);
// //   const map = useRef<mapboxgl.Map | null>(null);
// //   const [tempApiKey, setTempApiKey] = useState(apiKey || '');
// //   const [isMapReady, setIsMapReady] = useState(false);

// //   useEffect(() => {
// //     if (!mapContainer.current || !tempApiKey) return;

// //     // Initialize map
// //     mapboxgl.accessToken = tempApiKey;
    
// //     try {
// //       map.current = new mapboxgl.Map({
// //         container: mapContainer.current,
// //         style: 'mapbox://styles/mapbox/light-v11',
// //         zoom: 12,
// //         center: [77.2090, 28.6139], // Default to Delhi coordinates
// //       });

// //       // Add navigation controls
// //       map.current.addControl(
// //         new mapboxgl.NavigationControl({
// //           visualizePitch: true,
// //         }),
// //         'top-right'
// //       );

// //       // Mock issue markers
// //       const mockIssues = [
// //         { id: 1, lng: 77.2090, lat: 28.6139, title: "Pothole on Main Street", category: "Roads", status: "Reported" },
// //         { id: 2, lng: 77.2100, lat: 28.6150, title: "Street Light Issue", category: "Lighting", status: "In Progress" },
// //         { id: 3, lng: 77.2080, lat: 28.6130, title: "Water Leak", category: "Water Supply", status: "Resolved" },
// //         { id: 4, lng: 77.2110, lat: 28.6140, title: "Garbage Collection", category: "Cleanliness", status: "Reported" },
// //       ];

// //       // Add markers for issues
// //       mockIssues.forEach((issue) => {
// //         const marker = new mapboxgl.Marker({
// //           color: issue.status === 'Resolved' ? '#10b981' : 
// //                 issue.status === 'In Progress' ? '#f59e0b' : '#ef4444'
// //         })
// //           .setLngLat([issue.lng, issue.lat])
// //           .setPopup(
// //             new mapboxgl.Popup({ offset: 25 })
// //               .setHTML(`
// //                 <div class="p-2">
// //                   <h4 class="font-semibold">${issue.title}</h4>
// //                   <p class="text-sm text-gray-600">${issue.category}</p>
// //                   <span class="inline-block px-2 py-1 text-xs rounded ${
// //                     issue.status === 'Resolved' ? 'bg-green-100 text-green-800' :
// //                     issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
// //                     'bg-red-100 text-red-800'
// //                   }">${issue.status}</span>
// //                 </div>
// //               `)
// //           )
// //           .addTo(map.current!);
// //       });

// //       setIsMapReady(true);

// //     } catch (error) {
// //       console.error('Error initializing map:', error);
// //     }

// //     // Cleanup
// //     return () => {
// //       map.current?.remove();
// //     };
// //   }, [tempApiKey]);

// //   if (!tempApiKey) {
// //     return (
// //       <Card className="w-full h-96">
// //         <CardContent className="p-6 flex flex-col items-center justify-center h-full">
// //           <h3 className="text-lg font-semibold mb-4">Mapbox API Key Required</h3>
// //           <p className="text-sm text-muted-foreground mb-4 text-center">
// //             Please enter your Mapbox public token to enable the map view.
// //             You can get one from <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
// //           </p>
// //           <div className="flex gap-2 w-full max-w-md">
// //             <Input
// //               type="text"
// //               placeholder="Enter Mapbox API Key"
// //               value={tempApiKey}
// //               onChange={(e) => setTempApiKey(e.target.value)}
// //             />
// //             <Button 
// //               onClick={() => setIsMapReady(false)}
// //               disabled={!tempApiKey}
// //             >
// //               Load Map
// //             </Button>
// //           </div>
// //         </CardContent>
// //       </Card>
// //     );
// //   }

// //   return (
// //     <div className="relative w-full h-96">
// //       <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
// //       {!isMapReady && (
// //         <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
// //           <p>Loading map...</p>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default Map;
// import { AnimatePresence, motion } from 'framer-motion';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import { useEffect, useMemo } from 'react';
// import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';

// // Fix default marker icon paths
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl:
//     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl:
//     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl:
//     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

// export interface Issue {
//   id: number;
//   title: string;
//   description: string;
//   category: string;
//   status: 'reported' | 'in_progress' | 'resolved';
//   latitude: number;
//   longitude: number;
//   images: string[];   // array of image filenames
// }

// interface MapComponentProps {
//   issues: Issue[];          // dynamic list of issues to display
//   center: [number, number]; // user location or default center
//   zoom?: number;
//   hasNewData?: boolean;     // trigger animation when new issues arrive
// }

// const categoryColors: Record<string, string> = {
//   roads: '#ef4444',
//   lighting: '#f59e0b',
//   water: '#0088ff',
//   cleanliness: '#00aa00',
//   safety: '#ff0088',
//   obstructions: '#8800ff',
// };

// function AnimatedMarker({ issue }: { issue: Issue }) {
//   // Create a custom SVG icon based on category & status
//   const color = categoryColors[issue.category] || '#666';
//   const opacity = issue.status === 'resolved' ? 0.5 : 1;
//   const svg = `
//     <svg width="25" height="25" viewBox="0 0 25 25">
//       <circle cx="12.5" cy="12.5" r="10" fill="${color}" opacity="${opacity}" stroke="#fff" stroke-width="2"/>
//     </svg>`;
//   const icon = L.divIcon({
//     html: `<div class="animate-scale-in">${svg}</div>`,
//     className: '',
//     iconSize: [25, 25],
//     iconAnchor: [12.5, 12.5],
//   });

//   return (
//     <Marker position={[issue.latitude, issue.longitude]} icon={icon}>
//       <Popup>
//         <div className="p-2">
//           <h4 className="font-semibold">{issue.title}</h4>
//           <p className="text-sm">{issue.description}</p>
//           <p className="text-xs text-gray-600">
//             <strong>Category:</strong> {issue.category}{' '}
//             <strong>Status:</strong> {issue.status}
//           </p>
//           {issue.images.length > 0 && (
//             <div className="mt-1 flex space-x-1">
//               {issue.images.slice(0, 3).map((img, i) => (
//                 <img
//                   key={i}
//                   src={`${process.env.REACT_APP_API_URL}/uploads/issues/${img}`}
//                   alt=""
//                   className="w-8 h-8 object-cover rounded"
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </Popup>
//     </Marker>
//   );
// }

// // Component to pan map when center changes
// function MapPanner({ center }: { center: [number, number] }) {
//   const map = useMap();
//   useEffect(() => {
//     map.setView(center);
//   }, [center, map]);
//   return null;
// }

// export function MapComponent({
//   issues,
//   center,
//   zoom = 13,
//   hasNewData = false,
// }: MapComponentProps) {
//   // Memoize center to avoid re-creating MapContainer
//   const mapCenter = useMemo(() => center, [center]);

//   return (
//     <div className="relative h-full w-full rounded-lg overflow-hidden shadow-lg">
//       <AnimatePresence>
//         {hasNewData && (
//           <motion.div
//             initial={{ scale: 0.8, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.8, opacity: 0 }}
//             className="absolute top-4 right-4 z-10 bg-blue-500 text-white px-3 py-1 rounded-full text-sm"
//           >
//             New Reports!
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <MapContainer
//         center={mapCenter}
//         zoom={zoom}
//         style={{ height: '100%', width: '100%' }}
//         whenCreated={(map) => {
//           // optional: attach mapRef if needed
//         }}
//       >
//         <MapPanner center={mapCenter} />
//         <TileLayer
//           attribution='&copy; OpenStreetMap contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />

//         {/* Render one marker per issue */}
//         {issues.map((issue) => (
//           <AnimatedMarker key={issue.id} issue={issue} />
//         ))}
//       </MapContainer>
//     </div>
//   );
// }
// src/components/MiniMap.tsx
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

// Fix marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  latitude: number;
  longitude: number;
}

export const Map: React.FC<MapProps> = ({ latitude, longitude }) => {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      attributionControl={false}
      zoomControl={false}
      dragging={false}
      doubleClickZoom={false}
      scrollWheelZoom={false}
      touchZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[latitude, longitude]} />
    </MapContainer>
  );
};
