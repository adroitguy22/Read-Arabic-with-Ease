import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password' | 'reset-password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { login, register, forgotPassword, resetPassword, isLoading, error, clearError } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage('');

    try {
      if (mode === 'login') {
        await login(email, password);
        onClose();
      } else if (mode === 'signup') {
        await register(email, password, name || undefined);
        onClose();
      } else if (mode === 'forgot-password') {
        const result = await forgotPassword(email);
        setSuccessMessage(result.message);
        // For dev: auto-fill token if provided
        if (result.devToken) {
          setResetToken(result.devToken);
          setMode('reset-password');
          setSuccessMessage('Dev mode: Token received. Please reset your password.');
        }
      } else if (mode === 'reset-password') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await resetPassword(resetToken, password);
        setSuccessMessage('Password reset successfully. Please log in.');
        setTimeout(() => setMode('login'), 2000);
      }

      if (mode === 'login' || mode === 'signup') {
        // Clear form only on successful auth
        setEmail('');
        setPassword('');
        setName('');
      }
    } catch (err) {
      // Error is handled in auth context or locally
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    clearError();
    setSuccessMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-emerald-500/30 bg-slate-900/95 p-6 shadow-2xl shadow-emerald-500/20">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-emerald-400">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot-password' && 'Reset Password'}
            {mode === 'reset-password' && 'New Password'}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {mode === 'login' && 'Sign in to continue your learning journey'}
            {mode === 'signup' && 'Start tracking your progress today'}
            {mode === 'forgot-password' && 'Enter your email to receive a reset link'}
            {mode === 'reset-password' && 'Enter your new password below'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-500/20 border border-rose-500/40 p-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-lg bg-emerald-500/20 border border-emerald-500/40 p-3 text-sm text-emerald-200">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Your name"
              />
            </div>
          )}

          {(mode === 'login' || mode === 'signup' || mode === 'forgot-password') && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="you@example.com"
              />
            </div>
          )}

          {(mode === 'login' || mode === 'signup' || mode === 'reset-password') && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                {mode === 'reset-password' ? 'New Password' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="••••••"
              />
              {(mode === 'signup' || mode === 'reset-password') && (
                <p className="mt-1 text-xs text-slate-500">At least 6 characters</p>
              )}
            </div>
          )}

          {mode === 'reset-password' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="••••••"
              />
            </div>
          )}

          {mode === 'reset-password' && resetToken === '' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Reset Token
              </label>
              <input
                type="text"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Paste token here"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? 'Processing...'
              : (mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : mode === 'forgot-password' ? 'Send Reset Link' : 'Reset Password')
            }
          </button>
        </form>

        <div className="mt-4 text-center text-sm space-y-2">
          {(mode === 'login' || mode === 'signup') && (
            <div>
              <span className="text-slate-400">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              </span>
              <button
                onClick={toggleMode}
                className="font-medium text-emerald-400 hover:text-emerald-300"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          )}

          {mode === 'login' && (
            <button
              onClick={() => {
                setMode('forgot-password');
                clearError();
                setSuccessMessage('');
              }}
              className="text-xs text-slate-400 hover:text-emerald-400 transition"
            >
              Forgot your password?
            </button>
          )}

          {(mode === 'forgot-password' || mode === 'reset-password') && (
            <button
              onClick={() => {
                setMode('login');
                clearError();
                setSuccessMessage('');
              }}
              className="text-emerald-400 hover:text-emerald-300"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
