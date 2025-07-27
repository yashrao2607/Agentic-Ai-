import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Flag, Users, BarChart3, Map, Trophy, Gift, Moon, Sun, LogIn, UserPlus } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Helper for nav styles
  const navLink = (to: string) => 
    `flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300
    ${
      location.pathname === to
        ? darkMode
            ? 'bg-blue-900 text-blue-300 font-medium'
            : 'bg-blue-100 text-blue-700 font-medium'
        : darkMode
            ? 'text-gray-300 hover:bg-gray-800 hover:text-blue-400'
            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
    }`;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`sticky top-0 z-50 shadow-lg transition-colors duration-300
        ${darkMode 
          ? 'bg-gray-900/90 backdrop-blur-md border-b border-gray-700' 
          : 'glass'
        }`}
    >
      <nav className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group min-w-0">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="gandhi-spectacles"></div>
            </motion.div>
            <div className="truncate">
              <h1 className={`text-lg sm:text-xl font-bold transition-colors duration-300 
                ${darkMode ? 'text-white' : 'gradient-text'}
              `}>Digital Civic</h1>
              <p className={`text-xs font-medium transition-colors duration-300 
                ${darkMode ? 'text-blue-400' : 'text-blue-600'}
              `}>Revolution</p>
            </div>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <Link to="/" className={navLink("/")}>
              <Flag className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link to="/report" className={navLink("/report")}>
              <Users className="w-4 h-4" />
              <span>Report Problem</span>
            </Link>
            <Link to="/tracking" className={navLink("/tracking")}>
              <BarChart3 className="w-4 h-4" />
              <span>Track Progress</span>
            </Link>
            <Link to="/map" className={navLink("/map")}>
              <Map className="w-4 h-4" />
              <span>Map View</span>
            </Link>
            <Link to="/leaderboard" className={navLink("/leaderboard")}>
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </Link>
            <Link to="/rewards" className={navLink("/rewards")}>
              <Gift className="w-4 h-4" />
              <span>Rewards</span>
            </Link>
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all duration-300
                ${darkMode
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {/* Auth Buttons desktop */}
            <Link
              to="/signin"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg
                transition-all duration-300
                ${darkMode
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-blue-400'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }
              `}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/signup"
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              aria-label="Toggle menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg transition-colors duration-300
                ${darkMode 
                  ? 'text-gray-300 hover:bg-gray-800' 
                  : 'text-gray-700 hover:bg-blue-50'
                }`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.22 }}
              className={`md:hidden border-t transition-colors duration-300
                ${darkMode ? 'border-gray-700 bg-gray-900/95' : 'border-blue-100 bg-white/95'}
                absolute top-full left-0 w-full z-30
              `}
            >
              <div className="flex flex-col py-4 px-2 sm:px-4 space-y-1">
                <Link to="/" onClick={()=>setIsMenuOpen(false)} className={navLink('/')+" py-3"}>
                  <Flag className="w-4 h-4" /><span>Home</span>
                </Link>
                <Link to="/report" onClick={()=>setIsMenuOpen(false)} className={navLink('/report')+" py-3"}>
                  <Users className="w-4 h-4" /><span>Report Problem</span>
                </Link>
                <Link to="/tracking" onClick={()=>setIsMenuOpen(false)} className={navLink('/tracking')+" py-3"}>
                  <BarChart3 className="w-4 h-4" /><span>Track Progress</span>
                </Link>
                <Link to="/map" onClick={()=>setIsMenuOpen(false)} className={navLink('/map')+" py-3"}>
                  <Map className="w-4 h-4" /><span>Map View</span>
                </Link>
                <Link to="/leaderboard" onClick={()=>setIsMenuOpen(false)} className={navLink('/leaderboard')+" py-3"}>
                  <Trophy className="w-4 h-4" /><span>Leaderboard</span>
                </Link>
                <Link to="/rewards" onClick={()=>setIsMenuOpen(false)} className={navLink('/rewards')+" py-3"}>
                  <Gift className="w-4 h-4" /><span>Rewards</span>
                </Link>
                {/* Dark Mode Toggle mobile */}
                <button
                  onClick={() => {
                    toggleDarkMode();
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg w-full transition-all duration-300
                  ${darkMode
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                {/* Auth Links mobile */}
                <Link
                  to="/signin"
                  onClick={()=>setIsMenuOpen(false)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300
                  ${darkMode
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-700 hover:bg-blue-50'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  onClick={()=>setIsMenuOpen(false)}
                  className="flex items-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

export default Header;
