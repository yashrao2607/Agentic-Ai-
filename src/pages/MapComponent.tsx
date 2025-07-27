import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Types ---
interface Problem {
  id: string;
  title: string;
  category: string;
  status: string;
  location: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  imageUrl?: string;
  assignedTeam?: string;
  workOrderId?: string;
  source: 'raw_submissions' | 'issues';
}

interface MapComponentProps {
  problems: Problem[];
  onProblemSelect: (problem: Problem) => void;
  defaultCenter: { lat: number; lng: number };
}

// Custom marker icons
const createCustomIcon = (color: string) => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  `)}`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

const blueIcon = createCustomIcon('#3B82F6');
const orangeIcon = createCustomIcon('#F97316');
const greenIcon = createCustomIcon('#10B981');
const yellowIcon = createCustomIcon('#EAB308');
const purpleIcon = createCustomIcon('#8B5CF6');
const redIcon = createCustomIcon('#EF4444');

// Map bounds updater component
const MapBoundsUpdater: React.FC<{ problems: Problem[] }> = ({ problems }) => {
  const map = useMap();
  
  useEffect(() => {
    if (problems.length > 0) {
      const bounds = problems.map(problem => [problem.location.lat, problem.location.lng]);
      map.fitBounds(bounds as [number, number][]);
    }
  }, [problems, map]);
  
  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ problems, onProblemSelect, defaultCenter }) => {
  const getMarkerIcon = (problem: Problem) => {
    if (problem.source === 'raw_submissions') return blueIcon;
    if (problem.status === 'in_progress') return orangeIcon;
    if (problem.status === 'completed') return greenIcon;
    if (problem.status === 'pending_assignment') return yellowIcon;
    if (problem.status === 'scheduled') return purpleIcon;
    return redIcon;
  };

  const getStatusColor = (problem: Problem) => {
    if (problem.source === 'raw_submissions') return 'text-blue-600';
    if (problem.status === 'in_progress') return 'text-orange-600';
    if (problem.status === 'completed') return 'text-green-600';
    if (problem.status === 'pending_assignment') return 'text-yellow-600';
    if (problem.status === 'scheduled') return 'text-purple-600';
    return 'text-red-600';
  };

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      className="z-10"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {problems.map(problem => (
        <Marker
          key={problem.id}
          position={[problem.location.lat, problem.location.lng]}
          icon={getMarkerIcon(problem)}
          eventHandlers={{
            click: () => onProblemSelect(problem)
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-sm">{problem.title}</h3>
              <p className="text-xs text-gray-600">{problem.category}</p>
              <p className={`text-xs font-medium ${getStatusColor(problem)}`}>
                {problem.status}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
      
      <MapBoundsUpdater problems={problems} />
    </MapContainer>
  );
};

export default MapComponent; 