import { useState } from 'react';
import { Mail, Lock, User, Phone, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '../services/api';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Logo } from './Logo';

interface AuthPageProps {
  onSuccess: () => void;
  onBack: () => void;
  initialTab?: 'login' | 'signup';
}

export function AuthPage({ onSuccess, onBack, initialTab = 'signup' }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; phone?: string; confirmPassword?: string }>({});
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0-4
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') || '');
    const password = String(data.get('password') || '');
    const phone = String(data.get('phone') || '');
    const confirmPassword = String(data.get('confirm_password') || '');

    const newErrors: { email?: string; password?: string; phone?: string; confirmPassword?: string } = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email';
    if (password.length < 8) newErrors.password = 'Minimum 8 characters';
    if (phone && !/^\+?[0-9\s-]{7,}$/.test(phone)) newErrors.phone = 'Enter a valid phone';
    if (form.dataset.mode === 'signup' && confirmPassword !== password) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]') as HTMLInputElement | null;
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    setIsLoading(true);
    try {
      if (form.dataset.mode === 'signup') {
        const firstName = String(data.get('first_name') || '');
        const lastName = String(data.get('last_name') || '');
        await authAPI.signUp(email, password, firstName, lastName, phone);
      } else {
        await authAPI.signIn(email, password);
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const emailInput = document.querySelector('form[data-mode="login"] input[name="email"]') as HTMLInputElement | null;
    const email = emailInput?.value || '';
    if (!email) {
      setErrors(e => ({ ...e, email: 'Enter your email to reset password' }));
      emailInput?.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors(e => ({ ...e, email: 'Enter a valid email' }));
      emailInput?.focus();
      return;
    }
    try {
      await authAPI.resetPassword(email);
      toast.success('Password reset email sent. Check your inbox.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/5 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo size="xl" showText={false} />
            </div>
            <CardTitle className="text-3xl">Welcome to Wassel</CardTitle>
            <CardDescription>واصل - Share Your Journey</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={initialTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="login">Log In</TabsTrigger>
              </TabsList>

              <TabsContent value="signup">
                <form onSubmit={handleSubmit} className="space-y-4 mt-4" data-mode="signup" aria-live="polite">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input placeholder="First name" required autoComplete="given-name" name="first_name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input placeholder="Last name" required autoComplete="family-name" name="last_name" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        type="email" 
                        placeholder="your@email.com" 
                        className="pl-10"
                        name="email"
                        autoComplete="email"
                        required 
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'signup-email-error' : undefined}
                      />
                      {errors.email && <p id="signup-email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        type="tel" 
                        placeholder="+971 50 123 4567" 
                        className="pl-10"
                        name="phone"
                        autoComplete="tel"
                        required 
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'signup-phone-error' : undefined}
                      />
                      {errors.phone && <p id="signup-phone-error" className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        type={showSignupPassword ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        className="pl-10"
                        name="password"
                        autoComplete="new-password"
                        required 
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? 'signup-password-error' : 'signup-password-hint'}
                      />
                      <button type="button" aria-label={showSignupPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowSignupPassword(v => !v)}>
                        {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {errors.password && <p id="signup-password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>}
                      {!errors.password && (
                        <p id="signup-password-hint" className="mt-1 text-xs text-gray-500">Min 8 chars, include uppercase, number, and symbol for best security.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        type={showSignupConfirm ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        className="pl-10"
                        name="confirm_password"
                        autoComplete="new-password"
                        aria-invalid={!!errors.confirmPassword}
                        aria-describedby={errors.confirmPassword ? 'signup-confirm-error' : undefined}
                        required 
                      />
                      <button type="button" aria-label={showSignupConfirm ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowSignupConfirm(v => !v)}>
                        {showSignupConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {errors.confirmPassword && <p id="signup-confirm-error" className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <input type="checkbox" id="terms" className="mt-1" required />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to Wassel's Terms of Service and Privacy Policy
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="login">
                <form onSubmit={handleSubmit} className="space-y-4 mt-4" data-mode="login" aria-live="polite">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        type="email" 
                        placeholder="your@email.com" 
                        className="pl-10"
                        name="email"
                        autoComplete="email"
                        required 
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'login-email-error' : undefined}
                      />
                      {errors.email && <p id="login-email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Password</Label>
                      <button type="button" className="text-sm text-teal-600 hover:text-teal-700" onClick={handleForgotPassword}>
                        Forgot?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        type={showLoginPassword ? 'text' : 'password'} 
                        placeholder="••••••••" 
                        className="pl-10"
                        name="password"
                        autoComplete="current-password"
                        required 
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? 'login-password-error' : undefined}
                      />
                      <button type="button" aria-label={showLoginPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowLoginPassword(v => !v)}>
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {errors.password && <p id="login-password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </label>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button variant="outline" type="button">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button variant="outline" type="button">
                  <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-6">
          By signing up, you agree to our commitment to safe and sustainable travel
        </p>
      </div>
    </div>
  );
}
