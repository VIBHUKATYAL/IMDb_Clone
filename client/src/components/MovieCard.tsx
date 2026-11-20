import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Bookmark, Play, Plus, Check } from 'lucide-react';
import { Movie } from '../types/index.js';
import { useWatchlist } from '../context/WatchlistContext.js';

interface MovieCardProps {
  movie: Movie;
  showPersonalMatch?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, showPersonalMatch = false }) => {
  const { isWatchlisted, toggleWatchlist } = useWatchlist();
  const watchlisted = isWatchlisted(movie.id);

  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : '';
  const primaryGenre = movie.genres?.[0]?.genre.name || '';

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(movie.id, movie.title);
  };

  return (
    <div className="group relative bg-[#1A1A1A] border border-[#2E2E2E] hover:border-neutral-600 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/60">
      <Link to={`/movie/${movie.id}`} className="block relative aspect-[2/3] overflow-hidden bg-neutral-900">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-80 group-hover:opacity-60 transition" />

        {/* Watchlist Ribbon / Toggle Button */}
        <button
          onClick={handleWatchlistClick}
          aria-label={watchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
          className={`absolute top-0 left-0 p-2.5 rounded-br-xl transition flex items-center justify-center ${
            watchlisted
              ? 'bg-[#F5C518] text-black shadow-lg shadow-amber-500/30'
              : 'bg-black/70 hover:bg-[#F5C518] text-white hover:text-black backdrop-blur-sm'
          }`}
        >
          {watchlisted ? (
            <Check className="w-4 h-4 stroke-[3]" />
          ) : (
            <Plus className="w-4 h-4 stroke-[3]" />
          )}
        </button>

        {/* Personal Match Badge (if provided) */}
        {showPersonalMatch && movie.matchScore !== undefined && (
          <div className="absolute top-2.5 right-2.5 bg-emerald-950/90 border border-emerald-500/60 text-emerald-400 text-[11px] font-black px-2 py-0.5 rounded-full shadow-md backdrop-blur">
            {movie.matchScore}% Match
          </div>
        )}

        {/* Quick Play Hover Indicator */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
          <div className="w-11 h-11 rounded-full bg-[#F5C518] text-black flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition">
            <Play className="w-5 h-5 fill-black ml-0.5" />
          </div>
        </div>
      </Link>

      {/* Info Section */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          {/* Rating & Year */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1 font-bold text-neutral-200">
              <Star className="w-3.5 h-3.5 fill-[#F5C518] text-[#F5C518]" />
              <span>{movie.imdbRating > 0 ? movie.imdbRating.toFixed(1) : 'NR'}</span>
            </div>
            <span className="text-neutral-400 text-[11px] font-medium">{releaseYear}</span>
          </div>

          {/* Title */}
          <Link
            to={`/movie/${movie.id}`}
            className="font-bold text-sm text-white hover:text-[#F5C518] line-clamp-1 transition tracking-tight"
            title={movie.title}
          >
            {movie.title}
          </Link>
        </div>

        {/* Genre & Watchlist Quick Action */}
        <div className="mt-3 pt-2.5 border-t border-[#262626] flex items-center justify-between text-xs">
          <span className="text-[11px] font-medium text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded">
            {primaryGenre || 'Feature'}
          </span>

          <button
            onClick={handleWatchlistClick}
            className={`text-xs font-semibold flex items-center gap-1 transition ${
              watchlisted
                ? 'text-[#F5C518] hover:text-amber-400'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${watchlisted ? 'fill-[#F5C518]' : ''}`} />
            <span>{watchlisted ? 'Watchlist' : '+ List'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
