import React, { useState } from 'react';
import { useAuthActions } from '@convex-dev/auth/react';

export const AuthScreen: React.FC = () => {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('flow', flow);
      await signIn('password', formData);
    } catch (err) {
      setError(flow === 'signIn' ? 'Invalid credentials' : 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setLoading(true);
    try {
      await signIn('anonymous');
    } catch (err) {
      setError('Could not sign in as guest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-float"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 100 + 50}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `radial-gradient(circle, ${
                  ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e', '#a855f7'][i % 5]
                }40 0%, transparent 70%)`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl md:text-8xl mb-4 animate-bounce-slow">⚔️</div>
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-red-500 to-amber-400 tracking-tight">
            PIRATE CLASH
          </h1>
          <p className="text-white/60 mt-2 text-sm md:text-base">One Piece Fighting Arena</p>
        </div>

        {/* Auth Card */}
        <div
          className="backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                placeholder="pirate@grandline.sea"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 md:py-4 bg-gradient-to-r from-amber-500 to-red-500 rounded-xl font-bold text-white text-lg transition-all hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="animate-spin inline-block">⚓</span>
              ) : flow === 'signIn' ? (
                'Set Sail!'
              ) : (
                'Join the Crew!'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setFlow(flow === 'signIn' ? 'signUp' : 'signIn')}
              className="text-amber-400/80 hover:text-amber-400 text-sm transition-colors"
            >
              {flow === 'signIn' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-white/40">or</span>
            </div>
          </div>

          <button
            onClick={handleAnonymous}
            disabled={loading}
            className="mt-4 w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-medium text-white transition-all disabled:opacity-50"
          >
            🏴‍☠️ Continue as Guest Pirate
          </button>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-white/30 text-xs">
          Battle your way to become the Pirate King!
        </p>
      </div>
    </div>
  );
};
