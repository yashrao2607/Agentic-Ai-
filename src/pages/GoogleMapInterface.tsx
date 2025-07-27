import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader, 
  ServerCrash,
  X,
  Map as MapIcon,
  RefreshCw,
  Bug
} from 'lucide-react';

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
  description?: string;
}

interface GoogleMapInterfaceProps {
  darkMode?: boolean;
}

// --- Google Maps Types ---
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleMapInterface: React.FC<GoogleMapInterfaceProps> = ({ darkMode = false }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [infoWindow, setInfoWindow] = useState<any>(null);

  // --- Fetch problems from API ---
  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3001/api/problems');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setProblems(data.problems || []);
      console.log(`✅ Fetched ${data.problems?.length || 0} problems from API`);
      
    } catch (err) {
      console.error('❌ Error fetching problems:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch problems');
      
      // Fallback to test data if API fails
      const testProblems: Problem[] = [
        {
          id: 'test-1',
          title: 'Water Logging Issue',
          category: 'Environment',
          status: 'submitted',
          location: { lat: 12.9716, lng: 77.5946 },
          createdAt: new Date(),
          source: 'raw_submissions',
          description: 'Water logging near BIC area causing traffic disruption'
        },
        {
          id: 'test-2',
          title: 'Broken Street Light',
          category: 'Infrastructure',
          status: 'in_progress',
          location: { lat: 12.9726, lng: 77.5956 },
          createdAt: new Date(),
          source: 'issues',
          assignedTeam: 'Electrical Dept',
          description: 'Street light not working since last week'
        },
        {
          id: 'test-3',
          title: 'Garbage Collection Issue',
          category: 'Waste Management',
          status: 'submitted',
          location: { lat: 12.9706, lng: 77.5936 },
          createdAt: new Date(),
          source: 'raw_submissions',
          description: 'Garbage not collected for 3 days'
        }
      ];
      setProblems(testProblems);
      console.log('📋 Using fallback test data');
    } finally {
      setLoading(false);
    }
  };

  // --- Initialize Google Maps ---
  const initializeMap = () => {
    console.log('🔧 Attempting to initialize map...');
    console.log('Google Maps available:', !!window.google);
    console.log('Map container available:', !!mapRef.current);
    
    if (!window.google) {
      console.error('❌ Google Maps API not available');
      setError('Google Maps API not loaded');
      return;
    }

    if (!mapRef.current) {
      console.error('❌ Map container not available');
      setError('Map container not found');
      return;
    }

    try {
      const mapCenter = { lat: 12.9716, lng: 77.5946 }; // Bengaluru center
      
      console.log('🗺️ Creating map with center:', mapCenter);
      
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 12,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: darkMode ? [
          { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] }
        ] : []
      });

      const newInfoWindow = new window.google.maps.InfoWindow();
      
      setMap(newMap);
      setInfoWindow(newInfoWindow);
      setError(null); // Clear any previous errors
      console.log('✅ Map initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing map:', error);
      setError('Failed to initialize map. Please refresh the page.');
    }
  };

  // --- Add markers to map ---
  const addMarkersToMap = () => {
    if (!map || !infoWindow || problems.length === 0) return;

    const categoryColors: { [key: string]: string } = {
      'environment': 'blue',
      'water logging': 'blue',
      'waste-management': 'yellow',
      'infrastructure': 'orange',
      'traffic': 'red',
      'water supply': 'cyan',
      'public-safety': 'purple',
      'default': 'red'
    };

    problems.forEach((problem) => {
      if (problem.location && problem.location.lat && problem.location.lng) {
        const category = problem.category ? problem.category.toLowerCase() : 'default';
        const color = categoryColors[category] || categoryColors['default'];
        const iconUrl = `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`;

        const marker = new window.google.maps.Marker({
          position: { lat: problem.location.lat, lng: problem.location.lng },
          map: map,
          title: problem.title,
          icon: iconUrl
        });

        // Add click listener for simple info display
        marker.addListener('click', () => {
          // Show simple info window with title and description
          const content = `
            <div style="padding: 10px; max-width: 300px;">
              <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: bold;">
                ${problem.title || 'Issue'}
              </h3>
              ${problem.description ? 
                `<p style="margin: 0; color: #666; font-size: 14px;">${problem.description}</p>` : 
                '<p style="margin: 0; color: #999; font-size: 12px;">No description available</p>'
              }
            </div>
          `;
          
          infoWindow.setContent(content);
          infoWindow.open(map, marker);
          
          // Also update selected problem for bottom panel
          setSelectedProblem(problem);
        });
      }
    });
  };

  // --- Load Google Maps API ---
  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      // Check if script already exists
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        console.log('✅ Google Maps API script already exists');
        // Wait a bit longer for the API to be fully loaded
        setTimeout(() => {
          if (window.google && window.google.maps) {
            initializeMap();
          } else {
            console.log('⏳ Waiting for Google Maps API to be ready...');
            setTimeout(initializeMap, 1000);
          }
        }, 500);
        return;
      }

      console.log('📦 Loading Google Maps API...');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDVhfCcmITVyGYPba3Zr8E30mPoseleEL4`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Google Maps API loaded successfully');
        setTimeout(() => {
          initializeMap();
        }, 200); // Small delay to ensure API is fully loaded
      };
      
      script.onerror = () => {
        console.error('❌ Failed to load Google Maps API');
        setError('Failed to load Google Maps API. Please check your internet connection.');
      };
      
      document.head.appendChild(script);
    };

    // Add a small delay before trying to load the map
    setTimeout(() => {
      if (!window.google) {
        loadGoogleMapsAPI();
      } else {
        console.log('✅ Google Maps API already available');
        initializeMap();
      }
    }, 100);
  }, []);

  // --- Initialize data and markers ---
  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    if (map && problems.length > 0) {
      addMarkersToMap();
    }
  }, [map, problems]);

  // --- Event Handlers ---
  const handleRefresh = () => {
    fetchProblems();
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
    <div className="h-screen flex flex-col">
      {/* Map Container */}
      <div className="h-[65vh] w-full relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading map data...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
            <div className="flex items-center gap-2">
              <ServerCrash className="w-5 h-5" />
              <span className="font-semibold">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {/* Google Maps Container */}
        <div 
          ref={mapRef} 
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        />
      </div>
      
      {/* Control Buttons */}
      <div className="absolute top-4 left-4 z-40 flex gap-2">
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="px-3 py-2 rounded-lg bg-blue-600 text-white shadow-lg text-sm flex items-center gap-1 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        <button 
          onClick={() => setShowDebug(!showDebug)}
          className="px-3 py-2 rounded-lg bg-gray-600 text-white shadow-lg text-sm flex items-center gap-1"
        >
          <Bug className="w-4 h-4" />
          Debug
        </button>
      </div>
      
      {/* Info Panel */}
      <div className={`h-[35vh] w-full overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedProblem ? selectedProblem.id : 'empty'}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full h-full p-6 shadow-2xl rounded-t-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            {!selectedProblem ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MapIcon className={`w-16 h-16 mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>🗺 Live Civic Issues Map</h2>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {problems.length > 0 
                    ? "Click any marker on the map to see details!" 
                    : "No reports found. Submit a new report to see it on the map!"
                  }
                </p>
                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {loading ? "🔄 Loading data..." : `Total reports: ${problems.length}`}
                </p>
                <p className={`text-xs ${darkMode ? 'text-gray-600' : 'text-gray-600'}`}>
                  📊 New: {problems.filter(p => p.source === 'raw_submissions').length} | 
                  📋 Active: {problems.filter(p => p.source === 'issues').length}
                </p>
                
                {showDebug && (
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                    <p className="font-semibold">📍 Map Center:</p>
                    <p>Lat: 12.9716, Lng: 77.5946 (Bengaluru)</p>
                    <p className="font-semibold mt-1">🎯 Problems:</p>
                    {problems.map(p => (
                      <p key={p.id}>• {p.title}: {p.location.lat.toFixed(4)}, {p.location.lng.toFixed(4)}</p>
                    ))}
                  </div>
                )}
                
                {/* Problem List */}
                {problems.length > 0 && (
                  <div className="mt-4 w-full max-h-32 overflow-y-auto">
                    <h3 className="font-semibold mb-2">Recent Problems:</h3>
                    <div className="space-y-1">
                      {problems.slice(0, 5).map(problem => (
                        <button
                          key={problem.id}
                          onClick={() => setSelectedProblem(problem)}
                          className={`w-full text-left p-2 rounded text-xs hover:bg-gray-100 transition-colors ${
                            problem.source === 'raw_submissions' ? 'border-l-4 border-blue-500' :
                            problem.status === 'in_progress' ? 'border-l-4 border-orange-500' :
                            problem.status === 'completed' ? 'border-l-4 border-green-500' :
                            'border-l-4 border-gray-500'
                          }`}
                        >
                          <div className="font-medium">{problem.title}</div>
                          <div className="text-gray-500">{problem.category} • {problem.status}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Environment/Water</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Waste Management</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>Infrastructure</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Traffic</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>Public Safety</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      📍 {selectedProblem.title}
                    </h1>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedProblem.status === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedProblem.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                        selectedProblem.status === 'pending_assignment' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedProblem.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800`}>
                        {selectedProblem.category}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedProblem(null)} 
                    className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                  >
                    <X />
                  </button>
                </div>

                {/* Description Section */}
                {selectedProblem.description && (
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      📝 Description
                    </h3>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {selectedProblem.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        📊 Details
                      </h3>
                      <div className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex justify-between">
                          <span>Reported:</span>
                          <span className="font-medium">{selectedProblem.createdAt.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Source:</span>
                          <span className="font-medium capitalize">{selectedProblem.source.replace('_', ' ')}</span>
                        </div>
                        {selectedProblem.assignedTeam && (
                          <div className="flex justify-between">
                            <span>Assigned to:</span>
                            <span className="font-medium text-green-600">{selectedProblem.assignedTeam}</span>
                          </div>
                        )}
                        {selectedProblem.workOrderId && (
                          <div className="flex justify-between">
                            <span>Work Order:</span>
                            <span className="font-medium text-blue-600">{selectedProblem.workOrderId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      📍 Location
                    </h3>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="font-mono text-sm">
                          <div>Latitude: {selectedProblem.location.lat.toFixed(6)}</div>
                          <div>Longitude: {selectedProblem.location.lng.toFixed(6)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <a 
                    href={`https://www.google.com/maps?q=${selectedProblem.location.lat},${selectedProblem.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MapIcon className="w-4 h-4" />
                    View on Google Maps
                  </a>
                  
                  {selectedProblem.imageUrl && (
                    <a 
                      href={selectedProblem.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      📷 View Image
                    </a>
                  )}
                  
                  <button 
                    onClick={() => {
                      // Copy location to clipboard
                      navigator.clipboard.writeText(`${selectedProblem.location.lat}, ${selectedProblem.location.lng}`);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    📋 Copy Coordinates
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GoogleMapInterface; 