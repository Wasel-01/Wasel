import { useState, Suspense, lazy, memo } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load with prefetch hints
const LandingPage = lazy(() => import(/* webpackPrefetch: true */ './components/LandingPage').then(m => ({ default: m.LandingPage })));
const AuthPage = lazy(() => import(/* webpackPrefetch: true */ './components/AuthPage').then(m => ({ default: m.AuthPage })));
const Dashboard = lazy(() => import('./components/Dashboard'));
const Header = lazy(() => import('./components/Header').then(m => ({ default: m.Header })));
const Sidebar = lazy(() => import('./components/Sidebar').then(m => ({ default: m.Sidebar })));
const FindRide = lazy(() => import('./components/FindRide').then(m => ({ default: m.FindRide })));
const OfferRide = lazy(() => import('./components/OfferRide').then(m => ({ default: m.OfferRide })));
const MyTrips = lazy(() => import('./components/MyTrips').then(m => ({ default: m.MyTrips })));
const Messages = lazy(() => import('./components/Messages').then(m => ({ default: m.Messages })));
const Payments = lazy(() => import('./components/Payments').then(m => ({ default: m.Payments })));
const Settings = lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));
const UserProfile = lazy(() => import('./components/UserProfile').then(m => ({ default: m.UserProfile })));
const SafetyCenter = lazy(() => import('./components/SafetyCenter').then(m => ({ default: m.SafetyCenter })));
const ReferralProgram = lazy(() => import('./components/ReferralProgram').then(m => ({ default: m.ReferralProgram })));

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

  // Optimized loading fallback
  const LoadingFallback = memo(() => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ));

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
    return <LoadingFallback />;
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