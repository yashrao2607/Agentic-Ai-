import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface LocationPickerProps {
  onLocationChange: (location: string) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationChange }) => {
  const [location, setLocation] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  const detectLocation = () => {
    setIsDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setLocation(locationString);
          onLocationChange(locationString);
          setIsDetecting(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsDetecting(false);
        }
      );
    }
  };

  return (
    <div>
      <label className="block text-lg font-semibold text-gray-900 mb-3">
        Problem Location
      </label>
      <div className="flex space-x-4">
        <div className="flex-1">
          <input
            type="text"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              onLocationChange(e.target.value);
            }}
            placeholder="Enter address or coordinates"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="button"
          onClick={detectLocation}
          disabled={isDetecting}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
            isDetecting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isDetecting ? (
            <Navigation className="w-5 h-5 animate-spin" />
          ) : (
            <MapPin className="w-5 h-5" />
          )}
          <span>{isDetecting ? 'Detecting...' : 'Detect'}</span>
        </button>
      </div>
      {location && (
        <p className="text-green-600 text-sm mt-2">
          📍 Location captured: {location}
        </p>
      )}
    </div>
  );
};

export default LocationPicker;