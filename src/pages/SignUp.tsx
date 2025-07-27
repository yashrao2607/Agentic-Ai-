// src/pages/SignUp.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Loader,
  Info, CheckCircle, AlertCircle,
} from 'lucide-react';

interface SignUpProps {
  onSignIn: () => void;
  isAuthenticated: boolean;
}

// ...rest of your imports

const SignUp: React.FC<SignUpProps> = ({ onSignIn, isAuthenticated }) => {
  // All your state hooks as before...

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    isGovernmentWorker: false,
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();

  // Redirect if already signed in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // ...Validation, input change, etc. functions unchanged...

  const validateField = (field: string, value: string | boolean) => {
    const newErrors = { ...errors };
    switch (field) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value as string)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'phone':
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(value as string)) {
          newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'password':
        const password = value as string;
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

        setPasswordStrength(strength);

        if (strength < 3) {
          newErrors.password = 'Password should be stronger (8+ chars, uppercase, lowercase, number)';
        } else {
          delete newErrors.password;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (typeof value === 'string') {
      validateField(field, value);
    }
  };

  // ...Password strength helpers unchanged...

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      setTimeout(() => {
        setIsGoogleLoading(false);
        onSignIn();
        navigate('/', { replace: true });
      }, 2000);
    } catch (error) {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    Object.keys(formData).forEach((key) => {
      if (key !== 'isGovernmentWorker' && key !== 'agreeToTerms') {
        validateField(key, formData[key as keyof typeof formData]);
      }
    });

    if (!formData.agreeToTerms) {
      setErrors(prev => ({ ...prev, terms: 'You must agree to the terms and privacy policy' }));
      return;
    }

    // Check for errors just in case
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onSignIn();
      navigate('/', { replace: true });
    }, 2000);
  };

  // ...JSX same as before...
  // Just add the props in the new function signature and pass errors/handlers etc


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="min-h-screen flex">
        {/* Left Side - Registration Form */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full lg:w-1/2 flex items-center justify-center p-8"
        >
          <div className="w-full max-w-md">
            {/* Mobile Image */}
            <div className="lg:hidden mb-8 text-center">
              <img
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Civic Spirit"
                className="w-64 h-48 object-cover rounded-xl shadow-lg mx-auto mb-4"
              />
            </div>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="text-center mb-8">
                <div className="gandhi-spectacles mb-4"></div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Create Your Civic Account
                </h1>
                <p className="text-gray-600">Join the movement for a better India</p>
              </div>

              {/* Google Login Button */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGoogleLoading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="you@example.com"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    />
                    {!errors.email && formData.email && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="10-digit mobile number"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    />
                    {!errors.phone && formData.phone && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Create a strong password"
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-medium ${
                          passwordStrength <= 2 ? 'text-red-600' : 
                          passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                    </div>
                  )}
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Government Worker Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="governmentWorker"
                    checked={formData.isGovernmentWorker}
                    onChange={(e) => handleInputChange('isGovernmentWorker', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="governmentWorker" className="ml-2 text-sm text-gray-700 flex items-center">
                    Are you a government worker/volunteer?
                    <div className="relative ml-2 group">
                      <Info className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                        Enables special contribution features
                      </div>
                    </div>
                  </label>
                </div>

                {/* Terms Agreement */}
                <div>
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                      required
                    />
                    <label htmlFor="agreeToTerms" className="ml-2 text-sm text-gray-700">
                      By signing up, you agree to our{' '}
                      <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {errors.terms && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.terms}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !formData.agreeToTerms}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Sign Up
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                  </div>
                </div>
                <Link
                  to="/signin"
                  className="mt-4 w-full inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300"
                >
                  Sign In Instead
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 to-emerald-700 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 right-20 w-32 h-32 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-32 left-16 w-24 h-24 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 right-1/3 w-16 h-16 border-2 border-white rounded-full"></div>
          </div>

          <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mb-8"
            >
              <img
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Civic Spirit"
                className="w-80 h-64 object-cover rounded-2xl shadow-2xl mb-8 mx-auto"
              />
              <h2 className="text-3xl font-bold mb-4">Join the Civic Revolution!</h2>
              <p className="text-xl text-green-100 leading-relaxed">
                Be part of India's largest civic engagement platform. Your voice, your action, your impact.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-2 gap-8 text-center"
            >
              <div>
                <div className="text-2xl font-bold">1M+</div>
                <div className="text-green-200 text-sm">Citizens Joined</div>
              </div>
              <div>
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-green-200 text-sm">Lives Improved</div>
              </div>
              <div>
                <div className="text-2xl font-bold">247</div>
                <div className="text-green-200 text-sm">Cities Connected</div>
              </div>
              <div>
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-green-200 text-sm">Support Available</div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;
