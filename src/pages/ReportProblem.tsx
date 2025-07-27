import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Mic, MapPin, Send, Star, Award } from 'lucide-react';
import ProblemCategories from '../components/ProblemCategories';
import LocationPicker from '../components/LocationPicker';
import GamificationPanel from '../components/GamificationPanel';

const ReportProblem: React.FC = () => {
  // State to hold all the form data, including the photo file
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    severity: 3,
    location: '',
    photo: null as File | null
  });

  // State for the voice recording UI toggle
  const [isRecording, setIsRecording] = useState(false);
  
  // State to manage which step of the form is currently displayed
  const [currentStep, setCurrentStep] = useState(1);

  // Generic handler to update form data state
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handler for when a user selects a photo
  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }));
    }
  };

  // Handler for submitting the form to the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if not on the final step
    if (currentStep !== 3) return;

    // Use FormData to correctly handle file uploads
    const submissionData = new FormData();
    submissionData.append('title', formData.title);
    submissionData.append('description', formData.description);
    submissionData.append('category', formData.category);
    submissionData.append('severity', formData.severity.toString());
    submissionData.append('location', formData.location);
    if (formData.photo) {
      submissionData.append('photo', formData.photo);
    }
    submissionData.append('processed', 'false');

    try {
      const response = await fetch('http://localhost:3001/api/submit-report', {
        method: 'POST',
        body: submissionData,
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Report submitted successfully!\n\nReport ID: ${result.id}\n\nYou can track your report in the tracking portal.`);
        // Reset the form to its initial state
        setCurrentStep(1);
        setFormData({
          title: '',
          description: '',
          category: '',
          severity: 3,
          location: '',
          photo: null,
        });
              } else {
            const errorData = await response.json();
            console.error('Form submission failed:', errorData);
            
            let errorMessage = errorData.error || 'Could not submit the report.';
            
            // Handle image upload errors
            if (errorMessage.includes('Failed to upload image')) {
                errorMessage = `Image Upload Failed!\n\n${errorMessage}\n\nPlease try uploading a smaller image or check your internet connection.`;
            }
            
            alert(`Error: ${errorMessage}\n\nPlease try again or contact support if the problem persists.`);
        }
    } catch (error) {
      console.error('An error occurred during submission:', error);
      alert('Network error occurred. Please check your internet connection and try again.');
    }
  };
  
  // Validation logic to disable the 'Next' button if fields are incomplete
  const isNextDisabled =
    (currentStep === 1 && (!formData.title || !formData.description || !formData.category)) ||
    (currentStep === 2 && !formData.location);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Citizen Voice Portal
                </h1>
                <p className="text-gray-600">
                  Your voice matters. Report issues and help build a better community.
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-4">
                  {[1, 2, 3].map((step) => (
                    <React.Fragment key={step}>
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                          currentStep >= step
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {step}
                      </div>
                      {step < 3 && (
                        <div
                          className={`w-16 h-1 rounded ${
                            currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Step 1: Problem Details */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-3">
                        Problem Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Brief description of the issue"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-3">
                        Detailed Description
                      </label>
                      <div className="relative">
                        <textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Provide detailed information about the problem"
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg resize-none"
                        />
                        <button
                          type="button"
                          onClick={() => setIsRecording(!isRecording)}
                          className={`absolute bottom-4 right-4 p-2 rounded-full ${
                            isRecording
                              ? 'bg-red-500 text-white animate-pulse'
                              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          } transition-all duration-200`}
                        >
                          <Mic className="w-5 h-5" />
                        </button>
                      </div>
                      {isRecording && (
                        <p className="text-red-600 text-sm mt-2 animate-pulse">
                          🎙️ Voice recording in progress...
                        </p>
                      )}
                    </div>

                    <ProblemCategories
                      selectedCategory={formData.category}
                      onCategoryChange={(category) => handleInputChange('category', category)}
                    />
                  </motion.div>
                )}

                {/* Step 2: Photo & Location */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-3">
                        Photo Evidence
                      </label>
                      <div className="mb-4 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
                        <strong>📸 Image Upload:</strong><br/>
                        • Upload a clear photo of the problem<br/>
                        • Supported formats: PNG, JPG<br/>
                        • File size: Up to 10MB
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoCapture}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label htmlFor="photo-upload" className="cursor-pointer">
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Click to capture or upload photo</p>
                          <p className="text-sm text-gray-400">PNG, JPG up to 10MB</p>
                        </label>
                        {formData.photo && (
                          <p className="text-green-600 mt-2">✅ Photo uploaded successfully</p>
                        )}
                      </div>
                    </div>

                    <LocationPicker
                      onLocationChange={(location) => handleInputChange('location', location)}
                    />

                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-3">
                        Severity Level: {formData.severity}/5
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={formData.severity}
                        onChange={(e) => handleInputChange('severity', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>Low</span>
                        <span>Critical</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Review & Submit */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="space-y-6"
                  >
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-xl font-semibold mb-4">Review Your Report</h3>
                      <div className="space-y-4">
                        <div>
                          <span className="font-medium text-gray-600">Title:</span>
                          <p className="text-gray-900">{formData.title || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Category:</span>
                          <p className="text-gray-900">{formData.category || 'Not selected'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Severity:</span>
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < formData.severity
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                    >
                      <Send className="mr-3 w-6 h-6" />
                      Submit Report
                    </button>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className="px-6 py-2 text-gray-600 hover:text-blue-600 font-medium transition-colors"
                    >
                      Previous
                    </button>
                  )}
                  {currentStep < 3 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(prev => prev + 1)}
                      disabled={isNextDisabled}
                      className={`ml-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold transition-colors ${
                        isNextDisabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-blue-700'
                      }`}
                    >
                      Next Step
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <GamificationPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportProblem;
