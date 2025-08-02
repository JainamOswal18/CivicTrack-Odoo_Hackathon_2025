import { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Issue {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
  address?: string;
  distance: number;
  images: string[];
  created_at: string;
  updated_at: string;
}

interface IssuesMapProps {
  issues: Issue[];
  center: [number, number];
  hasNewData?: boolean;
  className?: string;
}

// Color mapping for different categories
const categoryColors: Record<string, string> = {
  roads: '#ef4444',
  lighting: '#f59e0b',
  water: '#0ea5e9',
  cleanliness: '#22c55e',
  safety: '#a855f7',
  obstructions: '#f97316',
};

// Status colors
const statusColors: Record<string, string> = {
  reported: '#ef4444',
  in_progress: '#f59e0b',
  resolved: '#22c55e',
};

export function IssuesMap({ issues, center, hasNewData = false, className = "" }: IssuesMapProps) {
  const mapRef = useRef<L.Map>(null);

  // Memoize the center position to prevent unnecessary re-renders
  const mapCenter = useMemo(() => center, [center[0], center[1]]);

  // Create custom markers for each issue
  const createCustomMarker = (issue: Issue) => {
    const color = statusColors[issue.status.toLowerCase()] || '#6b7280';
    const categoryColor = categoryColors[issue.category.toLowerCase()] || '#6b7280';
    
    // Create a custom icon with category color as border and status color as fill
    const markerHtml = `
      <div class="relative">
        <div class="w-6 h-6 rounded-full border-2 animate-pulse" 
             style="background-color: ${color}; border-color: ${categoryColor};">
        </div>
        ${issue.status.toLowerCase() === 'resolved' ? 
          '<div class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>' : 
          ''}
      </div>
    `;

    return L.divIcon({
      html: markerHtml,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const formatStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "reported": return "Reported";
      case "in_progress": return "In Progress";
      case "resolved": return "Resolved";
      default: return status;
    }
  };

  const formatCategory = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      roads: "Roads",
      lighting: "Lighting",
      water: "Water Supply",
      cleanliness: "Cleanliness",
      safety: "Public Safety",
      obstructions: "Obstructions"
    };
    return categoryMap[category.toLowerCase()] || category;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "reported": return "bg-red-100 text-red-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Pan to center when it changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.panTo(mapCenter, {
        animate: true,
        duration: 0.5
      });
    }
  }, [mapCenter]);

  return (
    <div className={`relative h-full w-full rounded-lg overflow-hidden shadow-lg ${className}`}>
      <AnimatePresence>
        {hasNewData && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute top-4 right-4 z-[1000] bg-blue-500 text-white px-3 py-1 rounded-full text-sm shadow-lg"
          >
            New Issues Found!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
        <h4 className="text-sm font-semibold mb-3">Issue Status</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Reported</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Resolved</span>
          </div>
        </div>
      </div>

      {/* Issues count */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
        <div className="text-xs text-muted-foreground">
          <span className="font-semibold text-primary">{issues.length}</span> issues found
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="dark:brightness-75"
        ref={mapRef}
        preferCanvas={true}
        minZoom={3}
        maxZoom={18}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          updateWhenZooming={false}
          updateWhenIdle={true}
          keepBuffer={2}
          maxZoom={18}
          minZoom={3}
        />

        {/* Render markers for all issues */}
        {issues.map((issue) => (
          <Marker
            key={issue.id}
            position={[issue.latitude, issue.longitude]}
            icon={createCustomMarker(issue)}
          >
            <Popup className="custom-popup" maxWidth={300}>
              <div className="p-2 min-w-[250px]">
                {/* Issue Image */}
                {issue.images && issue.images.length > 0 && (
                  <div className="mb-3">
                    <img
                      src={`http://localhost:8000${issue.images[0]}`}
                      alt={issue.title}
                      className="w-full h-24 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Issue Title */}
                <h4 className="font-semibold text-sm mb-2 line-clamp-2">{issue.title}</h4>

                {/* Issue Description */}
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {issue.description}
                </p>

                {/* Category and Status */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {formatCategory(issue.category)}
                  </Badge>
                  <Badge className={`text-xs ${getStatusColor(issue.status)}`}>
                    {formatStatus(issue.status)}
                  </Badge>
                </div>

                {/* Meta Information */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{issue.distance.toFixed(1)} km away</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(issue.created_at)}</span>
                  </div>
                </div>

                {/* Address */}
                {issue.address && (
                  <div className="text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {issue.address}
                  </div>
                )}

                {/* View Details Button */}
                                          <Link to={`/issues/${issue.id}`}>
                  <Button size="sm" className="w-full text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}