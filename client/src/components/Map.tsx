import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MapProps {
  apiKey?: string;
}

const Map: React.FC<MapProps> = ({ apiKey }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [tempApiKey, setTempApiKey] = useState(apiKey || '');
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !tempApiKey) return;

    // Initialize map
    mapboxgl.accessToken = tempApiKey;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        zoom: 12,
        center: [77.2090, 28.6139], // Default to Delhi coordinates
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Mock issue markers
      const mockIssues = [
        { id: 1, lng: 77.2090, lat: 28.6139, title: "Pothole on Main Street", category: "Roads", status: "Reported" },
        { id: 2, lng: 77.2100, lat: 28.6150, title: "Street Light Issue", category: "Lighting", status: "In Progress" },
        { id: 3, lng: 77.2080, lat: 28.6130, title: "Water Leak", category: "Water Supply", status: "Resolved" },
        { id: 4, lng: 77.2110, lat: 28.6140, title: "Garbage Collection", category: "Cleanliness", status: "Reported" },
      ];

      // Add markers for issues
      mockIssues.forEach((issue) => {
        const marker = new mapboxgl.Marker({
          color: issue.status === 'Resolved' ? '#10b981' : 
                issue.status === 'In Progress' ? '#f59e0b' : '#ef4444'
        })
          .setLngLat([issue.lng, issue.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-2">
                  <h4 class="font-semibold">${issue.title}</h4>
                  <p class="text-sm text-gray-600">${issue.category}</p>
                  <span class="inline-block px-2 py-1 text-xs rounded ${
                    issue.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                    issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }">${issue.status}</span>
                </div>
              `)
          )
          .addTo(map.current!);
      });

      setIsMapReady(true);

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [tempApiKey]);

  if (!tempApiKey) {
    return (
      <Card className="w-full h-96">
        <CardContent className="p-6 flex flex-col items-center justify-center h-full">
          <h3 className="text-lg font-semibold mb-4">Mapbox API Key Required</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Please enter your Mapbox public token to enable the map view.
            You can get one from <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
          </p>
          <div className="flex gap-2 w-full max-w-md">
            <Input
              type="text"
              placeholder="Enter Mapbox API Key"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
            />
            <Button 
              onClick={() => setIsMapReady(false)}
              disabled={!tempApiKey}
            >
              Load Map
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-96">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg shadow-lg" />
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
          <p>Loading map...</p>
        </div>
      )}
    </div>
  );
};

export default Map;