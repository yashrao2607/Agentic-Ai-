import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import StatsSection from '../components/StatsSection';
import FeaturesSection from '../components/FeaturesSection';
import TestimonialsSection from '../components/TestimonialsSection';
import CTASection from '../components/CTASection';

interface LandingProps {
  darkMode: boolean;
}

const Landing: React.FC<LandingProps> = ({ darkMode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="overflow-x-hidden"
    >
      <HeroSection darkMode={darkMode} />
      <StatsSection darkMode={darkMode} />
      <FeaturesSection darkMode={darkMode} />
      <TestimonialsSection darkMode={darkMode} />
      <CTASection darkMode={darkMode} />
    </motion.div>
  );
};

export default Landing;