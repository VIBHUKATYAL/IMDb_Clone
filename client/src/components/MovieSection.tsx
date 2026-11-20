import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../types/index.js';
import { MovieCard } from './MovieCard.js';

interface MovieSectionProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  showPersonalMatch?: boolean;
}

export const MovieSection: React.FC<MovieSectionProps> = ({
  title,
  subtitle,
  movies,
  showPersonalMatch = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!movies || movies.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="space-y-4">
      {/* Header with IMDb Vertical Accent Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 bg-[#F5C518] rounded-full" />
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{title}</span>
            </h3>
            {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Carousel Arrow Navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] border border-[#2E2E2E] text-neutral-300 hover:text-white transition"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] border border-[#2E2E2E] text-neutral-300 hover:text-white transition"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-none py-2 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map((movie) => (
          <div key={movie.id} className="w-[180px] sm:w-[200px] shrink-0">
            <MovieCard movie={movie} showPersonalMatch={showPersonalMatch} />
          </div>
        ))}
      </div>
    </section>
  );
};
