import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FindRide } from './components/FindRide';
import { OfferRide } from './components/OfferRide';
import { MyTrips } from './components/MyTrips';
import { Messages } from './components/Messages';
import { Payments } from './components/Payments';
import { Settings } from './components/Settings';
import { UserProfile } from './components/UserProfile';
import { SafetyCenter } from './components/SafetyCenter';
import { ReferralProgram } from './components/ReferralProgram';
import { AdvancedTripAnalytics } from './components/AdvancedTripAnalytics';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminDashboard } from './components/AdminDashboard';
import { DisputeResolution } from './components/DisputeResolution';
import { VerificationFlow } from './components/VerificationFlow';
import { CarbonDashboard } from './components/CarbonDashboard';
import { SocialCircles } from './components/SocialCircles';
import { CulturalSettings } from './components/CulturalSettings';

type Page = 
  | 'landing'
  | 'auth'
  | 'dashboard'
  | 'find-ride'
  | 'offer-ride'
  | 'my-trips'
  | 'messages'
  | 'payments'
  | 'settings'
  | 'profile'
  | 'safety'
  | 'referrals'
  | 'analytics'
  | 'admin'
  | 'disputes'
  | 'verification'
  | 'carbon'
  | 'circles'
  | 'cultural';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    setSidebarOpen(false);
  };

  const handleGetStarted = () => {
    setAuthMode('signup');
    setCurrentPage('auth');
  };

  const handleLogin = () => {
    setAuthMode('signin');
    setCurrentPage('auth');
  };

  const handleAuthSuccess = () => {
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!user && currentPage === 'landing') {
    return (
      <LandingPage 
        onGetStarted={handleGetStarted}
        onLogin={handleLogin}
      />
    );
  }

  // Show auth page
  if (!user && currentPage === 'auth') {
    return (
      <AuthPage 
        mode={authMode}
        onSuccess={handleAuthSuccess}
        onModeChange={setAuthMode}
      />
    );
  }

  // Redirect to landing if not authenticated
  if (!user) {
    return (
      <LandingPage 
        onGetStarted={handleGetStarted}
        onLogin={handleLogin}
      />
    );
  }

  // Main app layout for authenticated users
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNavigate={handleNavigate}
      />
      
      <div className="flex">
        <Sidebar 
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className="flex-1 p-6 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
            {currentPage === 'find-ride' && <FindRide />}
            {currentPage === 'offer-ride' && <OfferRide />}
            {currentPage === 'my-trips' && <MyTrips />}
            {currentPage === 'messages' && <Messages />}
            {currentPage === 'payments' && <Payments />}
            {currentPage === 'settings' && <Settings />}
            {currentPage === 'profile' && <UserProfile />}
            {currentPage === 'safety' && <SafetyCenter />}
            {currentPage === 'referrals' && <ReferralProgram />}
            {currentPage === 'analytics' && <AdvancedTripAnalytics />}
            {currentPage === 'admin' && <AdminDashboard />}
            {currentPage === 'disputes' && user && <DisputeResolution userId={user.id} />}
            {currentPage === 'verification' && user && <VerificationFlow userId={user.id} onComplete={() => handleNavigate('dashboard')} />}
            {currentPage === 'carbon' && user && <CarbonDashboard userId={user.id} />}
            {currentPage === 'circles' && user && <SocialCircles userId={user.id} />}
            {currentPage === 'cultural' && user && <CulturalSettings userId={user.id} />}
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;