import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Delhi",
    role: "Teacher & Community Leader",
    image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
    content: "This platform transformed how our community addresses local issues. The street lighting problem in our area was resolved within 48 hours of reporting!",
    rating: 5,
    impact: "Street lighting issue resolved in 48 hours"
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    location: "Mumbai",
    role: "Software Engineer & Civic Volunteer",
    image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150",
    content: "The voice reporting feature made it so easy to report issues while commuting. I've helped resolve 15 problems in my locality so far.",
    rating: 5,
    impact: "Resolved 15 community problems"
  },
  {
    id: 3,
    name: "Dr. Anita Patel",
    location: "Ahmedabad",
    role: "Doctor & Social Activist",
    image: "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=150",
    content: "As a healthcare professional, I appreciate how this platform helps maintain public hygiene standards. The waste management issues are now tracked and resolved systematically.",
    rating: 5,
    impact: "Improved waste management in 3 areas"
  }
];

const TestimonialsSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const timer = setInterval(nextTestimonial, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Stories of <span className="gradient-text">Positive Change</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real citizens sharing their experiences of making a difference in their communities
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.5 }}
              className="glass rounded-3xl p-8 md:p-12"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <img
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover shadow-xl"
                  />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <Quote className="w-12 h-12 text-blue-300 mb-4 mx-auto md:mx-0" />
                  
                  <blockquote className="text-xl md:text-2xl text-gray-800 font-medium leading-relaxed mb-6">
                    "{testimonials[currentIndex].content}"
                  </blockquote>
                  
                  <div className="flex items-center justify-center md:justify-start space-x-1 mb-4">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-gray-900">
                      {testimonials[currentIndex].name}
                    </h4>
                    <p className="text-gray-600">
                      {testimonials[currentIndex].role} • {testimonials[currentIndex].location}
                    </p>
                  </div>
                  
                  <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {testimonials[currentIndex].impact}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex ? 'bg-blue-600 w-8' : 'bg-blue-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;