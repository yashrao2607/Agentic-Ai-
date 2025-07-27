import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, TrendingUp } from 'lucide-react';

interface HeroSectionProps {
  darkMode: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ darkMode }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-12 items-center min-h-screen py-20">
          {/* Left Side - PM Modi Image */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1 flex justify-center"
          >
            <div className="relative">
              <div className="hero-image animate-float">
                <img
                  src="https://images.pexels.com/photos/8837745/pexels-photo-8837745.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Digital Leadership"
                  className="w-80 h-96 object-cover rounded-2xl shadow-2xl"
                />
              </div>
              {/* Swachh Bharat Badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className={`absolute -top-4 -right-4 p-4 rounded-full shadow-xl transition-colors duration-300 ${
                  darkMode 
                    ? 'bg-gray-800 tricolor-border-dark' 
                    : 'bg-white tricolor-border'
                }`}
              >
                <div className="gandhi-spectacles"></div>
              </motion.div>
            </div>
          </motion.div>

          {/* Center - Value Proposition */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-1 text-center lg:text-left"
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Transform Your
              <span className={`block transition-colors duration-300 ${
                darkMode ? 'gradient-text-dark' : 'gradient-text'
              }`}>City with AI-Powered</span>
              Civic Action
            </motion.h1>
            
            <motion.p
              className={`text-lg md:text-xl mb-8 leading-relaxed transition-colors duration-300 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Join India's digital revolution in civic engagement. Report problems, 
              track solutions, and build the nation together with the power of community action.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <Link
                to="/report"
                className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Report Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="group inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-blue-100">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Right Side - Real-time Metrics */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="lg:col-span-1"
          >
            <div className={`rounded-2xl p-8 shadow-xl transition-colors duration-300 ${
              darkMode ? 'glass-dark' : 'glass'
            }`}>
              <h3 className={`text-xl font-bold mb-6 flex items-center transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <TrendingUp className="mr-2 w-6 h-6 text-blue-600" />
                Live Impact Metrics
              </h3>
              
              <div className="space-y-6">
                <div className={`flex justify-between items-center p-4 rounded-xl transition-colors duration-300 ${
                  darkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-white bg-opacity-50'
                }`}>
                  <span className={`font-medium transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Problems Resolved</span>
                  <motion.span
                    className="text-2xl font-bold text-green-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    12,847
                  </motion.span>
                </div>
                
                <div className={`flex justify-between items-center p-4 rounded-xl transition-colors duration-300 ${
                  darkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-white bg-opacity-50'
                }`}>
                  <span className={`font-medium transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Active Reports</span>
                  <motion.span
                    className="text-2xl font-bold text-orange-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                  >
                    3,456
                  </motion.span>
                </div>
                
                <div className={`flex justify-between items-center p-4 rounded-xl transition-colors duration-300 ${
                  darkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-white bg-opacity-50'
                }`}>
                  <span className={`font-medium transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Cities Participating</span>
                  <motion.span
                    className="text-2xl font-bold text-blue-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6 }}
                  >
                    247
                  </motion.span>
                </div>
                
                <div className={`flex justify-between items-center p-4 rounded-xl transition-colors duration-300 ${
                  darkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-white bg-opacity-50'
                }`}>
                  <span className={`font-medium transition-colors duration-300 ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>Community Score</span>
                  <motion.span
                    className={`text-2xl font-bold transition-colors duration-300 ${
                      darkMode ? 'gradient-text-dark' : 'gradient-text'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8 }}
                  >
                    98.7%
                  </motion.span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;