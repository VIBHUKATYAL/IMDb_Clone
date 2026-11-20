import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Star, Trash2, Clock, Film } from 'lucide-react';
import { movieService } from '../services/movieService.js';
import { Movie } from '../types/index.js';
import { useWatchlist } from '../context/WatchlistContext.js';

export const WatchlistPage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const { toggleWatchlist } = useWatchlist();

  const loadWatchlist = async () => {
    setLoading(true);
    try {
      const items = await movieService.getWatchlist();
      setMovies(items);
    } catch {
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const handleRemove = async (movieId: string, title: string) => {
    await toggleWatchlist(movieId, title);
    setMovies((prev) => prev.filter((m) => m.id !== movieId));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-[#F5C518]" />
            <span>Your Watchlist</span>
            <span className="text-xs bg-[#F5C518] text-black font-black px-2 py-0.5 rounded-full ml-1">
              {movies.length}
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Persisted in PostgreSQL • Track what you want to watch next
          </p>
        </div>

        <Link
          to="/movies"
          className="text-xs bg-[#1A1A1A] hover:bg-[#252525] border border-neutral-700 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          Add More Movies
        </Link>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <div className="w-8 h-8 border-2 border-[#F5C518] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {movies.map((m) => {
            const releaseYear = m.releaseDate ? new Date(m.releaseDate).getFullYear() : '';
            return (
              <div
                key={m.id}
                className="bg-[#1A1A1A] border border-[#2E2E2E] hover:border-neutral-700 rounded-xl p-3 flex gap-4 transition group"
              >
                <Link to={`/movie/${m.id}`} className="shrink-0 aspect-[2/3] w-20 rounded-lg overflow-hidden bg-neutral-900">
                  <img src={m.posterUrl} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                </Link>

                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center justify-between gap-1 text-xs">
                      <div className="flex items-center gap-1 font-bold text-white">
                        <Star className="w-3.5 h-3.5 fill-[#F5C518] text-[#F5C518]" />
                        <span>{m.imdbRating.toFixed(1)}</span>
                      </div>
                      <span className="text-neutral-400 text-[11px]">{releaseYear}</span>
                    </div>

                    <Link
                      to={`/movie/${m.id}`}
                      className="font-bold text-sm text-white hover:text-[#F5C518] truncate block mt-1 transition"
                      title={m.title}
                    >
                      {m.title}
                    </Link>

                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {m.runtime}m
                      </span>
                      <span>•</span>
                      <span className="truncate">{m.genres?.[0]?.genre.name}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-neutral-800">
                    <Link
                      to={`/movie/${m.id}`}
                      className="text-xs text-[#F5C518] hover:underline font-semibold"
                    >
                      View Details
                    </Link>

                    <button
                      onClick={() => handleRemove(m.id, m.title)}
                      className="text-neutral-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-neutral-800 transition"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center space-y-3 bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl p-8">
          <div className="p-4 bg-neutral-800/60 rounded-full inline-block text-neutral-400 mb-1">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Your Watchlist is Empty</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Explore our curated catalog of 176+ titles and click "+ List" on any movie card to add it here.
          </p>
          <div className="pt-2">
            <Link
              to="/movies"
              className="inline-block bg-[#F5C518] text-black font-extrabold text-xs px-5 py-2.5 rounded-lg transition shadow"
            >
              Explore Movies
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
