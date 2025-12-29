'use client';

import { db } from '@/lib/instant';
import { ReactNode, useState } from 'react';

export default function AuthWrapper({ children }: { children: ReactNode }) {
  const { isLoading, user, error } = db.useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-neutral-50 to-zinc-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-300 mx-auto"></div>
          <p className="mt-4 text-stone-500 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 via-neutral-50 to-zinc-50">
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-red-200 max-w-md">
          <h2 className="text-2xl font-light tracking-tight text-red-600 mb-4">Authentication Error</h2>
          <p className="text-stone-600 font-light">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <>{children}</>;
}

function AuthScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sentEmail, setSentEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      await db.auth.sendMagicCode({ email });
      setSentEmail(true);
    } catch (error) {
      console.error('Error sending magic code:', error);
      alert('Failed to send magic code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    
    setIsSubmitting(true);
    try {
      await db.auth.signInWithMagicCode({ email, code });
    } catch (error) {
      console.error('Error verifying code:', error);
      alert('Invalid code. Please check and try again.');
      setIsSubmitting(false);
    }
  };

  if (sentEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-stone-50 via-neutral-50 to-zinc-50">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-neutral-200/50 w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-neutral-50 to-stone-50 p-8 text-center border-b border-neutral-200/50">
            <div className="w-16 h-16 bg-gradient-to-br from-stone-200 to-neutral-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-light tracking-tight text-stone-700 mb-2">Check Your Email</h2>
            <p className="text-stone-500 text-sm font-light">{email}</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-light text-stone-600 mb-3">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="000000"
                  className="w-full px-4 py-4 text-center text-2xl font-mono tracking-widest rounded-xl border border-neutral-200 focus:border-neutral-300 focus:ring-1 focus:ring-neutral-300 outline-none transition-all bg-white/50 text-stone-700"
                  required
                  autoFocus
                  maxLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-stone-800 text-white py-4 rounded-xl font-light hover:bg-stone-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setSentEmail(false);
                  setCode('');
                }}
                className="text-sm text-stone-500 hover:text-stone-700 transition-colors font-light"
              >
                ← Use a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-stone-50 via-neutral-50 to-zinc-50">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-neutral-200/50 w-full max-w-md overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-neutral-50 to-stone-50 p-12 text-center border-b border-neutral-200/50">
          <div className="w-20 h-20 bg-gradient-to-br from-stone-200 to-neutral-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-light tracking-tight text-stone-700 mb-2">
            Annual Calendar
          </h1>
          <p className="text-stone-500 font-light">Plan your year beautifully</p>
        </div>

        {/* Form Section */}
        <div className="p-10">
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-light text-stone-600 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-4 rounded-xl border border-neutral-200 focus:border-neutral-300 focus:ring-1 focus:ring-neutral-300 outline-none transition-all text-stone-700 placeholder-stone-400 bg-white/50 font-light"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-stone-800 text-white py-4 rounded-xl font-light hover:bg-stone-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Magic Code'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-200/50 text-center space-y-2">
            <p className="text-sm text-stone-500 font-light">
              We&apos;ll send you a verification code
            </p>
            <p className="text-xs text-stone-400 font-light">
              No password required • Free to use
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
