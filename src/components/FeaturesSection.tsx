import React from 'react';
import { motion } from 'framer-motion';
import { 
  Smartphone, 
  Camera, 
  MapPin, 
  MessageSquare, 
  Award, 
  Zap,
  Shield,
  BarChart3
} from 'lucide-react';

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}> = ({ icon, title, description, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      className="card-hover bg-white rounded-2xl p-8 shadow-lg"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </motion.div>
  );
};

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Smartphone className="w-7 h-7 text-blue-600" />,
      title: "Voice-to-Text Reporting",
      description: "Report issues using voice commands in multiple Indian languages for maximum accessibility and convenience."
    },
    {
      icon: <Camera className="w-7 h-7 text-green-600" />,
      title: "Smart Photo Capture",
      description: "AI-powered image analysis with automatic geo-tagging and problem categorization for faster resolution."
    },
    {
      icon: <MapPin className="w-7 h-7 text-red-600" />,
      title: "Precise Location Tracking",
      description: "Advanced GPS integration ensures authorities can locate and address issues with pinpoint accuracy."
    },
    {
      icon: <MessageSquare className="w-7 h-7 text-purple-600" />,
      title: "Real-time Updates",
      description: "Stay informed with instant notifications about your reports and community issues in your area."
    },
    {
      icon: <Award className="w-7 h-7 text-yellow-600" />,
      title: "Gamification System",
      description: "Earn points, badges, and recognition for your contributions to community development."
    },
    {
      icon: <Zap className="w-7 h-7 text-orange-600" />,
      title: "Quick Response",
      description: "AI-powered priority system ensures urgent issues receive immediate attention from authorities."
    },
    {
      icon: <Shield className="w-7 h-7 text-indigo-600" />,
      title: "Secure & Anonymous",
      description: "Report sensitive issues anonymously while maintaining data security and user privacy."
    },
    {
      icon: <BarChart3 className="w-7 h-7 text-teal-600" />,
      title: "Impact Analytics",
      description: "Track your community's progress with detailed analytics and transparent resolution metrics."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for <span className="gradient-text">Civic Change</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Advanced technology meets grassroots activism to create meaningful change in your community
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              {...feature}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;