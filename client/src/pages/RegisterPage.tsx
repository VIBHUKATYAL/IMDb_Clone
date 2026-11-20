import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-8 shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 bg-[#F5C518] text-black font-black px-3 py-1 rounded text-xl shadow mb-3">
              <Film className="w-5 h-5 text-black" />
              <span>CinePulse</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Your Account</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Join CinePulse to rate movies, build watchlists, and get AI recommendations
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
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Christopher Nolan"
                  className="w-full bg-[#121212] border border-[#2E2E2E] rounded-lg py-2.5 pl-10 pr-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#F5C518] transition"
                />
              </div>
            </div>

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
                  placeholder="At least 6 characters"
                  className="w-full bg-[#121212] border border-[#2E2E2E] rounded-lg py-2.5 pl-10 pr-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#F5C518] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-neutral-400">
            Already have an account?{' '}
            <Link to="/login" className="text-[#F5C518] hover:underline font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
