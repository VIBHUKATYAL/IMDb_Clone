import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { movieService, MoviesListResponse } from '../services/movieService.js';
import { MovieCard } from '../components/MovieCard.js';
import { useAuth } from '../context/AuthContext.js';

export const MoviesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [data, setData] = useState<MoviesListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);

  // Filter states
  const search = searchParams.get('search') || '';
  const selectedGenre = searchParams.get('genre') || '';
  const selectedYear = searchParams.get('year') || '';
  const selectedRating = searchParams.get('minRating') || '';
  const sortBy = searchParams.get('sortBy') || 'popularity';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    movieService.getGenres().then(setGenres).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await movieService.list({
          page,
          limit: 18,
          search: search || undefined,
          genre: selectedGenre || undefined,
          year: selectedYear ? parseInt(selectedYear) : undefined,
          minRating: selectedRating ? parseFloat(selectedRating) : undefined,
          sortBy,
        });
        setData(res);
      } catch (err) {
        console.error('Failed to fetch movies', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [search, selectedGenre, selectedYear, selectedRating, sortBy, page]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2E2E2E] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Explore Movies</span>
            {data && (
              <span className="text-xs bg-neutral-800 border border-neutral-700 text-neutral-400 px-2 py-0.5 rounded-full font-mono">
                {data.pagination.total} Titles
              </span>
            )}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Browse our full catalog with advanced filters, ratings, and instant sorting
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
          <span className="text-neutral-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => updateParam('sortBy', e.target.value)}
            className="bg-[#1A1A1A] border border-[#2E2E2E] text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#F5C518]"
          >
            <option value="popularity">Most Popular</option>
            <option value="rating">Top Rated (IMDb)</option>
            <option value="releaseDate">Newest Releases</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-4 flex flex-wrap gap-3 items-center">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            placeholder="Search by title, keywords..."
            className="w-full bg-[#121212] border border-[#2E2E2E] rounded-lg py-1.5 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#F5C518]"
          />
        </div>

        {/* Genre Filter */}
        <div className="w-36">
          <select
            value={selectedGenre}
            onChange={(e) => updateParam('genre', e.target.value)}
            className="w-full bg-[#121212] border border-[#2E2E2E] text-white rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-[#F5C518]"
          >
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div className="w-32">
          <select
            value={selectedYear}
            onChange={(e) => updateParam('year', e.target.value)}
            className="w-full bg-[#121212] border border-[#2E2E2E] text-white rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-[#F5C518]"
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2019">2019</option>
            <option value="2018">2018</option>
            <option value="2014">2014</option>
            <option value="2008">2008</option>
            <option value="1999">1999</option>
            <option value="1994">1994</option>
            <option value="1972">1972</option>
          </select>
        </div>

        {/* Min Rating Filter */}
        <div className="w-36">
          <select
            value={selectedRating}
            onChange={(e) => updateParam('minRating', e.target.value)}
            className="w-full bg-[#121212] border border-[#2E2E2E] text-white rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:border-[#F5C518]"
          >
            <option value="">Any Rating</option>
            <option value="8.5">⭐ 8.5+ Exceptional</option>
            <option value="8.0">⭐ 8.0+ Great</option>
            <option value="7.5">⭐ 7.5+ Good</option>
            <option value="7.0">⭐ 7.0+ Above Average</option>
          </select>
        </div>

        {/* Reset Filters */}
        {(search || selectedGenre || selectedYear || selectedRating || sortBy !== 'popularity') && (
          <button
            onClick={() => setSearchParams(new URLSearchParams())}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 transition"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="py-24 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-[#F5C518] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data?.movies && data.movies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {data.movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} showPersonalMatch={isAuthenticated} />
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-[#2E2E2E]">
              <button
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="p-2 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] border border-[#2E2E2E] text-white disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-semibold text-neutral-300">
                Page <span className="text-[#F5C518]">{page}</span> of{' '}
                <span>{data.pagination.totalPages}</span>
              </span>

              <button
                disabled={page >= data.pagination.totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="p-2 rounded-lg bg-[#1A1A1A] hover:bg-[#252525] border border-[#2E2E2E] text-white disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-20 text-center space-y-3 bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl">
          <div className="p-3 bg-neutral-800 rounded-full inline-block text-neutral-400">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Movies Found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            No titles matched your current combination of filters. Try clearing some filters.
          </p>
          <button
            onClick={() => setSearchParams(new URLSearchParams())}
            className="text-xs bg-[#F5C518] text-black font-bold px-4 py-2 rounded-lg transition"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
