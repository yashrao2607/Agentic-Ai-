import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Star, 
  Camera, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Award, 
  Crown,
  Target,
  Zap,
  Heart,
  Share2,
  Calendar,
  MapPin,
  Eye
} from 'lucide-react';

interface Contributor {
  id: string;
  name: string;
  avatar: string;
  location: string;
  stats: {
    totalReports: number;
    resolvedIssues: number;
    communityPoints: number;
    photoQuality: number;
    verificationRate: number;
    streakDays: number;
  };
  badges: string[];
  rank: number;
  weeklyRank?: number;
  monthlyRank?: number;
  achievements: Array<{
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    points: number;
  }>;
}

const mockContributors: Contributor[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    location: 'Delhi',
    stats: {
      totalReports: 127,
      resolvedIssues: 98,
      communityPoints: 2547,
      photoQuality: 4.8,
      verificationRate: 92,
      streakDays: 45
    },
    badges: ['Community Champion', 'Photo Expert', 'Streak Master', 'Problem Solver'],
    rank: 1,
    weeklyRank: 1,
    monthlyRank: 1,
    achievements: [
      {
        title: 'Century Club',
        description: 'Submitted 100+ problem reports',
        icon: 'trophy',
        unlockedAt: '2024-01-10'
      },
      {
        title: 'Photo Master',
        description: 'Maintained 4.5+ photo quality rating',
        icon: 'camera',
        unlockedAt: '2024-01-05'
      }
    ],
    recentActivity: [
      {
        type: 'report',
        description: 'Reported street lighting issue',
        timestamp: '2024-01-16T10:30:00Z',
        points: 25
      },
      {
        type: 'verification',
        description: 'Verified garbage collection completion',
        timestamp: '2024-01-15T14:20:00Z',
        points: 15
      }
    ]
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    location: 'Mumbai',
    stats: {
      totalReports: 89,
      resolvedIssues: 76,
      communityPoints: 2134,
      photoQuality: 4.6,
      verificationRate: 88,
      streakDays: 32
    },
    badges: ['Fast Responder', 'Community Helper', 'Verification Expert'],
    rank: 2,
    weeklyRank: 3,
    monthlyRank: 2,
    achievements: [
      {
        title: 'Speed Demon',
        description: 'Fastest response time in community',
        icon: 'zap',
        unlockedAt: '2024-01-08'
      }
    ],
    recentActivity: [
      {
        type: 'support',
        description: 'Supported 5 community issues',
        timestamp: '2024-01-16T09:15:00Z',
        points: 10
      }
    ]
  },
  {
    id: '3',
    name: 'Dr. Anita Patel',
    avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=150',
    location: 'Ahmedabad',
    stats: {
      totalReports: 76,
      resolvedIssues: 68,
      communityPoints: 1987,
      photoQuality: 4.9,
      verificationRate: 95,
      streakDays: 28
    },
    badges: ['Quality Expert', 'Healthcare Hero', 'Verification Master'],
    rank: 3,
    weeklyRank: 2,
    monthlyRank: 4,
    achievements: [
      {
        title: 'Quality Guardian',
        description: 'Highest photo quality rating',
        icon: 'star',
        unlockedAt: '2024-01-12'
      }
    ],
    recentActivity: [
      {
        type: 'quality',
        description: 'Received 5-star photo rating',
        timestamp: '2024-01-15T16:45:00Z',
        points: 20
      }
    ]
  }
];

const Leaderboard: React.FC = () => {
  const [contributors, setContributors] = useState<Contributor[]>(mockContributors);
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'alltime'>('alltime');
  const [selectedCategory, setSelectedCategory] = useState<'overall' | 'reports' | 'photos' | 'verification'>('overall');
  const [selectedContributor, setSelectedContributor] = useState<Contributor | null>(null);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-500" />;
      default: return <Trophy className="w-6 h-6 text-blue-500" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getBadgeColor = (badge: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-red-100 text-red-800'
    ];
    return colors[badge.length % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Civic <span className="gradient-text">Champions</span>
          </h1>
          <p className="text-lg text-gray-600">
            Celebrating the heroes who are transforming their communities
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as any)}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="weekly">This Week</option>
                  <option value="monthly">This Month</option>
                  <option value="alltime">All Time</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="overall">Overall</option>
                  <option value="reports">Most Reports</option>
                  <option value="photos">Best Photos</option>
                  <option value="verification">Fastest Verification</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>2,547 Active Contributors</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>+23% This Month</span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Top 3 Podium */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                🏆 Top Champions
              </h2>
              
              <div className="flex items-end justify-center space-x-8">
                {/* 2nd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-center"
                >
                  <div className="relative mb-4">
                    <img
                      src={contributors[1].avatar}
                      alt={contributors[1].name}
                      className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-gray-300 shadow-lg"
                    />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">2</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900">{contributors[1].name}</h3>
                  <p className="text-sm text-gray-600">{contributors[1].location}</p>
                  <p className="text-lg font-bold text-gray-500 mt-2">{contributors[1].stats.communityPoints} pts</p>
                  <div className="w-24 h-16 bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-lg mx-auto mt-4"></div>
                </motion.div>

                {/* 1st Place */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-center"
                >
                  <div className="relative mb-4">
                    <img
                      src={contributors[0].avatar}
                      alt={contributors[0].name}
                      className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-yellow-400 shadow-xl"
                    />
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <Crown className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">{contributors[0].name}</h3>
                  <p className="text-sm text-gray-600">{contributors[0].location}</p>
                  <p className="text-xl font-bold text-yellow-600 mt-2">{contributors[0].stats.communityPoints} pts</p>
                  <div className="w-28 h-20 bg-gradient-to-t from-yellow-400 to-yellow-600 rounded-t-lg mx-auto mt-4"></div>
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-center"
                >
                  <div className="relative mb-4">
                    <img
                      src={contributors[2].avatar}
                      alt={contributors[2].name}
                      className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-orange-400 shadow-lg"
                    />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">3</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900">{contributors[2].name}</h3>
                  <p className="text-sm text-gray-600">{contributors[2].location}</p>
                  <p className="text-lg font-bold text-orange-600 mt-2">{contributors[2].stats.communityPoints} pts</p>
                  <div className="w-24 h-12 bg-gradient-to-t from-orange-400 to-orange-600 rounded-t-lg mx-auto mt-4"></div>
                </motion.div>
              </div>
            </div>

            {/* Full Leaderboard */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Complete Rankings</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {contributors.map((contributor, index) => (
                  <motion.div
                    key={contributor.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onClick={() => setSelectedContributor(contributor)}
                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${getRankColor(contributor.rank)} flex items-center justify-center`}>
                          <span className="text-white font-bold text-sm">{contributor.rank}</span>
                        </div>
                        <img
                          src={contributor.avatar}
                          alt={contributor.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{contributor.name}</h4>
                          {contributor.rank <= 3 && getRankIcon(contributor.rank)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{contributor.location}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>{contributor.stats.resolvedIssues} resolved</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Target className="w-3 h-3" />
                            <span>{contributor.stats.streakDays} day streak</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{contributor.stats.communityPoints}</div>
                        <div className="text-sm text-gray-500">points</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      {contributor.badges.slice(0, 3).map((badge, badgeIndex) => (
                        <span
                          key={badgeIndex}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(badge)}`}
                        >
                          {badge}
                        </span>
                      ))}
                      {contributor.badges.length > 3 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          +{contributor.badges.length - 3} more
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Challenges */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-600" />
                Active Challenges
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-2">Clean Streets Challenge</h4>
                  <p className="text-sm text-gray-600 mb-3">Report 10 waste management issues this week</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-green-600 font-medium">847 participants</div>
                    <div className="text-sm text-gray-500">3 days left</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-2">Photo Quality Master</h4>
                  <p className="text-sm text-gray-600 mb-3">Maintain 4.5+ star rating for 30 days</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-purple-600 font-medium">234 participants</div>
                    <div className="text-sm text-gray-500">12 days left</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-600" />
                Recent Achievements
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <Trophy className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="font-medium text-gray-900">Priya Sharma</p>
                    <p className="text-sm text-gray-600">Unlocked "Century Club"</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Camera className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Dr. Anita Patel</p>
                    <p className="text-sm text-gray-600">Earned "Quality Guardian"</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <Zap className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Rajesh Kumar</p>
                    <p className="text-sm text-gray-600">Achieved "Speed Demon"</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Community Stats */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Community Impact
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Contributors</span>
                  <span className="text-2xl font-bold text-blue-600">2,547</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Problems Resolved</span>
                  <span className="text-2xl font-bold text-green-600">12,847</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Photos Submitted</span>
                  <span className="text-2xl font-bold text-purple-600">34,521</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Community Score</span>
                  <span className="text-2xl font-bold gradient-text">98.7%</span>
                </div>
              </div>
            </motion.div>

            {/* Share Achievement */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white"
            >
              <h3 className="text-xl font-bold mb-2">Share Your Success!</h3>
              <p className="text-blue-100 mb-4">
                Inspire others by sharing your civic contributions on social media
              </p>
              <button className="w-full flex items-center justify-center px-4 py-3 bg-white bg-opacity-20 rounded-xl font-semibold hover:bg-opacity-30 transition-colors">
                <Share2 className="w-4 h-4 mr-2" />
                Share Achievement
              </button>
            </motion.div>
          </div>
        </div>

        {/* Contributor Detail Modal */}
        {selectedContributor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedContributor(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={selectedContributor.avatar}
                  alt={selectedContributor.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedContributor.name}</h2>
                  <p className="text-gray-600">{selectedContributor.location}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {getRankIcon(selectedContributor.rank)}
                    <span className="font-semibold text-gray-900">Rank #{selectedContributor.rank}</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">Statistics</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Reports</span>
                      <span className="font-semibold">{selectedContributor.stats.totalReports}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Resolved Issues</span>
                      <span className="font-semibold">{selectedContributor.stats.resolvedIssues}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Community Points</span>
                      <span className="font-semibold">{selectedContributor.stats.communityPoints}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Photo Quality</span>
                      <span className="font-semibold">{selectedContributor.stats.photoQuality}/5.0</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">Badges</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedContributor.badges.map((badge, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(badge)}`}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedContributor(null)}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;