import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, Users, Heart } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"></div>
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-20 left-32 w-24 h-24 border-2 border-white rounded-full"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Transform
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-green-300">
                Your Community?
              </span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Join millions of Indians in the largest civic engagement movement. 
              Every report matters, every voice counts in building New India.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid md:grid-cols-3 gap-8 mb-12"
          >
            <div className="flex flex-col items-center">
              <Smartphone className="w-12 h-12 text-orange-300 mb-2" />
              <span className="text-2xl font-bold text-white">20+</span>
              <span className="text-blue-200">App Downloads</span>
            </div>
            <div className="flex flex-col items-center">
              <Users className="w-12 h-12 text-green-300 mb-2" />
              <span className="text-2xl font-bold text-white">5+</span>
              <span className="text-blue-200">Active Citizens</span>
            </div>
            <div className="flex flex-col items-center">
              <Heart className="w-12 h-12 text-red-300 mb-2" />
              <span className="text-2xl font-bold text-white">5K+</span>
              <span className="text-blue-200">Lives Improved</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link
              to="/report"
              className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Start Reporting Today
              <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              to="/tracking"
              className="group inline-flex items-center justify-center px-8 py-4 bg-white bg-opacity-10 text-white rounded-xl font-semibold text-lg backdrop-blur-sm border border-white border-opacity-20 hover:bg-opacity-20 transform hover:scale-105 transition-all duration-300"
            >
              Track Progress
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-12 pt-8 border-t border-blue-500 border-opacity-30"
          >
            <p className="text-blue-200 text-sm mb-4">Trusted by Government of India</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="gandhi-spectacles border-white"></div>
              <span className="text-white font-semibold">Digital India Initiative</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;