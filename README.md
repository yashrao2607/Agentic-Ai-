# CivicSense - AI-Powered Civic Engagement Platform

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.2-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-38B2AC.svg)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.0.0-orange.svg)](https://firebase.google.com/)

A comprehensive civic engagement platform that empowers citizens to report and track community issues using AI-powered features, interactive maps, and gamification elements.

## 🌟 Features

### 🏠 **Core Functionality**
- **Problem Reporting**: Report civic issues with photo uploads and location tracking
- **Real-time Tracking**: Monitor the status of reported problems
- **Interactive Maps**: Visualize issues on Google Maps and Leaflet
- **Gamification**: Earn points, badges, and climb leaderboards
- **Rewards System**: Redeem points for real-world benefits

### 🤖 **AI-Powered Features**
- **Smart Image Validation**: AI-powered image analysis for issue verification
- **Intelligent Chatbot**: Multilingual support with journey planning
- **Automated Problem Classification**: AI agents for categorization and assignment
- **Geospatial Analysis**: Location-based problem clustering and routing

### 🎨 **User Experience**
- **Dark/Light Mode**: Toggle between themes
- **Responsive Design**: Works seamlessly on all devices
- **Smooth Animations**: Powered by Framer Motion
- **Multilingual Support**: English, Hindi, Kannada, Marathi, Telugu, Tamil

### 🔐 **Authentication & Security**
- **User Registration/Login**: Secure authentication system
- **Role-based Access**: Citizen, Worker, and Admin dashboards
- **Firebase Integration**: Secure data storage and real-time updates

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+ (for backend AI features)
- Firebase project setup

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd copyyy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project
   - Update `src/firebaseConfig.ts` with your Firebase credentials
   - Enable Firestore and Storage

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Firebase Admin**
   - Place your `serviceAccountKey.json` in the backend directory
   - Update Firebase configuration in `server.js`

4. **Start the backend server**
   ```bash
   node server.js
   ```

## 📁 Project Structure

```
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.tsx      # Navigation header
│   │   ├── ChatbotWidget.tsx # AI chatbot
│   │   ├── CTASection.tsx  # Call-to-action sections
│   │   └── ...
│   ├── pages/              # Main application pages
│   │   ├── Landing.tsx     # Homepage
│   │   ├── ReportProblem.tsx # Issue reporting
│   │   ├── ProblemTracking.tsx # Status tracking
│   │   ├── MapInterface.tsx # Interactive maps
│   │   ├── Leaderboard.tsx # Gamification
│   │   ├── Rewards.tsx     # Points redemption
│   │   └── ...
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── assets/             # Static assets
├── backend/
│   ├── server.js           # Express.js server
│   ├── image_validator.py  # AI image validation
│   ├── perception_agent.py # AI problem classification
│   ├── geospatial_agent.py # Location analysis
│   ├── assignment_agent.py # Task assignment
│   └── scheduling_agent.py # Work scheduling
└── dist/                   # Production build
```

## 🛠️ Technologies Used

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Leaflet** - Interactive maps
- **Google Maps API** - Location services

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Firebase Admin** - Backend services
- **Python** - AI/ML processing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### AI/ML Stack
- **Google Generative AI** - Text generation
- **Sentence Transformers** - Text embeddings
- **Scikit-learn** - Machine learning
- **Pillow** - Image processing
- **ImageHash** - Image similarity
- **Shapely** - Geospatial analysis

## 🎯 Key Features Explained

### AI-Powered Image Validation
The platform uses advanced computer vision to:
- Verify uploaded images are relevant to reported issues
- Detect duplicate submissions
- Classify problem types automatically
- Ensure image quality and authenticity

### Intelligent Chatbot
A multilingual chatbot that provides:
- Journey planning with traffic updates
- Platform navigation assistance
- Emergency contact information
- Real-time support in 6 languages

### Gamification System
Engage users through:
- Point-based rewards for reporting issues
- Achievement badges for milestones
- Leaderboards for community competition
- Redeemable rewards for civic participation

### Interactive Mapping
Visualize civic issues with:
- Real-time problem clustering
- Route optimization for workers
- Heat maps of problem density
- Location-based analytics

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication, Firestore, and Storage
3. Download service account key for backend
4. Configure security rules for Firestore

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend Deployment
```bash
# Deploy to platforms like Heroku, Railway, or Vercel
# Ensure Python and Node.js environments are available
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Government of India** - Digital India Initiative
- **Firebase** - Backend infrastructure
- **Google Maps** - Location services
- **OpenAI** - AI capabilities
- **Tailwind CSS** - Styling framework

## 📞 Support

For support and questions:
- Email: support@civic-sense.org
- Emergency: 100 (City Helpline)
- Documentation: [Project Wiki](link-to-wiki)

---

**Built with ❤️ for Digital India**