import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, MessageSquare, Award } from 'lucide-react';
import { movieService } from '../services/movieService.js';
import { useAuth } from '../context/AuthContext.js';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const [prof, st] = await Promise.all([
          movieService.getProfile(),
          movieService.getProfileStats(),
        ]);
        setProfileData(prof);
        setStats(st);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F5C518] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* User Header Profile Card */}
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <img
          src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=252525&color=F5C518`}
          alt={user?.name}
          className="w-24 h-24 rounded-full object-cover border-2 border-[#F5C518] shadow-lg shrink-0"
        />

        <div className="text-center sm:text-left space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.name}</h1>
            <span className="bg-[#F5C518] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded">
              Cinephile
            </span>
          </div>
          <p className="text-xs text-neutral-400">{user?.email}</p>
          <p className="text-xs text-neutral-500">
            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026'}
          </p>
        </div>
      </div>

      {/* Statistics Row (Phase 9) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-5 text-center">
          <div className="text-2xl sm:text-3xl font-black text-white">{stats?.moviesRated || 0}</div>
          <div className="text-xs text-neutral-400 flex items-center justify-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 text-[#F5C518]" /> Movies Rated
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-5 text-center">
          <div className="text-2xl sm:text-3xl font-black text-white">{stats?.reviewsWritten || 0}</div>
          <div className="text-xs text-neutral-400 flex items-center justify-center gap-1 mt-1">
            <MessageSquare className="w-3.5 h-3.5 text-[#F5C518]" /> Reviews Written
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-5 text-center">
          <div className="text-2xl sm:text-3xl font-black text-white">{stats?.watchlistCount || 0}</div>
          <div className="text-xs text-neutral-400 flex items-center justify-center gap-1 mt-1">
            <Bookmark className="w-3.5 h-3.5 text-[#F5C518]" /> Watchlist
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-5 text-center">
          <div className="text-2xl sm:text-3xl font-black text-[#F5C518]">
            {stats?.averageRatingGiven ? `${stats.averageRatingGiven} / 10` : 'N/A'}
          </div>
          <div className="text-xs text-neutral-400 flex items-center justify-center gap-1 mt-1">
            <Award className="w-3.5 h-3.5 text-[#F5C518]" /> Avg Rating Given
          </div>
        </div>
      </div>

      {/* Favorite Genres */}
      {stats?.favoriteGenres && stats.favoriteGenres.length > 0 && (
        <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-neutral-400">
            Favorite Genres
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.favoriteGenres.map((g: any) => (
              <span
                key={g.name}
                className="bg-[#121212] border border-neutral-700 text-xs font-semibold px-3 py-1.5 rounded-lg text-white flex items-center gap-2"
              >
                <span>{g.name}</span>
                <span className="text-[10px] bg-neutral-800 text-[#F5C518] px-1.5 py-0.5 rounded-full">
                  {g.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Rated Movies List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-1.5 h-5 bg-[#F5C518] rounded-full" />
          <span>Your Rated Movies & Reviews</span>
        </h3>

        {profileData?.reviews && profileData.reviews.length > 0 ? (
          <div className="space-y-3">
            {profileData.reviews.map((r: any) => (
              <div
                key={r.id}
                className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={r.movie?.posterUrl}
                    alt={r.movie?.title}
                    className="w-12 h-16 object-cover rounded shrink-0 bg-neutral-900"
                  />
                  <div className="min-w-0">
                    <Link
                      to={`/movie/${r.movieId}`}
                      className="font-bold text-sm text-white hover:text-[#F5C518] truncate block transition"
                    >
                      {r.movie?.title}
                    </Link>
                    <p className="text-xs text-neutral-300 italic mt-0.5 truncate">
                      "{r.title || 'Rated'}"
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 font-black text-sm bg-black/60 px-2.5 py-1 rounded-lg border border-neutral-800 shrink-0">
                  <Star className="w-4 h-4 fill-[#F5C518] text-[#F5C518]" />
                  <span>{r.rating} / 10</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-neutral-400 bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl">
            You haven't rated any movies yet. Explore titles and share your ratings!
          </div>
        )}
      </div>
    </div>
  );
};
