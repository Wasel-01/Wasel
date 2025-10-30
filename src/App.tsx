import { useState, useEffect, lazy, Suspense } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const FindRide = lazy(() => import('./components/FindRide').then(m => ({ default: m.FindRide })));
const OfferRide = lazy(() => import('./components/OfferRide').then(m => ({ default: m.OfferRide })));
const MyTrips = lazy(() => import('./components/MyTrips').then(m => ({ default: m.MyTrips })));
const Messages = lazy(() => import('./components/Messages').then(m => ({ default: m.Messages })));
const Payments = lazy(() => import('./components/Payments').then(m => ({ default: m.Payments })));
const Settings = lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));
const UserProfile = lazy(() => import('./components/UserProfile').then(m => ({ default: m.UserProfile })));
const NotificationCenter = lazy(() => import('./components/NotificationCenter').then(m => ({ default: m.NotificationCenter })));
const SafetyCenter = lazy(() => import('./components/SafetyCenter').then(m => ({ default: m.SafetyCenter })));
const TripAnalytics = lazy(() => import('./components/TripAnalytics').then(m => ({ default: m.TripAnalytics })));
const RecurringTrips = lazy(() => import('./components/RecurringTrips').then(m => ({ default: m.RecurringTrips })));
const VerificationCenter = lazy(() => import('./components/VerificationCenter').then(m => ({ default: m.VerificationCenter })));
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ResetPassword from './components/ResetPassword';

type AppFlow = 'landing' | 'auth' | 'app';

function AppContent() {
  const { user, loading, isBackendConnected } = useAuth();
  // Dedicated reset password route (for Supabase redirect)
  if (typeof window !== 'undefined' && window.location.pathname === '/reset-password') {
    return <ResetPassword />;
  }
  const [appFlow, setAppFlow] = useState<AppFlow>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Show backend status banner
  useEffect(() => {
    if (!loading && !isBackendConnected) {
      console.warn(
        '%c⚠️ Running in Demo Mode',
        'color: orange; font-size: 14px; font-weight: bold',
        '\nBackend is not configured. Features using real-time data will use mock data.\nTo enable backend: See /GET_STARTED.md or /.env file'
      );
    }
  }, [loading, isBackendConnected]);

  // Auto-navigate based on auth state
  useEffect(() => {
    if (!loading) {
      if (user) {
        setAppFlow('app');
      } else if (appFlow === 'app') {
        setAppFlow('landing');
      }
    }
  }, [user, loading]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'find-ride':
        return <FindRide />;
      case 'offer-ride':
        return <OfferRide />;
      case 'my-trips':
        return <MyTrips />;
      case 'messages':
        return <Messages />;
      case 'payments':
        return <Payments />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <UserProfile />;
      case 'notifications':
        return <NotificationCenter />;
      case 'safety':
        return <SafetyCenter />;
      case 'analytics':
        return <TripAnalytics />;
      case 'recurring':
        return <RecurringTrips />;
      case 'verification':
        return <VerificationCenter />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  // Landing Page Flow
  if (appFlow === 'landing') {
    return (
      <LandingPage
        onGetStarted={() => {
          setAuthMode('signup');
          setAppFlow('auth');
        }}
        onLogin={() => {
          setAuthMode('login');
          setAppFlow('auth');
        }}
      />
    );
  }

  // Authentication Flow
  if (appFlow === 'auth') {
    return (
      <AuthPage
        initialTab={authMode}
        onSuccess={() => setAppFlow('app')}
        onBack={() => setAppFlow('landing')}
      />
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Wassel...</p>
        </div>
      </div>
    );
  }

  // Main Application
  return (
    <>
      <div className="size-full flex bg-gray-50">
        <Sidebar 
          currentPage={currentPage} 
          onNavigate={setCurrentPage}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Header onMenuClick={() => setIsSidebarOpen(true)} onNavigate={setCurrentPage} />
          <main className="flex-1 overflow-auto p-6 lg:p-8">
            <Suspense fallback={
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            }>
            {renderPage()}
            </Suspense>
          </main>
        </div>
      </div>
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
