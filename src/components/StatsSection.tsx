import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, CheckCircle, Clock } from 'lucide-react';

const StatCard: React.FC<{
  darkMode: boolean;
  icon: React.ReactNode;
  title: string;
  value: number;
  suffix?: string;
  delay: number;
}> = ({ darkMode, icon, title, value, suffix = '', delay }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const increment = value / 100;
      const counter = setInterval(() => {
        setCount(prev => {
          if (prev >= value) {
            clearInterval(counter);
            return value;
          }
          return Math.min(prev + increment, value);
        });
      }, 20);

      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      className={`card-hover rounded-2xl p-8 text-center transition-colors duration-300 ${
        darkMode ? 'glass-dark' : 'glass'
      }`}
    >
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-colors duration-300 ${
        darkMode ? 'bg-blue-900' : 'bg-blue-100'
      }`}>
        {icon}
      </div>
      <h3 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}>
        {Math.floor(count).toLocaleString()}{suffix}
      </h3>
      <p className={`font-medium transition-colors duration-300 ${
        darkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>{title}</p>
    </motion.div>
  );
};

interface StatsSectionProps {
  darkMode: boolean;
}

const StatsSection: React.FC<StatsSectionProps> = ({ darkMode }) => {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 transition-colors duration-300 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Empowering <span className={darkMode ? 'gradient-text-dark' : 'gradient-text'}>Digital India</span>
          </h2>
          <p className={`text-lg max-w-2xl mx-auto transition-colors duration-300 ${
            darkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Real-time statistics showcasing the collective power of citizen engagement 
            in building a cleaner, better India
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard
            darkMode={darkMode}
            icon={<CheckCircle className="w-8 h-8 text-blue-600" />}
            title="Problems Resolved"
            value={12847}
            delay={200}
          />
          <StatCard
            darkMode={darkMode}
            icon={<Clock className="w-8 h-8 text-orange-600" />}
            title="Active Issues"
            value={3456}
            delay={400}
          />
          <StatCard
            darkMode={darkMode}
            icon={<Users className="w-8 h-8 text-green-600" />}
            title="Active Citizens"
            value={89234}
            delay={600}
          />
          <StatCard
            darkMode={darkMode}
            icon={<MapPin className="w-8 h-8 text-purple-600" />}
            title="Cities Connected"
            value={247}
            delay={800}
          />
        </div>
      </div>
    </section>
  );
};

export default StatsSection;