import { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load components for code splitting
const LandingPage = lazy(() => import('./components/LandingPage').then(module => ({ default: module.LandingPage })));
const AuthPage = lazy(() => import('./components/AuthPage').then(module => ({ default: module.AuthPage })));
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.default })));
const Header = lazy(() => import('./components/Header').then(module => ({ default: module.Header })));
const Sidebar = lazy(() => import('./components/Sidebar').then(module => ({ default: module.Sidebar })));
const FindRide = lazy(() => import('./components/FindRide').then(module => ({ default: module.FindRide })));
const OfferRide = lazy(() => import('./components/OfferRide').then(module => ({ default: module.OfferRide })));
const MyTrips = lazy(() => import('./components/MyTrips').then(module => ({ default: module.MyTrips })));
const Messages = lazy(() => import('./components/Messages').then(module => ({ default: module.Messages })));
const Payments = lazy(() => import('./components/Payments').then(module => ({ default: module.Payments })));
const Settings = lazy(() => import('./components/Settings').then(module => ({ default: module.Settings })));
const UserProfile = lazy(() => import('./components/UserProfile').then(module => ({ default: module.UserProfile })));
const SafetyCenter = lazy(() => import('./components/SafetyCenter').then(module => ({ default: module.SafetyCenter })));
const ReferralProgram = lazy(() => import('./components/ReferralProgram').then(module => ({ default: module.ReferralProgram })));

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
  | 'referrals';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );

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
      <Suspense fallback={<LoadingFallback />}>
        <LandingPage
          onGetStarted={handleGetStarted}
          onLogin={handleLogin}
        />
      </Suspense>
    );
  }

  // Show auth page
  if (!user && currentPage === 'auth') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <AuthPage
          onSuccess={handleAuthSuccess}
          onBack={() => setCurrentPage('landing')}
          initialTab={authMode === 'signup' ? 'signup' : 'login'}
        />
      </Suspense>
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
      <Suspense fallback={<LoadingFallback />}>
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onNavigate={handleNavigate}
        />
      </Suspense>

      <div className="flex">
        <Suspense fallback={<LoadingFallback />}>
          <Sidebar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </Suspense>

        <main className="flex-1 p-6 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<LoadingFallback />}>
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
            </Suspense>
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