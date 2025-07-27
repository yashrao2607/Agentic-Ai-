import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatbotWidgetProps {
  darkMode: boolean;
}

interface Message {
  content: string;
  sender: 'user' | 'bot';
  isAction?: boolean;
}

interface Language {
  name: string;
  nativeName: string;
}

interface QuickAction {
  id: string;
  text: string;
  query: string;
  bgColor: string;
  textColor: string;
  icon: string;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [conversationState, setConversationState] = useState<{
    awaiting: string | null;
    startLocation: string | null;
  }>({ awaiting: null, startLocation: null });
  const [showThinking, setShowThinking] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languages: Record<string, Language> = {
    'en': { name: 'English', nativeName: 'English' },
    'hi': { name: 'Hindi', nativeName: 'हिन्दी' },
    'kn': { name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    'mr': { name: 'Marathi', nativeName: 'मराठी' },
    'te': { name: 'Telugu', nativeName: 'తెలుగు' },
    'ta': { name: 'Tamil', nativeName: 'தமிழ்' },
  };

  const i18n: Record<string, any> = {
    'en': {
      termsAndConditions: {
        title: "Terms & Conditions",
        content: `<p class="font-semibold">1. Introduction</p><p>Welcome to the Civic Sense Reporting Platform. By using our service, you agree to these terms. This platform allows you to report civic issues to be reviewed by government authorities.</p><p class="font-semibold">2. User Conduct</p><p>You agree to provide accurate and truthful information in your reports. You will not submit spam, abusive content, or deliberately false reports. Misuse of the platform may result in a ban.</p><p class="font-semibold">3. Data Privacy and Usage</p><p>The information you provide, including photos and location data, will be shared with relevant municipal and government bodies for the sole purpose of addressing the issues you report. We are committed to protecting your privacy in accordance with the laws of India.</p><p class="font-semibold">4. Disclaimer</p><p>This service is provided "as is". While we strive to ensure all reports are addressed, we do not guarantee a resolution or a specific timeline for any issue. The platform serves as a bridge between citizens and authorities.</p>`
      },
      quickActions: [
        {
          id: 'journeyPlanner',
          text: 'Journey Planner',
          query: 'plan journey',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 3l6-3" /></svg>`
        },
        {
          id: 'aboutUs',
          text: 'Details About Us',
          query: 'about us',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
        },
        {
          id: 'services',
          text: 'Services Offered',
          query: 'services',
          bgColor: 'bg-teal-100',
          textColor: 'text-teal-800',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>`
        },
        {
          id: 'status',
          text: 'Service Status',
          query: 'status',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
        },
        {
          id: 'helpline',
          text: 'Helpline & Support',
          query: 'helpline',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>`
        }
      ],
      responses: {
        aboutUs: "We are a community-driven platform dedicated to improving civic infrastructure...",
        services: "Our platform allows you to report civic issues like improper garbage disposal, illegal posters, public nuisance, or blocked footpaths...",
        status: "All our reporting systems are currently operational...",
        helpline: "For technical assistance, email <b>support@civic-sense.org</b>. For emergencies, please contact the standard city helpline at <b>100</b>.",
        greet: "Hello! I'm the Civic Helper. How can I assist you today? You can ask me a question or choose from the options below.",
        default: "I appreciate you asking about that. My main role is to help with civic sense issues like reporting illegal posters or public nuisances. How can I assist you with a civic matter today? You can always choose from the main options below.",
        escalate: "It sounds like you're dealing with a serious issue. For matters like this that require immediate or specialized attention, it's best to contact the official authorities directly. You can reach the city helpline at <b>100</b> or our dedicated support team at <b>support@civic-sense.org</b> for guidance.",
        multiPartIntro: "Excellent question! Let me cover those points for you:",
        askJourneyStart: "Of course! To plan your journey, where are you starting from?",
        askJourneyEnd: "Got it. And where are you heading to?",
        journeyResult: (from: string, to: string, usual: number, current: number, delay: number, conditions: string) => 
          `<div class="p-3 bg-gray-100 rounded-lg border"><p class="font-bold text-lg">Journey from ${from} to ${to}</p><div class="mt-2 grid grid-cols-2 gap-2 text-center"><div><p class="text-sm text-gray-500">Usual Time</p><p class="font-bold text-green-600 text-xl">${usual} min</p></div><div><p class="text-sm text-gray-500">Current Time</p><p class="font-bold text-red-600 text-xl">${current} min</p><p class="text-xs text-red-500">(+${delay} min delay)</p></div></div><p class="mt-3 text-sm text-center"><b>Conditions:</b> ${conditions}</p></div>`
      }
    },
    'hi': {
      termsAndConditions: { title: "नियम एवं शर्तें", content: `<p>नागरिक भावना रिपोर्टिंग प्लेटफॉर्म में आपका स्वागत है...</p>` },
      quickActions: [
        {
          id: 'journeyPlanner',
          text: 'यात्रा योजनाकार',
          query: 'यात्रा योजना',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 3l6-3" /></svg>`
        },
        {
          id: 'aboutUs',
          text: 'हमारे बारे में',
          query: 'हमारे बारे में',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
        },
        {
          id: 'services',
          text: 'सेवाएं',
          query: 'सेवाएं',
          bgColor: 'bg-teal-100',
          textColor: 'text-teal-800',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>`
        },
        {
          id: 'status',
          text: 'सेवा स्थिति',
          query: 'स्थिति',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
        },
        {
          id: 'helpline',
          text: 'हेल्पलाइन',
          query: 'हेल्पलाइन',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>`
        }
      ],
      responses: {
        aboutUs: "हम एक समुदाय-संचालित मंच हैं जो नागरिकों को सीधे नगर निगम के अधिकारियों से जोड़कर नागरिक बुनियादी ढांचे में सुधार के लिए समर्पित है।",
        services: "हमारा मंच आपको अनुमति देता है: <br>• <b>नागरिक मुद्दों की रिपोर्ट करें</b> जैसे अनुचित कचरा निपटान, अवैध पोस्टर, सार्वजनिक उपद्रव, या अवरुद्ध फुटपाथ। <br>• अपनी रिपोर्ट की स्थिति को ट्रैक करें। <br>• एक इंटरेक्टिव मानचित्र पर सभी मुद्दों को देखें। <br>• अपने योगदान के लिए अंक अर्जित करें और लीडरबोर्ड पर चढ़ें।",
        status: "हमारी सभी रिपोर्टिंग प्रणालियाँ वर्तमान में चालू हैं।",
        helpline: "तकनीकी सहायता के लिए, <b>support@civic-sense.org</b> पर ईमेल करें। आपात स्थिति के लिए, <b>100</b> पर संपर्क करें।",
        greet: "नमस्ते! मैं सिविक हेल्पर हूँ। मैं आज आपकी कैसे सहायता कर सकता हूँ? आप मुझसे कोई प्रश्न पूछ सकते हैं या नीचे दिए गए विकल्पों में से चुन सकते हैं।",
        default: "यह एक अच्छा सवाल है! जब मैं और सीख रहा हूँ, मैं निश्चित रूप से मुख्य क्षेत्रों में मदद कर सकता हूँ। कृपया दिए गए विकल्पों में से एक चुनें।",
        escalate: "ऐसा लगता है कि आप एक गंभीर समस्या से निपट रहे हैं। ऐसे मामलों के लिए जिन्हें तत्काल या विशेष ध्यान देने की आवश्यकता है, सीधे आधिकारिक अधिकारियों से संपर्क करना सबसे अच्छा है। आप शहर की हेल्पलाइन <b>100</b> पर या मार्गदर्शन के लिए हमारी समर्पित सहायता टीम से <b>support@civic-sense.org</b> पर संपर्क कर सकते हैं।",
        multiPartIntro: "उत्कृष्ट प्रश्न! मैं उन बिंदुओं को आपके लिए कवर करता हूँ:",
        askJourneyStart: "बेशक! अपनी यात्रा की योजना बनाने के लिए, आप कहाँ से शुरू कर रहे हैं?",
        askJourneyEnd: "समझ गया। और आप कहाँ जा रहे हैं?",
        journeyResult: (from: string, to: string, usual: number, current: number, delay: number, conditions: string) =>
          `<div class="p-3 bg-gray-100 rounded-lg border"><p class="font-bold text-lg">${from} से ${to} तक की यात्रा</p><div class="mt-2 grid grid-cols-2 gap-2 text-center"><div><p class="text-sm text-gray-500">सामान्य समय</p><p class="font-bold text-green-600 text-xl">${usual} मिनट</p></div><div><p class="text-sm text-gray-500">वर्तमान समय</p><p class="font-bold text-red-600 text-xl">${current} मिनट</p><p class="text-xs text-red-500">(+${delay} मिनट की देरी)</p></div></div><p class="mt-3 text-sm text-center"><b>स्थिति:</b> ${conditions}</p></div>`
      }
    }
  };

  const botKeywords: Record<string, Record<string, string>> = {
    'en': {
      "journey": "journeyPlanner", "plan": "journeyPlanner", "traffic": "journeyPlanner", "route": "journeyPlanner",
      "about": "aboutUs", "who are you": "aboutUs",
      "service": "services", "offer": "services",
      "status": "status", "system": "status",
      "helpline": "helpline", "support": "helpline", "contact": "helpline",
      "report": "services", "track": "services", "map": "services", "leaderboard": "services",
      "emergency": "escalate", "urgent": "escalate", "fire": "escalate", "police": "escalate",
      "power cut": "escalate", "legal": "escalate", "dispute": "escalate", "stuck": "escalate"
    },
    'hi': {}
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, sender: 'user' | 'bot', isAction = false) => {
    setMessages(prev => [...prev, { content, sender, isAction }]);
  };

  const startChat = () => {
    if (!termsAccepted) return;
    
    setShowSplash(false);
    const selectedLanguageData = i18n[currentLanguage] || i18n['en'];
    
    setTimeout(() => {
      addMessage(selectedLanguageData.responses.greet, 'bot');
      setShowQuickActions(true);
    }, 500);
  };

  const handleQuickActionClick = (actionId: string, actionText: string) => {
    addMessage(actionText, 'user');
    setShowQuickActions(false);
    setShowThinking(true);

    setTimeout(() => {
      setShowThinking(false);
      const selectedLanguageData = i18n[currentLanguage] || i18n['en'];
      
      if (actionId === 'journeyPlanner') {
        addMessage(selectedLanguageData.responses.askJourneyStart, 'bot');
        setConversationState({ awaiting: 'journey_start', startLocation: null });
      } else {
        const response = selectedLanguageData.responses[actionId];
        if (response) addMessage(response, 'bot');
      }
    }, 800);
  };

  const getSimulatedTraffic = (start: string, end: string) => {
    const baseTime = Math.floor(Math.random() * 30) + 20;
    const delay = Math.floor(Math.random() * 25) + 5;
    const conditions = [
      "Heavy traffic near the flyover",
      "Slow moving traffic due to road work",
      "Clear roads with minor congestion",
      "An accident reported on the main road"
    ];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];

    return {
      usual: baseTime,
      current: baseTime + delay,
      delay: delay,
      conditions: randomCondition
    };
  };

  const getBotResponses = (input: string) => {
    const lowerInput = input.toLowerCase();
    const responseKeys = new Set<string>();
    const currentKeywords = botKeywords[currentLanguage] || botKeywords['en'];
    const selectedLanguageData = i18n[currentLanguage] || i18n['en'];
    
    for (const keyword in currentKeywords) {
      if (lowerInput.includes(keyword)) {
        responseKeys.add(currentKeywords[keyword]);
      }
    }

    const responses: string[] = [];
    
    if (responseKeys.has('escalate')) {
      responses.push(selectedLanguageData.responses.escalate);
    } else if (responseKeys.size === 0) {
      responses.push(selectedLanguageData.responses.default);
      setTimeout(() => setShowQuickActions(true), 1200);
    } else {
      if (responseKeys.size > 1) responses.push(selectedLanguageData.responses.multiPartIntro);
      responseKeys.forEach(key => {
        if (key === 'journeyPlanner') {
          responses.push(selectedLanguageData.responses.askJourneyStart);
          setConversationState({ awaiting: 'journey_start', startLocation: null });
        } else {
          responses.push(selectedLanguageData.responses[key]);
        }
      });
    }
    
    return responses;
  };

  const processUserInput = () => {
    const userText = userInput.trim();
    if (userText === "") return;
    
    addMessage(userText, 'user');
    setUserInput("");
    setShowQuickActions(false);
    setShowThinking(true);

    setTimeout(() => {
      setShowThinking(false);
      const selectedLanguageData = i18n[currentLanguage] || i18n['en'];

      if (conversationState.awaiting === 'journey_start') {
        setConversationState({ ...conversationState, startLocation: userText, awaiting: 'journey_end' });
        addMessage(selectedLanguageData.responses.askJourneyEnd, 'bot');
        return;
      }

      if (conversationState.awaiting === 'journey_end') {
        const startLocation = conversationState.startLocation!;
        setConversationState({ awaiting: null, startLocation: null });
        setShowThinking(true);
        
        setTimeout(() => {
          setShowThinking(false);
          const trafficData = getSimulatedTraffic(startLocation, userText);
          const resultMessage = selectedLanguageData.responses.journeyResult(
            startLocation, userText, trafficData.usual, trafficData.current, trafficData.delay, trafficData.conditions
          );
          addMessage(resultMessage, 'bot');
        }, 1500);
        return;
      }

      const botReplies = getBotResponses(userText);
      botReplies.forEach((reply, index) => {
        setTimeout(() => {
          addMessage(reply, 'bot');
        }, 400 * (index + 1));
      });
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      processUserInput();
    }
  };

  const selectedLanguageData = i18n[currentLanguage] || i18n['en'];

  return (
    <>
      {/* Chat Icon */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className={`w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
            darkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <svg 
            className="w-8 h-8" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
        </button>
      </motion.div>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg h-[700px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {showSplash ? (
                /* Splash Screen */
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <svg className="w-9 h-9 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Civic Helper</h1>
                  <p className="text-gray-500 mb-6">Please select your preferred language.</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 w-full">
                    {Object.entries(languages).map(([code, lang]) => (
                      <button
                        key={code}
                        onClick={() => setCurrentLanguage(code)}
                        className={`border border-gray-300 rounded-lg p-3 text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none ${
                          currentLanguage === code ? 'ring-2 ring-blue-500 bg-blue-100' : ''
                        }`}
                      >
                        <span className="font-semibold">{lang.nativeName}</span><br />
                        <span className="text-xs text-gray-500">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 mb-6">
                    <input
                      type="checkbox"
                      id="terms-checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="terms-checkbox" className="text-sm text-gray-600">
                      I agree to the{' '}
                      <button
                        onClick={() => setShowTermsModal(true)}
                        className="text-blue-600 hover:underline"
                      >
                        Terms & Conditions
                      </button>
                    </label>
                  </div>
                  
                  <button
                    onClick={startChat}
                    disabled={!termsAccepted}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Start Chat
                  </button>
                </div>
              ) : (
                /* Chat Interface */
                <>
                  <header className="flex items-center p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-2xl">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-4">
                      <svg className="w-7 h-7 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v6.75m0 0l-3-3m3 3l3-3m-8.25 6a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold">Civic Helper</h1>
                      <p className="text-sm opacity-80">Your guide to the platform</p>
                    </div>
                  </header>
                  
                  <main className="flex-1 p-6 overflow-y-auto space-y-4">
                    {messages.map((message, index) => (
                      <div key={index} className={`w-full flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.isAction ? (
                          <div dangerouslySetInnerHTML={{ __html: message.content }} />
                        ) : (
                          <div className={`p-3 rounded-2xl max-w-lg ${
                            message.sender === 'user'
                              ? 'bg-blue-600 text-white rounded-br-none'
                              : 'bg-gray-200 text-gray-800 rounded-bl-none'
                          }`}>
                            <div dangerouslySetInnerHTML={{ __html: message.content }} />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {showThinking && (
                      <div className="flex items-end gap-2 self-start p-3 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-none">
                        <div className="flex items-center space-x-1">
                          <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                        </div>
                      </div>
                    )}
                    
                    {showQuickActions && (
                      <div className="grid grid-cols-2 gap-3 mt-2 w-full max-w-lg">
                        {selectedLanguageData.quickActions.map((action: QuickAction) => (
                          <button
                            key={action.id}
                            onClick={() => handleQuickActionClick(action.id, action.text)}
                            className={`${action.bgColor} ${action.textColor} p-3 rounded-lg flex items-center space-x-3 hover:opacity-80 transition-opacity`}
                          >
                            <div dangerouslySetInnerHTML={{ __html: action.icon }} />
                            <span className="font-semibold text-sm text-left">{action.text}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </main>
                  
                  <footer className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
                    <div className="flex items-center bg-gray-100 rounded-full p-2">
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything..."
                        className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-gray-800 placeholder-gray-500 outline-none"
                      />
                      <button
                        onClick={processUserInput}
                        className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      </button>
                    </div>
                  </footer>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            >
              <header className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedLanguageData.termsAndConditions.title}
                </h2>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="text-gray-400 hover:text-gray-700 text-2xl font-bold"
                >
                  &times;
                </button>
              </header>
              <main className="p-6 overflow-y-auto text-gray-600 space-y-4">
                <div dangerouslySetInnerHTML={{ __html: selectedLanguageData.termsAndConditions.content }} />
              </main>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget; 