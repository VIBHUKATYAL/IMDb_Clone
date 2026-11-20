import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Bookmark, Sparkles, User as UserIcon, LogOut, ChevronDown, Menu, X, Search, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { movieService } from '../services/movieService.js';
import { Movie } from '../types/index.js';

interface NavbarProps {
  onOpenAIModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAIModal }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live search bar state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await movieService.search(searchQuery.trim(), undefined, undefined, 5);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to dismiss search suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="border-b border-[#2E2E2E] bg-[#121212]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 md:gap-6">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-[#F5C518] text-black font-black px-2.5 py-1 rounded text-xl flex items-center gap-1.5 shadow tracking-tight">
              <Film className="w-5 h-5 text-black" />
              <span>CinePulse</span>
            </div>
          </Link>

          {/* Search Bar with live autocomplete */}
          <div ref={searchRef} className="relative flex-1 max-w-xl hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies, actors, directors, genres..."
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] focus:border-[#F5C518] rounded-full py-2 pl-10 pr-4 text-xs text-white placeholder-neutral-400 focus:outline-none transition"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-[#F5C518] border-t-transparent rounded-full animate-spin" />
              )}
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 py-1 border-b border-neutral-800">
                  Search Suggestions
                </div>
                {suggestions.map((m) => (
                  <Link
                    key={m.id}
                    to={`/movie/${m.id}`}
                    onClick={() => {
                      setShowSuggestions(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-[#252525] transition"
                  >
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      className="w-8 h-12 object-cover rounded bg-neutral-900 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-white truncate">{m.title}</div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                        <span className="flex items-center gap-0.5 text-white font-semibold">
                          <Star className="w-3 h-3 fill-[#F5C518] text-[#F5C518]" />
                          {m.imdbRating.toFixed(1)}
                        </span>
                        <span>•</span>
                        <span>{new Date(m.releaseDate).getFullYear()}</span>
                        <span>•</span>
                        <span className="truncate">{m.genres?.[0]?.genre.name}</span>
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="pt-1.5 px-3 border-t border-neutral-800 text-center">
                  <button
                    onClick={handleSearchSubmit}
                    className="text-[11px] text-[#F5C518] hover:underline font-semibold"
                  >
                    View all results for "{searchQuery}"
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-neutral-300">
            <Link to="/movies" className="hover:text-[#F5C518] transition">
              Explore Movies
            </Link>
            <Link to="/watchlist" className="flex items-center gap-1.5 hover:text-[#F5C518] transition">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Watchlist</span>
              {user?.stats?.watchlistCount !== undefined && user.stats.watchlistCount > 0 && (
                <span className="bg-[#F5C518] text-black text-[10px] font-black px-1.5 rounded-full">
                  {user.stats.watchlistCount}
                </span>
              )}
            </Link>
          </nav>

          {/* AI Mood Mode Button & User Auth */}
          <div className="flex items-center gap-2.5">
            {onOpenAIModal && (
              <button
                onClick={onOpenAIModal}
                className="flex items-center gap-1.5 text-xs font-bold text-black bg-[#F5C518] hover:bg-amber-400 px-3 py-1.5 rounded-lg transition shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Mood Mode</span>
                <span className="sm:hidden">AI</span>
              </button>
            )}

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#2E2E2E] py-1.5 px-2.5 rounded-full transition"
                >
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=252525&color=F5C518`}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-[#F5C518]"
                  />
                  <span className="text-xs font-medium text-white max-w-[100px] truncate hidden md:inline">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-52 bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl shadow-2xl py-2 z-50 text-xs"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-[#2E2E2E]">
                      <p className="font-semibold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-neutral-300 hover:bg-[#252525] hover:text-[#F5C518] transition"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>Your Profile & Stats</span>
                    </Link>

                    <Link
                      to="/watchlist"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2 text-neutral-300 hover:bg-[#252525] hover:text-[#F5C518] transition"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Your Watchlist</span>
                      {user.stats?.watchlistCount !== undefined && (
                        <span className="ml-auto text-[10px] text-neutral-500">{user.stats.watchlistCount}</span>
                      )}
                    </Link>

                    <div className="border-t border-[#2E2E2E] my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-3.5 py-2 text-rose-400 hover:bg-[#252525] transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-neutral-200 hover:text-[#F5C518] px-2.5 py-1.5 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold bg-[#1A1A1A] hover:bg-[#252525] border border-neutral-700 text-white px-3 py-1.5 rounded-lg transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-neutral-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="sm:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies..."
              className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-full py-1.5 pl-9 pr-3 text-xs text-white placeholder-neutral-400 focus:outline-none"
            />
          </form>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#2E2E2E] bg-[#1A1A1A] px-4 py-3 space-y-2 text-xs">
          <Link
            to="/movies"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-neutral-200 hover:text-[#F5C518]"
          >
            Explore Movies
          </Link>
          <Link
            to="/watchlist"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-neutral-200 hover:text-[#F5C518]"
          >
            Watchlist
          </Link>
          {isAuthenticated && (
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-neutral-200 hover:text-[#F5C518]"
            >
              Profile
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
