import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  ArrowLeft,
  Copy,
  Clock,
  Send,
  Wrench,
  Sparkles,
  Loader,
  ServerCrash,
  Smartphone,
  Brain,
  Building,
  ShieldCheck,
  Zap,
  ThumbsUp,
  Camera,
  MessageSquare
} from 'lucide-react';

// Import Firebase and Firestore services
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyCtbNLRoSjEeO6CmYqpUUAgekswCE8-msI",
  authDomain: "poetic-inkwell-464523-j5.firebaseapp.com",
  projectId: "poetic-inkwell-464523-j5",
  storageBucket: "poetic-inkwell-464523-j5.firebasestorage.app",
  messagingSenderId: "396048445465",
  appId: "1:396048445465:web:573c785cc1945377533a88"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Data Interfaces ---
interface Problem {
  id: string;
  title: string;
  category: string;
  status: 'submitted' | 'processed_ok' | 'pending_assignment' | 'scheduled' | 'resolved' | 'in_progress' | 'completed';
  imageUrl?: string;
  createdAt: Date;
  location?: string;
  expectedResolution: Date;
  aiAgentId?: string;
  photos?: { before: string; during?: string; after?: string };
  impact?: { points: number; rank: number; badge: string };
  community?: { supports: number; photos: number; updates: number };
  source?: 'raw_submissions' | 'issues';
  workOrderId?: string;
}

interface ProblemTrackingProps {
  darkMode: boolean;
}

// --- Helper Components & Functions ---

const CountdownTimer: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft: { [key: string]: number } = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, targetDate]);

    const timerComponents = Object.entries(timeLeft)
        .filter(([, value]) => value >= 0)
        .map(([interval, value]) => (
            <span key={interval}>{value} {interval}{" "}</span>
        ));

    return <>{timerComponents.length ? timerComponents : <span>Overdue</span>}</>;
};

const Confetti: React.FC = () => {
    const colors = ["#FF9933", "#4CAF50", "#1B365D", "#FFFFFF"];
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 100 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-4 rounded-full"
                    style={{
                        backgroundColor: colors[i % colors.length],
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * -50}%`,
                    }}
                    animate={{
                        y: '150vh',
                        x: `${Math.random() * 200 - 100}px`,
                        rotate: Math.random() * 360,
                    }}
                    transition={{
                        duration: Math.random() * 3 + 2,
                        repeat: Infinity,
                        repeatType: "loop",
                        delay: Math.random() * 2,
                    }}
                />
            ))}
        </div>
    );
};

// --- NEW: Report Card Component ---
const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
    submitted: { label: 'Reported', icon: Send, color: 'blue' },
    processed_ok: { label: 'AI Analyzed', icon: Brain, color: 'purple' },
    pending_assignment: { label: 'Authority Assigned', icon: Building, color: 'orange' },
    scheduled: { label: 'In Progress', icon: Wrench, color: 'yellow' },
    resolved: { label: 'Resolved & Verified', icon: ShieldCheck, color: 'green' },
    in_progress: { label: 'In Progress', icon: Wrench, color: 'yellow' },
    completed: { label: 'Completed', icon: ShieldCheck, color: 'green' },
};

// This mapping prevents crashes by ensuring Tailwind CSS sees the full class names.
const colorClasses: Record<string, { bg: string }> = {
    blue: { bg: 'bg-blue-500' },
    purple: { bg: 'bg-purple-500' },
    orange: { bg: 'bg-orange-500' },
    yellow: { bg: 'bg-yellow-500' },
    green: { bg: 'bg-green-500' },
};

const ReportCard: React.FC<{ problem: Problem; darkMode: boolean; onSelect: () => void }> = ({ problem, darkMode, onSelect }) => {
  const steps = ['submitted', 'in_progress', 'pending_assignment', 'scheduled', 'completed'];
  
  // Map status to step index
  let currentStepIndex = 0;
  switch (problem.status) {
    case 'submitted':
      currentStepIndex = 0;
      break;
    case 'in_progress':
      currentStepIndex = 1;
      break;
    case 'pending_assignment':
      currentStepIndex = 2;
      break;
    case 'scheduled':
      currentStepIndex = 3;
      break;
    case 'completed':
    case 'resolved':
      currentStepIndex = 4;
      break;
    default:
      currentStepIndex = 0;
  }
  
  // Defensive fallback to prevent crashes from unexpected status values
  const currentStatus = statusConfig[problem.status as keyof typeof statusConfig] || statusConfig.submitted;
  const bgColorClass = colorClasses[currentStatus.color as keyof typeof colorClasses]?.bg || 'bg-gray-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, zIndex: 10 }}
      transition={{ duration: 0.4 }}
      onClick={onSelect}
      className={`rounded-2xl shadow-lg cursor-pointer overflow-hidden transition-all duration-300 group ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-white ${bgColorClass}`}>
            <currentStatus.icon className="w-3 h-3" />
            <span>{currentStatus.label}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-yellow-500">
            <Zap className="w-4 h-4" />
            <span>+{problem.impact?.points} Impact Points</span>
          </div>
        </div>

        <h3 className={`font-bold text-lg mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{problem.title}</h3>
        <p className={`text-sm font-medium mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{problem.category}</p>

        <div className="mb-4">
          <div className="flex justify-between mb-1">
            {steps.map((stepKey, index) => {
              // Get the correct color for each step
              let stepColor = 'bg-gray-500';
              switch (stepKey) {
                case 'submitted':
                  stepColor = 'bg-blue-500';
                  break;
                case 'in_progress':
                  stepColor = 'bg-yellow-500';
                  break;
                case 'pending_assignment':
                  stepColor = 'bg-purple-500';
                  break;
                case 'scheduled':
                  stepColor = 'bg-orange-500';
                  break;
                case 'completed':
                  stepColor = 'bg-green-500';
                  break;
                default:
                  stepColor = 'bg-gray-500';
              }
              
              return (
                <div key={index} className={`w-1/5 h-2 rounded-full ${index <= currentStepIndex ? stepColor : (darkMode ? 'bg-gray-700' : 'bg-gray-200')}`} />
              );
            })}
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Submitted</span>
            <span>Review</span>
            <span>Assigned</span>
            <span>Working</span>
            <span>Done</span>
          </div>
          <p className="text-xs text-right font-medium text-gray-500 mt-1">Step {currentStepIndex + 1} of {steps.length}</p>
        </div>

        <div className={`flex justify-around items-center text-center border-t border-b py-2 my-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div>
            <p className="font-bold text-lg">{problem.community?.supports}</p>
            <p className="text-xs text-gray-500">Backers</p>
          </div>
          <div>
            <p className="font-bold text-lg">{problem.community?.photos}</p>
            <p className="text-xs text-gray-500">Photos</p>
          </div>
          <div>
            <p className="font-bold text-lg">{problem.community?.updates}</p>
            <p className="text-xs text-gray-500">Updates</p>
          </div>
        </div>
      </div>
      
      <div className={`px-5 py-3 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
        <div className={`flex justify-between items-center text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <span>{problem.createdAt.toLocaleDateString()}</span>
          <span className="font-semibold text-orange-500">Next Step: Authority arriving in 2hr</span>
        </div>
      </div>
    </motion.div>
  );
};


// --- Main Component ---
const ProblemTracking: React.FC<Partial<ProblemTrackingProps>> = ({ darkMode = false }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Listen to both raw_submissions and issues collections
    const unsubscribeRaw = onSnapshot(
      query(collection(db, 'raw_submissions'), orderBy('created_at', 'desc')),
      (rawSnapshot) => {
        const rawProblems: Problem[] = rawSnapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = data.created_at instanceof Timestamp ? data.created_at.toDate() : new Date();
          const expectedResolution = new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000);
          
          return {
            id: doc.id,
            title: data.title || 'Untitled Report',
            category: data.category || 'General',
            status: data.status || 'submitted',
            imageUrl: data.imageUrl,
            createdAt,
            expectedResolution,
            location: data.location || 'Unknown Location',
            aiAgentId: `GEMINI-CIVIC-${doc.id.substring(0, 6).toUpperCase()}`,
            photos: { before: data.imageUrl || 'https://placehold.co/600x400/f87171/ffffff?text=Before' },
            impact: { points: 75, rank: 12, badge: 'Problem Solver' },
            community: { supports: 47, photos: 12, updates: 8 },
            source: 'raw_submissions'
          };
        });

        const unsubscribeIssues = onSnapshot(
          query(collection(db, 'issues'), orderBy('created_at', 'desc')),
          (issuesSnapshot) => {
            const issueProblems: Problem[] = issuesSnapshot.docs.map(doc => {
              const data = doc.data();
              const createdAt = data.created_at instanceof Timestamp ? data.created_at.toDate() : new Date();
              const expectedResolution = new Date(createdAt.getTime() + 5 * 24 * 60 * 60 * 1000);
              
              return {
                id: doc.id,
                title: data.title || 'Untitled Report',
                category: data.category || 'General',
                status: data.status || 'in_progress',
                imageUrl: data.imageUrl,
                createdAt,
                expectedResolution,
                location: data.location || 'Unknown Location',
                aiAgentId: `GEMINI-CIVIC-${doc.id.substring(0, 6).toUpperCase()}`,
                photos: { before: data.imageUrl || 'https://placehold.co/600x400/f87171/ffffff?text=Before' },
                impact: { points: 75, rank: 12, badge: 'Problem Solver' },
                community: { supports: 47, photos: 12, updates: 8 },
                source: 'issues',
                workOrderId: data.work_order_id
              };
            });

            // Combine both collections and sort by creation date
            const allProblems = [...rawProblems, ...issueProblems].sort((a, b) => 
              b.createdAt.getTime() - a.createdAt.getTime()
            );
            
            setProblems(allProblems);
            setLoading(false);
          },
          (err) => {
            console.error("Issues Firestore error:", err);
            setError("Failed to load reports.");
            setLoading(false);
          }
        );

        return () => {
          unsubscribeIssues();
        };
      },
      (err) => {
        console.error("Raw submissions Firestore error:", err);
        setError("Failed to load reports.");
        setLoading(false);
      }
    );

    return () => unsubscribeRaw();
  }, []);

  const renderDetailedView = (problem: Problem) => {
    const steps = [
      { id: 'submitted', label: 'Report Submitted', icon: Smartphone },
      { id: 'in_progress', label: 'Under Review', icon: Brain },
      { id: 'pending_assignment', label: 'Team Assigned', icon: Building },
      { id: 'scheduled', label: 'Work in Progress', icon: Wrench },
      { id: 'completed', label: 'Issue Resolved', icon: ShieldCheck },
    ];
    
    // Map status to step index
    let currentStepIndex = 0;
    switch (problem.status) {
      case 'submitted':
        currentStepIndex = 0;
        break;
      case 'in_progress':
        currentStepIndex = 1;
        break;
      case 'pending_assignment':
        currentStepIndex = 2;
        break;
      case 'scheduled':
        currentStepIndex = 3;
        break;
      case 'completed':
      case 'resolved':
        currentStepIndex = 4;
        break;
      default:
        currentStepIndex = 0;
    }

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <button
          onClick={() => setSelectedProblem(null)}
          className={`flex items-center gap-2 mb-6 font-semibold ${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}
        >
          <ArrowLeft /> Back to Reports
        </button>
        
        <div className={`relative rounded-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
          {(problem.status === 'resolved' || problem.status === 'completed') && <Confetti />}
          <div className="p-8">
            <div className="text-center mb-8">
              <motion.p 
                animate={{ scale: [1, 1.05, 1] }} 
                transition={{ duration: 1.5, repeat: Infinity }}
                className="font-bold text-lg" 
                style={{ color: darkMode ? '#A5B4FC' : '#1B365D' }}
              >
                CIVIC REPORT #{problem.id.substring(0, 8).toUpperCase()}
              </motion.p>
              <p className="font-semibold text-xl" style={{ color: darkMode ? '#FDBA74' : '#FF9933' }}>
                Resolution Expected: <CountdownTimer targetDate={problem.expectedResolution} />
              </p>
            </div>
            
            <div className="text-center mb-10">
                <p className={`font-mono text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{problem.aiAgentId}</p>
                <p className="text-xs text-gray-500">Powered by Google AI</p>
            </div>

            <div>
              <div className="flex justify-between items-center">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex flex-col items-center text-center w-20">
                    <motion.div 
                      className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${index <= currentStepIndex ? 'border-green-500 bg-green-100' : (darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-100')}`}
                      animate={{ scale: index === currentStepIndex ? 1.1 : 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <step.icon className={`w-8 h-8 ${index <= currentStepIndex ? 'text-green-600' : (darkMode ? 'text-gray-500' : 'text-gray-400')}`} />
                    </motion.div>
                    <p className="text-xs mt-2 font-semibold">{step.label}</p>
                  </div>
                ))}
              </div>
              <div className={`w-full rounded-full h-2.5 mt-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <motion.div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%`}}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </div>
            </div>
          </div>
          
          <div className={`p-8 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-lg mb-4">Resolution Timeline</h4>
                <div className="space-y-4">
                  {steps.slice(0, currentStepIndex + 1).map(step => (
                     <p key={step.id} className="text-sm flex items-center gap-2"><CheckCircle className="text-green-500 w-4 h-4" /> {step.label}</p>
                  ))}
                </div>

                <h4 className="font-bold text-lg mt-8 mb-4">Photo Evidence</h4>
                <div className="flex gap-4">
                    <img src={problem.photos?.before} alt="Before" className="w-1/2 rounded-lg shadow-md border-2 border-red-400" />
                    {problem.status === 'resolved' && problem.photos?.after &&
                      <img src={problem.photos.after} alt="After" className="w-1/2 rounded-lg shadow-md border-2 border-green-400" />
                    }
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-4">Community Impact</h4>
                <div className="space-y-3">
                    <p className="flex items-center gap-2"><ThumbsUp className="text-blue-500"/> {problem.community?.supports} Neighbors support this</p>
                    <p className="flex items-center gap-2"><Camera className="text-purple-500"/> {problem.community?.photos} Additional photos submitted</p>
                    <p className="flex items-center gap-2"><MessageSquare className="text-orange-500"/> {problem.community?.updates} Community updates</p>
                </div>

                <h4 className="font-bold text-lg mt-8 mb-4">AI Insights</h4>
                <div className={`text-sm space-y-2 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <p><strong>Similar problems resolved:</strong> 23</p>
                    <p><strong>Average resolution time:</strong> 4.2 days</p>
                    <p><strong>Predicted impact:</strong> 500+ citizens benefited</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };
  
  const renderProblemList = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {problems.map((problem) => (
        <ReportCard 
          key={problem.id}
          problem={problem}
          darkMode={darkMode}
          onSelect={() => setSelectedProblem(problem)}
        />
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen p-4 sm:p-8 transition-colors ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {selectedProblem ? renderDetailedView(selectedProblem) : (
            <motion.div key="list" exit={{ opacity: 0 }}>
              <h1 className="text-4xl font-bold mb-2">My Reports</h1>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-8`}>Track the status of your submitted reports.</p>
              
              {loading && <div className="flex justify-center items-center h-64 gap-4"><Loader className="w-8 h-8 animate-spin text-blue-600" /><span className="text-lg font-semibold">Loading Reports...</span></div>}
              {error && <div className={`flex flex-col justify-center items-center h-64 gap-4 rounded-xl ${darkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}><ServerCrash className="w-12 h-12" /><span className="text-lg font-semibold">{error}</span></div>}
              {!loading && !error && problems.length === 0 && <div className={`flex flex-col justify-center items-center h-64 gap-4 rounded-xl ${darkMode ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-700'}`}><FileText className="w-12 h-12" /><h3 className="text-xl font-bold">No Reports Found</h3><p>You haven't submitted any reports yet.</p></div>}
              {!loading && !error && problems.length > 0 && renderProblemList()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProblemTracking;
