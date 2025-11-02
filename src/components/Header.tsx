import { useEffect, useState } from 'react';
import { Bell, Menu, User, Moon, Sun } from 'lucide-react';
import { Badge } from './ui/badge';
import { Logo } from './Logo';
import { notificationService } from '../services/notificationService';

interface HeaderProps {
  onMenuClick: () => void;
  onNavigate?: (page: string) => void;
}

export function Header({ onMenuClick, onNavigate }: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notifications) => {
      const count = notifications.filter(n => !n.read).length;
      setUnreadCount(count);
    });

    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);

    return unsubscribe;
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');

    // Haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Auto-switch based on time (sunset to sunrise)
  useEffect(() => {
    const checkTimeForAutoSwitch = () => {
      const now = new Date();
      const hour = now.getHours();
      const isNightTime = hour >= 18 || hour <= 6; // 6 PM to 6 AM

      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) { // Only auto-switch if no manual preference
        const shouldBeDark = isNightTime;
        if (shouldBeDark !== isDarkMode) {
          setIsDarkMode(shouldBeDark);
          document.documentElement.classList.toggle('dark', shouldBeDark);
        }
      }
    };

    // Check immediately and then every hour
    checkTimeForAutoSwitch();
    const interval = setInterval(checkTimeForAutoSwitch, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isDarkMode]);

  return (
    <header className="bg-white dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border px-6 py-4 transition-smooth">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg transition-smooth focus-ring"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Logo size="xs" showText={false} className="lg:hidden" />
          <div className="hidden sm:block">
            <h1 className="text-gray-900 dark:text-dark-text font-semibold">Wassel</h1>
            <p className="text-sm text-gray-500 dark:text-dark-text2">واصل</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg transition-smooth focus-ring"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-700 dark:text-dark-text" />
            )}
          </button>

          {/* Notifications */}
          <button
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg transition-smooth focus-ring"
            onClick={() => onNavigate?.('notifications')}
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
          >
            <Bell className="w-5 h-5 text-gray-700 dark:text-dark-text" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 size-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse-slow font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Avatar */}
          <button
            className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center hover:bg-primary/20 dark:hover:bg-primary/30 transition-smooth focus-ring"
            onClick={() => onNavigate?.('profile')}
            aria-label="Open user profile"
          >
            <User className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>
    </header>
  );
}
