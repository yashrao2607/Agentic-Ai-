import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Star, Trophy, ShoppingBag, Coffee, Utensils, Shirt, Smartphone, Car, Home, Gamepad2, Music, Book, Heart, Zap, Award, Crown, Target } from 'lucide-react';

interface RewardsProps {
  darkMode: boolean;
}

interface Coupon {
  id: string;
  brand: string;
  title: string;
  description: string;
  pointsRequired: number;
  discount: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  category: string;
  validTill: string;
  terms: string[];
}

interface UserStats {
  totalPoints: number;
  claimablePoints: number;
  redeemedCoupons: number;
  rank: string;
}

const Rewards: React.FC<RewardsProps> = ({ darkMode }) => {
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 1250,
    claimablePoints: 75,
    redeemedCoupons: 8,
    rank: 'Gold'
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const categories = [
    { id: 'all', name: 'All Coupons', icon: <Gift className="w-5 h-5" /> },
    { id: 'food', name: 'Food & Dining', icon: <Utensils className="w-5 h-5" /> },
    { id: 'shopping', name: 'Shopping', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'entertainment', name: 'Entertainment', icon: <Music className="w-5 h-5" /> },
    { id: 'transport', name: 'Transport', icon: <Car className="w-5 h-5" /> },
    { id: 'lifestyle', name: 'Lifestyle', icon: <Heart className="w-5 h-5" /> }
  ];

  const coupons: Coupon[] = [
    // Food & Dining
    {
      id: '1',
      brand: 'Swiggy',
      title: '₹100 OFF on Orders',
      description: 'Get ₹100 off on orders above ₹299',
      pointsRequired: 500,
      discount: '₹100 OFF',
      icon: <Utensils className="w-8 h-8" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      category: 'food',
      validTill: '31st Dec 2024',
      terms: ['Valid on orders above ₹299', 'Cannot be combined with other offers', 'Valid for 30 days from redemption']
    },
    {
      id: '2',
      brand: 'Zomato',
      title: '₹150 OFF + Free Delivery',
      description: 'Flat ₹150 off with free delivery on your next order',
      pointsRequired: 500,
      discount: '₹150 OFF',
      icon: <Utensils className="w-8 h-8" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      category: 'food',
      validTill: '31st Dec 2024',
      terms: ['Valid on orders above ₹399', 'Free delivery included', 'Valid for 30 days from redemption']
    },
    {
      id: '3',
      brand: 'Dominos',
      title: 'Buy 1 Get 1 Pizza',
      description: 'Buy any large pizza and get another free',
      pointsRequired: 500,
      discount: 'BOGO',
      icon: <Utensils className="w-8 h-8" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      category: 'food',
      validTill: '31st Dec 2024',
      terms: ['Valid on large pizzas only', 'Lower priced pizza will be free', 'Valid for 15 days from redemption']
    },
    {
      id: '4',
      brand: 'Starbucks',
      title: '₹200 Gift Voucher',
      description: 'Enjoy your favorite coffee with ₹200 voucher',
      pointsRequired: 500,
      discount: '₹200 Voucher',
      icon: <Coffee className="w-8 h-8" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      category: 'food',
      validTill: '31st Dec 2024',
      terms: ['Valid at all Starbucks outlets', 'Cannot be used for delivery', 'Valid for 60 days from redemption']
    },

    // Shopping
    {
      id: '5',
      brand: 'Myntra',
      title: '₹300 OFF on Fashion',
      description: 'Flat ₹300 off on fashion and lifestyle products',
      pointsRequired: 500,
      discount: '₹300 OFF',
      icon: <Shirt className="w-8 h-8" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      category: 'shopping',
      validTill: '31st Dec 2024',
      terms: ['Valid on orders above ₹999', 'Valid on fashion and lifestyle', 'Valid for 45 days from redemption']
    },
    {
      id: '6',
      brand: 'Amazon',
      title: '₹250 Gift Card',
      description: 'Shop anything on Amazon with ₹250 gift card',
      pointsRequired: 500,
      discount: '₹250 Gift Card',
      icon: <ShoppingBag className="w-8 h-8" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      category: 'shopping',
      validTill: '31st Dec 2024',
      terms: ['Valid on all products', 'No minimum order value', 'Valid for 12 months from redemption']
    },
    {
      id: '7',
      brand: 'Flipkart',
      title: '₹200 SuperCoin Cashback',
      description: 'Get ₹200 SuperCoins for your next purchase',
      pointsRequired: 500,
      discount: '₹200 Cashback',
      icon: <ShoppingBag className="w-8 h-8" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      category: 'shopping',
      validTill: '31st Dec 2024',
      terms: ['Credited as SuperCoins', 'Valid on orders above ₹499', 'Valid for 90 days from redemption']
    },
    {
      id: '8',
      brand: 'Nykaa',
      title: '25% OFF on Beauty',
      description: 'Get 25% off on all beauty and wellness products',
      pointsRequired: 500,
      discount: '25% OFF',
      icon: <Heart className="w-8 h-8" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      category: 'shopping',
      validTill: '31st Dec 2024',
      terms: ['Valid on beauty products only', 'Maximum discount ₹500', 'Valid for 30 days from redemption']
    },

    // Entertainment
    {
      id: '9',
      brand: 'BookMyShow',
      title: '₹150 OFF on Movies',
      description: 'Flat ₹150 off on movie tickets',
      pointsRequired: 500,
      discount: '₹150 OFF',
      icon: <Music className="w-8 h-8" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      category: 'entertainment',
      validTill: '31st Dec 2024',
      terms: ['Valid on movie tickets only', 'Valid on orders above ₹300', 'Valid for 30 days from redemption']
    },
    {
      id: '10',
      brand: 'Netflix',
      title: '1 Month Free Premium',
      description: 'Enjoy 1 month of Netflix Premium for free',
      pointsRequired: 500,
      discount: '1 Month Free',
      icon: <Music className="w-8 h-8" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      category: 'entertainment',
      validTill: '31st Dec 2024',
      terms: ['Valid for new subscribers only', 'Auto-renewal can be cancelled', 'Valid for 60 days from redemption']
    },
    {
      id: '11',
      brand: 'Spotify',
      title: '3 Months Premium Free',
      description: 'Get 3 months of Spotify Premium absolutely free',
      pointsRequired: 500,
      discount: '3 Months Free',
      icon: <Music className="w-8 h-8" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      category: 'entertainment',
      validTill: '31st Dec 2024',
      terms: ['Valid for new users only', 'No ads, offline listening', 'Valid for 30 days from redemption']
    },
    {
      id: '12',
      brand: 'PlayStation',
      title: '₹500 Wallet Credit',
      description: 'Add ₹500 to your PlayStation wallet',
      pointsRequired: 500,
      discount: '₹500 Credit',
      icon: <Gamepad2 className="w-8 h-8" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      category: 'entertainment',
      validTill: '31st Dec 2024',
      terms: ['Valid for PlayStation Store', 'Can be used for games/DLC', 'Valid for 12 months from redemption']
    },

    // Transport
    {
      id: '13',
      brand: 'Uber',
      title: '₹200 OFF on Rides',
      description: 'Get ₹200 off on your next 5 rides',
      pointsRequired: 500,
      discount: '₹200 OFF',
      icon: <Car className="w-8 h-8" />,
      color: 'text-black',
      bgColor: 'bg-gray-100',
      category: 'transport',
      validTill: '31st Dec 2024',
      terms: ['Valid on next 5 rides', '₹40 off per ride', 'Valid for 30 days from redemption']
    },
    {
      id: '14',
      brand: 'Ola',
      title: '₹150 Ride Credit',
      description: 'Flat ₹150 credit for your Ola rides',
      pointsRequired: 500,
      discount: '₹150 Credit',
      icon: <Car className="w-8 h-8" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      category: 'transport',
      validTill: '31st Dec 2024',
      terms: ['Valid on all ride types', 'Can be split across rides', 'Valid for 45 days from redemption']
    },
    {
      id: '15',
      brand: 'Rapido',
      title: '10 Free Rides',
      description: 'Get 10 free bike rides up to ₹50 each',
      pointsRequired: 500,
      discount: '10 Free Rides',
      icon: <Car className="w-8 h-8" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      category: 'transport',
      validTill: '31st Dec 2024',
      terms: ['Valid on bike rides only', 'Up to ₹50 per ride', 'Valid for 30 days from redemption']
    },

    // Lifestyle
    {
      id: '16',
      brand: 'Urban Company',
      title: '₹300 OFF on Services',
      description: 'Get ₹300 off on home services',
      pointsRequired: 500,
      discount: '₹300 OFF',
      icon: <Home className="w-8 h-8" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      category: 'lifestyle',
      validTill: '31st Dec 2024',
      terms: ['Valid on orders above ₹999', 'Valid on all services', 'Valid for 60 days from redemption']
    },
    {
      id: '17',
      brand: 'Cult.fit',
      title: '1 Month Membership',
      description: 'Get 1 month free gym and fitness membership',
      pointsRequired: 500,
      discount: '1 Month Free',
      icon: <Zap className="w-8 h-8" />,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      category: 'lifestyle',
      validTill: '31st Dec 2024',
      terms: ['Valid at all Cult centers', 'Includes group classes', 'Valid for 30 days from redemption']
    },
    {
      id: '18',
      brand: 'PharmEasy',
      title: '₹200 OFF on Medicines',
      description: 'Flat ₹200 off on medicine orders',
      pointsRequired: 500,
      discount: '₹200 OFF',
      icon: <Heart className="w-8 h-8" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      category: 'lifestyle',
      validTill: '31st Dec 2024',
      terms: ['Valid on orders above ₹499', 'Valid on medicines only', 'Valid for 45 days from redemption']
    }
  ];

  const filteredCoupons = selectedCategory === 'all' 
    ? coupons 
    : coupons.filter(coupon => coupon.category === selectedCategory);

  const claimPoints = () => {
    setUserStats(prev => ({
      ...prev,
      totalPoints: prev.totalPoints + prev.claimablePoints,
      claimablePoints: 0
    }));
    setShowClaimModal(false);
  };

  const redeemCoupon = (coupon: Coupon) => {
    if (userStats.totalPoints >= coupon.pointsRequired) {
      setUserStats(prev => ({
        ...prev,
        totalPoints: prev.totalPoints - coupon.pointsRequired,
        redeemedCoupons: prev.redeemedCoupons + 1
      }));
      setShowRedeemModal(false);
      setSelectedCoupon(null);
      // Here you would typically send the coupon to the user's email or show a success message
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header Section */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center mb-4"
            >
              <Trophy className="w-12 h-12 text-yellow-500 mr-4" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Rewards Center
              </h1>
            </motion.div>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Earn Impact Points for your civic contributions and redeem exciting rewards!
            </p>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded-xl p-6 text-center`}
            >
              <Star className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-blue-600">{userStats.totalPoints}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Points</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className={`${darkMode ? 'bg-gray-700' : 'bg-green-50'} rounded-xl p-6 text-center`}
            >
              <Gift className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-green-600">{userStats.claimablePoints}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Claimable Points</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`${darkMode ? 'bg-gray-700' : 'bg-purple-50'} rounded-xl p-6 text-center`}
            >
              <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-purple-600">{userStats.redeemedCoupons}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Redeemed Coupons</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className={`${darkMode ? 'bg-gray-700' : 'bg-yellow-50'} rounded-xl p-6 text-center`}
            >
              <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-yellow-600">{userStats.rank}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current Rank</p>
            </motion.div>
          </div>

          {/* Claim Points Button */}
          {userStats.claimablePoints > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <button
                onClick={() => setShowClaimModal(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <Target className="w-6 h-6 inline mr-2" />
                Claim +{userStats.claimablePoints} Impact Points
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                }`}
              >
                {category.icon}
                <span className="ml-2">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Coupons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon, index) => (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group hover:transform hover:scale-105`}
            >
              {/* Coupon Header */}
              <div className={`${coupon.bgColor} p-4`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`${coupon.color} flex items-center`}>
                    {coupon.icon}
                    <span className="ml-2 font-bold text-lg">{coupon.brand}</span>
                  </div>
                  <div className="bg-white rounded-full px-3 py-1">
                    <span className="text-sm font-bold text-gray-800">{coupon.discount}</span>
                  </div>
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-1">{coupon.title}</h3>
                <p className="text-gray-700 text-sm">{coupon.description}</p>
              </div>

              {/* Coupon Body */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-500 mr-1" />
                    <span className="font-bold text-lg">{coupon.pointsRequired} Points</span>
                  </div>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Valid till {coupon.validTill}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedCoupon(coupon);
                    setShowRedeemModal(true);
                  }}
                  disabled={userStats.totalPoints < coupon.pointsRequired}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                    userStats.totalPoints >= coupon.pointsRequired
                      ? 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {userStats.totalPoints >= coupon.pointsRequired ? 'Redeem Now' : 'Insufficient Points'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Claim Points Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md w-full`}
          >
            <div className="text-center">
              <Gift className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Claim Your Rewards!</h3>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                You've earned <span className="font-bold text-green-600">+{userStats.claimablePoints} Impact Points</span> for your civic contributions!
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowClaimModal(false)}
                  className={`flex-1 py-3 rounded-lg font-semibold ${
                    darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  } hover:opacity-80 transition-opacity`}
                >
                  Later
                </button>
                <button
                  onClick={claimPoints}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Claim Now
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Redeem Coupon Modal */}
      {showRedeemModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto`}
          >
            <div className="text-center mb-6">
              <div className={`${selectedCoupon.bgColor} rounded-full p-4 inline-block mb-4`}>
                {selectedCoupon.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2">{selectedCoupon.brand}</h3>
              <p className="text-xl font-semibold mb-2">{selectedCoupon.title}</p>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                {selectedCoupon.description}
              </p>
              <div className="flex items-center justify-center mb-4">
                <Star className="w-5 h-5 text-yellow-500 mr-1" />
                <span className="font-bold text-lg">{selectedCoupon.pointsRequired} Points</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-2">Terms & Conditions:</h4>
              <ul className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                {selectedCoupon.terms.map((term, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowRedeemModal(false);
                  setSelectedCoupon(null);
                }}
                className={`flex-1 py-3 rounded-lg font-semibold ${
                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                } hover:opacity-80 transition-opacity`}
              >
                Cancel
              </button>
              <button
                onClick={() => redeemCoupon(selectedCoupon)}
                disabled={userStats.totalPoints < selectedCoupon.pointsRequired}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  userStats.totalPoints >= selectedCoupon.pointsRequired
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Redeem for {selectedCoupon.pointsRequired} Points
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Rewards; 