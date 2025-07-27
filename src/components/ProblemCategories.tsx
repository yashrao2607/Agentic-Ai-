import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trash2, 
  Lightbulb, 
  Car, 
  Droplets, 
  TreePine, 
  Building, 
  Users, 
  AlertTriangle 
} from 'lucide-react';

interface ProblemCategoriesProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories = [
  {
    id: 'waste-management',
    name: 'Waste Management',
    icon: <Trash2 className="w-6 h-6" />,
    color: 'green'
  },
  {
    id: 'street-lighting',
    name: 'Street Lighting',
    icon: <Lightbulb className="w-6 h-6" />,
    color: 'yellow'
  },
  {
    id: 'traffic',
    name: 'Traffic Issues',
    icon: <Car className="w-6 h-6" />,
    color: 'red'
  },
  {
    id: 'water-supply',
    name: 'Water Supply',
    icon: <Droplets className="w-6 h-6" />,
    color: 'blue'
  },
  {
    id: 'environment',
    name: 'Environment',
    icon: <TreePine className="w-6 h-6" />,
    color: 'green'
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    icon: <Building className="w-6 h-6" />,
    color: 'gray'
  },
  {
    id: 'public-safety',
    name: 'Public Safety',
    icon: <Users className="w-6 h-6" />,
    color: 'purple'
  },
  {
    id: 'emergency',
    name: 'Emergency',
    icon: <AlertTriangle className="w-6 h-6" />,
    color: 'red'
  }
];

const ProblemCategories: React.FC<ProblemCategoriesProps> = ({
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div>
      <label className="block text-lg font-semibold text-gray-900 mb-4">
        Problem Category
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            type="button"
            onClick={() => onCategoryChange(category.id)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              selectedCategory === category.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className={`p-2 rounded-lg ${
                selectedCategory === category.id
                  ? 'bg-blue-100'
                  : 'bg-gray-100'
              }`}>
                {category.icon}
              </div>
              <span className="text-sm font-medium text-center">
                {category.name}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ProblemCategories;