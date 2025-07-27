// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Landing from './pages/Landing';
import ReportProblem from './pages/ReportProblem';
import ProblemTracking from './pages/ProblemTracking';
import MapInterface from './pages/MapInterface';
import Leaderboard from './pages/Leaderboard';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Rewards from './pages/Rewards';
import ChatbotWidget from './components/ChatbotWidget';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for auth state
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
    setIsAuthenticated(localStorage.getItem('auth') === '1');
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  const handleSignIn = () => {
    localStorage.setItem('auth', '1');
    setIsAuthenticated(true);
  };
  const handleSignOut = () => {
    localStorage.removeItem('auth');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          darkMode
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
            : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'
        }`}
      >
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          isAuthenticated={isAuthenticated}
          onSignOut={handleSignOut}
        />
        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Routes>
            <Route path="/" element={<Landing darkMode={darkMode} />} />
            <Route path="/report" element={<ReportProblem darkMode={darkMode} />} />
            <Route path="/tracking" element={<ProblemTracking darkMode={darkMode} />} />
            <Route path="/map" element={<MapInterface darkMode={darkMode} />} />
            <Route path="/leaderboard" element={<Leaderboard darkMode={darkMode} />} />
            <Route path="/rewards" element={<Rewards darkMode={darkMode} />} />
            <Route
              path="/signin"
              element={
                <SignIn
                  onSignIn={handleSignIn}
                  isAuthenticated={isAuthenticated}
                />
              }
            />
            <Route
              path="/signup"
              element={
                <SignUp
                  onSignIn={handleSignIn}
                  isAuthenticated={isAuthenticated}
                />
              }
            />
          </Routes>
        </motion.main>

        {/* Global Chatbot Widget */}
        <ChatbotWidget darkMode={darkMode} />
      </div>
    </Router>
  );
}

export default App;
