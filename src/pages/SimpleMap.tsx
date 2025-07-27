import React, { useState, useEffect, useRef } from 'react';
import { MapIcon } from 'lucide-react';

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

interface SimpleMapProps {
  problems: Problem[];
  onProblemSelect: (problem: Problem) => void;
  defaultCenter: { lat: number; lng: number };
}

const SimpleMap: React.FC<SimpleMapProps> = ({ problems, onProblemSelect, defaultCenter }) => {
  const [mapBounds, setMapBounds] = useState({
    north: defaultCenter.lat + 0.01,
    south: defaultCenter.lat - 0.01,
    east: defaultCenter.lng + 0.01,
    west: defaultCenter.lng - 0.01
  });
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(13);
  const mapRef = useRef<HTMLDivElement>(null);

  const getMarkerColor = (problem: Problem) => {
    if (problem.source === 'raw_submissions') return 'bg-blue-500';
    if (problem.status === 'in_progress') return 'bg-orange-500';
    if (problem.status === 'completed') return 'bg-green-500';
    if (problem.status === 'pending_assignment') return 'bg-yellow-500';
    if (problem.status === 'scheduled') return 'bg-purple-500';
    return 'bg-red-500';
  };

  // Convert lat/lng to pixel position on the map
  const latLngToPixel = (lat: number, lng: number) => {
    const mapWidth = mapRef.current?.clientWidth || 800;
    const mapHeight = mapRef.current?.clientHeight || 600;
    
    const latPercent = (lat - mapBounds.south) / (mapBounds.north - mapBounds.south);
    const lngPercent = (lng - mapBounds.west) / (mapBounds.east - mapBounds.west);
    
    return {
      x: lngPercent * mapWidth,
      y: (1 - latPercent) * mapHeight // Invert Y axis
    };
  };

  // Handle map pan
  const handleMapPan = (direction: 'up' | 'down' | 'left' | 'right') => {
    const panAmount = 0.005;
    setMapCenter(prev => {
      let newLat = prev.lat;
      let newLng = prev.lng;
      
      switch (direction) {
        case 'up':
          newLat += panAmount;
          break;
        case 'down':
          newLat -= panAmount;
          break;
        case 'left':
          newLng -= panAmount;
          break;
        case 'right':
          newLng += panAmount;
          break;
      }
      
      return { lat: newLat, lng: newLng };
    });
    
    // Update bounds based on new center
    const offset = 0.01 / Math.pow(2, zoom - 10);
    setMapBounds({
      north: mapCenter.lat + offset,
      south: mapCenter.lat - offset,
      east: mapCenter.lng + offset,
      west: mapCenter.lng - offset
    });
  };

  // Handle zoom
  const handleZoom = (newZoom: number) => {
    setZoom(newZoom);
    const offset = 0.01 / Math.pow(2, newZoom - 10);
    setMapBounds({
      north: mapCenter.lat + offset,
      south: mapCenter.lat - offset,
      east: mapCenter.lng + offset,
      west: mapCenter.lng - offset
    });
  };

  // Update bounds when center changes
  useEffect(() => {
    const offset = 0.01 / Math.pow(2, zoom - 10);
    setMapBounds({
      north: mapCenter.lat + offset,
      south: mapCenter.lat - offset,
      east: mapCenter.lng + offset,
      west: mapCenter.lng - offset
    });
  }, [mapCenter, zoom]);

  // Generate OpenStreetMap URL based on current bounds
  const getMapUrl = () => {
    const bbox = `${mapBounds.west},${mapBounds.south},${mapBounds.east},${mapBounds.north}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${mapCenter.lat},${mapCenter.lng}`;
  };

  return (
    <div className="relative w-full h-full bg-gray-100" ref={mapRef}>
      {/* OpenStreetMap Background */}
      <iframe
        src={getMapUrl()}
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        title="Civic Issues Map"
        className="absolute inset-0 z-0"
      />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        <div className="bg-white rounded-lg shadow-lg p-2">
          <div className="text-xs font-semibold mb-2">Map Controls</div>
          <div className="grid grid-cols-3 gap-1">
            <button 
              onClick={() => handleMapPan('up')}
              className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
            >
              ↑
            </button>
            <button 
              onClick={() => handleMapPan('left')}
              className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
            >
              ←
            </button>
            <button 
              onClick={() => handleMapPan('right')}
              className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
            >
              →
            </button>
            <div></div>
            <button 
              onClick={() => handleMapPan('down')}
              className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
            >
              ↓
            </button>
            <div></div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-2">
          <div className="text-xs font-semibold mb-2">Zoom</div>
          <div className="flex gap-1">
            <button 
              onClick={() => handleZoom(Math.max(8, zoom - 1))}
              className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
            >
              -
            </button>
            <span className="text-xs px-2 py-1">{zoom}</span>
            <button 
              onClick={() => handleZoom(Math.min(18, zoom + 1))}
              className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
            >
              +
            </button>
          </div>
        </div>
      </div>
      
      {/* Dynamic Markers */}
      {problems.map(problem => {
        const pixelPos = latLngToPixel(problem.location.lat, problem.location.lng);
        const color = getMarkerColor(problem);
        
        // Only show markers that are within the current map bounds
        const isVisible = problem.location.lat >= mapBounds.south && 
                         problem.location.lat <= mapBounds.north &&
                         problem.location.lng >= mapBounds.west && 
                         problem.location.lng <= mapBounds.east;
        
        if (!isVisible) return null;
        
        return (
          <button
            key={problem.id}
            onClick={() => onProblemSelect(problem)}
            className={`absolute w-4 h-4 ${color} rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 hover:scale-125 transition-transform cursor-pointer z-20`}
            style={{
              left: `${pixelPos.x}px`,
              top: `${pixelPos.y}px`,
            }}
            title={problem.title}
          />
        );
      })}
      
      {/* Map Legend */}
      <div className="absolute top-4 left-4 z-30 bg-white bg-opacity-90 rounded-lg p-2 shadow-lg">
        <div className="text-xs font-semibold mb-2">Legend:</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>New Reports</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>
      
      {/* Map Info */}
      <div className="absolute bottom-4 left-4 z-30 bg-white bg-opacity-90 rounded-lg p-2 shadow-lg">
        <div className="text-xs">
          <div>Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}</div>
          <div>Zoom: {zoom}</div>
          <div>Markers: {problems.filter(p => 
            p.location.lat >= mapBounds.south && 
            p.location.lat <= mapBounds.north &&
            p.location.lng >= mapBounds.west && 
            p.location.lng <= mapBounds.east
          ).length}</div>
        </div>
      </div>
    </div>
  );
};

export default SimpleMap; 