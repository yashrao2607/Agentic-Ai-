import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Target, Trophy, TrendingUp, Users } from 'lucide-react';

const GamificationPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* User Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Award className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Your Impact</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Reports Submitted</span>
            <span className="text-2xl font-bold text-blue-600">23</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Issues Resolved</span>
            <span className="text-2xl font-bold text-green-600">18</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Community Points</span>
            <span className="text-2xl font-bold text-yellow-600">1,247</span>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Next Badge</span>
              <span className="text-sm font-medium text-blue-600">Community Champion</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '73%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">7 more reports needed</p>
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Trophy className="w-6 h-6 text-yellow-600" />
          <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-xl">
            <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">First Reporter</p>
            <p className="text-xs text-gray-600">Unlocked</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">Problem Solver</p>
            <p className="text-xs text-gray-600">Unlocked</p>
          </div>
        </div>
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">Community Leaderboard</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-yellow-700">1</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Priya Sharma</p>
              <p className="text-sm text-gray-600">2,547 points</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700">2</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Rajesh Kumar</p>
              <p className="text-sm text-gray-600">2,134 points</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-blue-50 p-2 rounded-lg">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-blue-700">7</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-900">You</p>
              <p className="text-sm text-blue-600">1,247 points</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-6 h-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-gray-900">Quick Tips</h3>
        </div>
        
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Add photos for faster resolution</li>
          <li>• Use precise location data</li>
          <li>• Check back for updates</li>
          <li>• Share reports with neighbors</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default GamificationPanel;