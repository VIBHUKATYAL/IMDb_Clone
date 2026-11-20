import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      if (err?.response?.data?.error) {
        setError(err.response.data.error);
      } else if (!err.response) {
        setError('Cannot connect to backend server at http://localhost:5000. Make sure the server is running.');
      } else {
        setError('Failed to sign in. Please verify your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: 'demo' | 'critic') => {
    if (role === 'demo') {
      setEmail('demo@example.com');
      setPassword('password123');
    } else {
      setEmail('critic@example.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-8 shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 bg-[#F5C518] text-black font-black px-3 py-1 rounded text-xl shadow mb-3">
              <Film className="w-5 h-5 text-black" />
              <span>CinePulse</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Sign In to Your Account</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Access your personalized taste profile, watchlist & ratings
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-[#121212] border border-[#2E2E2E] rounded-lg py-2.5 pl-10 pr-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#F5C518] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#121212] border border-[#2E2E2E] rounded-lg py-2.5 pl-10 pr-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#F5C518] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F5C518] hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-2.5 px-4 rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-sm mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-[#2E2E2E]">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 text-center">
              Quick Test Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('demo')}
                className="bg-[#121212] hover:bg-[#252525] border border-neutral-700 rounded-lg p-2 text-left text-xs transition"
              >
                <div className="font-semibold text-[#F5C518]">Demo User</div>
                <div className="text-[10px] text-neutral-400">demo@example.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('critic')}
                className="bg-[#121212] hover:bg-[#252525] border border-neutral-700 rounded-lg p-2 text-left text-xs transition"
              >
                <div className="font-semibold text-blue-400">Critic User</div>
                <div className="text-[10px] text-neutral-400">critic@example.com</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-neutral-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#F5C518] hover:underline font-semibold">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
