import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, Bookmark, ChevronLeft, ChevronRight, Sparkles, Check } from 'lucide-react';
import { Movie } from '../types/index.js';
import { useWatchlist } from '../context/WatchlistContext.js';

interface HeroCarouselProps {
  movies: Movie[];
  onOpenAIModal?: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ movies, onOpenAIModal }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trailerModalOpen, setTrailerModalOpen] = useState(false);
  const { isWatchlisted, toggleWatchlist } = useWatchlist();

  // Auto cycle banner every 6 seconds
  useEffect(() => {
    if (movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [movies.length]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex];
  const watchlisted = isWatchlisted(currentMovie.id);
  const releaseYear = currentMovie.releaseDate
    ? new Date(currentMovie.releaseDate).getFullYear()
    : '';

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  // Convert youtube watch url to embed if applicable
  const getEmbedUrl = (url?: string) => {
    if (!url) return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    const match = url.match(/(?:watch\?v=|youtu\.be\/)([\w-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
  };

  return (
    <div className="relative w-full aspect-[21/9] min-h-[380px] max-h-[580px] rounded-2xl overflow-hidden border border-[#2E2E2E] shadow-2xl bg-neutral-950 group">
      {/* Background Backdrop Artwork */}
      <div className="absolute inset-0">
        <img
          src={currentMovie.backdropUrl || currentMovie.posterUrl}
          alt={currentMovie.title}
          className="w-full h-full object-cover transition-opacity duration-700 ease-in-out"
        />
        {/* Dark Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/40" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-10 md:pb-14">
        <div className="max-w-xl space-y-3">
          {/* Badge & Rating Bar */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="bg-[#F5C518] text-black font-black px-2 py-0.5 rounded text-[11px] tracking-wider uppercase">
              Featured on CinePulse
            </span>

            <div className="flex items-center gap-1 font-bold text-white bg-black/60 backdrop-blur px-2 py-0.5 rounded border border-neutral-700">
              <Star className="w-3.5 h-3.5 fill-[#F5C518] text-[#F5C518]" />
              <span>{currentMovie.imdbRating.toFixed(1)}</span>
            </div>

            <span className="text-neutral-300 font-medium">{releaseYear}</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-300 font-medium">{currentMovie.runtime} min</span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-300 font-medium">
              {currentMovie.genres?.map((g) => g.genre.name).slice(0, 2).join(', ')}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            {currentMovie.title}
          </h2>

          {/* Description */}
          <p className="text-sm text-neutral-300 line-clamp-2 md:line-clamp-3 leading-relaxed drop-shadow">
            {currentMovie.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => setTrailerModalOpen(true)}
              className="bg-[#F5C518] hover:bg-amber-400 text-black font-extrabold text-xs md:text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition shadow-lg shadow-amber-500/20"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Watch Trailer</span>
            </button>

            <button
              onClick={() => toggleWatchlist(currentMovie.id, currentMovie.title)}
              className={`font-semibold text-xs md:text-sm px-4 py-2.5 rounded-lg border flex items-center gap-2 transition backdrop-blur-md ${
                watchlisted
                  ? 'bg-[#F5C518]/20 border-[#F5C518] text-[#F5C518]'
                  : 'bg-black/60 hover:bg-white/10 border-neutral-700 text-white'
              }`}
            >
              {watchlisted ? (
                <>
                  <Check className="w-4 h-4 text-[#F5C518]" />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span>Add to Watchlist</span>
                </>
              )}
            </button>

            <Link
              to={`/movie/${currentMovie.id}`}
              className="bg-neutral-800/80 hover:bg-neutral-700/80 border border-neutral-700 text-neutral-200 text-xs md:text-sm px-4 py-2.5 rounded-lg font-medium transition"
            >
              Details
            </Link>

            {onOpenAIModal && (
              <button
                onClick={onOpenAIModal}
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#F5C518] hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3.5 py-2.5 rounded-lg transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Mood Finder</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Prev / Next Nav Controls */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-20 border border-neutral-700 backdrop-blur"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-20 border border-neutral-700 backdrop-blur"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5">
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === currentIndex ? 'w-6 bg-[#F5C518]' : 'w-2 bg-neutral-600 hover:bg-neutral-400'
            }`}
          />
        ))}
      </div>

      {/* Trailer Modal */}
      {trailerModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setTrailerModalOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={getEmbedUrl(currentMovie.trailerUrl)}
              title={`${currentMovie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
            <button
              onClick={() => setTrailerModalOpen(false)}
              className="absolute top-3 right-3 bg-black/80 text-white rounded-full p-2 hover:bg-[#F5C518] hover:text-black transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
