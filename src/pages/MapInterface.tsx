import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader, 
  ServerCrash,
  X,
  Map as MapIcon,
  Plus,
  Trash2,
  Bug,
  RefreshCw
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
}

interface MapInterfaceProps {
  darkMode?: boolean;
}

// --- Map Configuration ---
const defaultCenter = { lat: 12.9716, lng: 77.5946 }; // BIC (Bangalore International Centre)

// Error Boundary Component
class MapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Map Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <MapIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Map Loading Error</h3>
            <p className="text-gray-500 mb-4">There was an issue loading the map component.</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Import map components directly
import SimpleMap from './SimpleMap';
import GoogleMapInterface from './GoogleMapInterface';

const MapInterface: React.FC<MapInterfaceProps> = ({ darkMode = false }) => {
  // --- State ---
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [mapKey, setMapKey] = useState(0); // For forcing map re-render

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
      title: 'Pothole on Main Street',
      category: 'Infrastructure',
      status: 'submitted',
      location: { lat: 28.6139, lng: 77.2090 },
      createdAt: new Date(),
      source: 'raw_submissions'
    },
    {
      id: 'test-2',
      title: 'Broken Street Light',
      category: 'Street Lighting',
      status: 'in_progress',
      location: { lat: 28.6149, lng: 77.2080 },
      createdAt: new Date(),
      source: 'issues',
      assignedTeam: 'Electrical Dept'
    },
    {
      id: 'test-3',
      title: 'Garbage Pile',
      category: 'Waste Management',
      status: 'submitted',
      location: { lat: 28.6129, lng: 77.2100 },
      createdAt: new Date(),
      source: 'raw_submissions'
    },
    {
      id: 'test-4',
      title: 'Water Leakage',
      category: 'Water Supply',
      status: 'completed',
      location: { lat: 28.6159, lng: 77.2070 },
      createdAt: new Date(),
      source: 'issues',
      assignedTeam: 'Water Supply Dept',
      workOrderId: 'WO-2024-001'
    },
    {
      id: 'test-5',
      title: 'Traffic Signal Broken',
      category: 'Traffic',
      status: 'pending_assignment',
      location: { lat: 28.6135, lng: 77.2095 },
      createdAt: new Date(),
      source: 'issues'
    }
  ];
      setProblems(testProblems);
      console.log('📋 Using fallback test data');
    } finally {
      setLoading(false);
    }
  };

  // --- Initialize data ---
  useEffect(() => {
    fetchProblems();
  }, []);

  // --- Event Handlers ---
  const handleProblemSelect = (problem: Problem) => {
    console.log("📍 Problem selected:", problem.title);
    setSelectedProblem(problem);
  };

  const handleRefresh = () => {
    fetchProblems();
    setMapKey(prev => prev + 1); // Force map re-render
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
        
        <MapErrorBoundary>
          <GoogleMapInterface 
            darkMode={darkMode}
            />
        </MapErrorBoundary>
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
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Live Civic Issues Map</h2>
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
                    <p>Lat: {defaultCenter.lat.toFixed(6)}, Lng: {defaultCenter.lng.toFixed(6)}</p>
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
                          onClick={() => handleProblemSelect(problem)}
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
                    <span>New Reports (Blue)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Pending Assignment (Yellow)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>In Progress (Orange)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>Scheduled (Purple)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Completed (Green)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`font-bold text-2xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProblem.title}</p>
                    <p className={`text-md font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{selectedProblem.category}</p>
                  </div>
                  <button onClick={() => setSelectedProblem(null)} className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
                    <X />
                  </button>
                </div>
                <div className="mt-4">
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status: <span className="font-semibold">{selectedProblem.status}</span></p>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Reported: {selectedProblem.createdAt.toLocaleDateString()}</p>
                  {selectedProblem.assignedTeam && (
                    <p className={`${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      ✅ Assigned to: {selectedProblem.assignedTeam}
                    </p>
                  )}
                  {selectedProblem.workOrderId && (
                    <p className={`${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      📋 Work Order: {selectedProblem.workOrderId}
                    </p>
                  )}
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    📍 Location: {selectedProblem.location.lat.toFixed(6)}, {selectedProblem.location.lng.toFixed(6)}
                  </p>
                  
                  {/* Map Link */}
                  <div className="mt-4">
                    <a 
                      href={`https://www.openstreetmap.org/?mlat=${selectedProblem.location.lat}&mlon=${selectedProblem.location.lng}&zoom=15`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <MapIcon className="w-4 h-4" />
                      View on OpenStreetMap
                    </a>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MapInterface;
