import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Play,
  Clock,
  Globe,
  Sparkles,
  ThumbsUp,
  Check,
  Plus
} from 'lucide-react';
import { movieService, MovieDetailResponse } from '../services/movieService.js';
import { useAuth } from '../context/AuthContext.js';
import { useWatchlist } from '../context/WatchlistContext.js';
import { useToast } from '../context/ToastContext.js';
import { ReviewModal } from '../components/ReviewModal.js';
import { MovieCard } from '../components/MovieCard.js';

export const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<MovieDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);

  const { isAuthenticated } = useAuth();
  const { isWatchlisted, toggleWatchlist } = useWatchlist();
  const { showToast } = useToast();

  const loadMovie = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await movieService.getById(id);
      setData(res);
    } catch {
      showToast('Failed to load movie details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovie();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#F5C518] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !data.movie) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Movie Not Found</h2>
        <p className="text-sm text-neutral-400">The requested movie could not be located in our catalog.</p>
        <Link to="/movies" className="inline-block bg-[#F5C518] text-black font-bold text-xs px-4 py-2 rounded-lg">
          Browse Catalog
        </Link>
      </div>
    );
  }

  const { movie, ratingDistribution, similarMovies, personalMatch } = data;
  const watchlisted = isWatchlisted(movie.id);
  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '';
  const totalReviews = movie.reviews?.length || 0;

  const handleLikeReview = async (reviewId: string) => {
    if (!isAuthenticated) {
      showToast('Please sign in to like reviews', 'info');
      return;
    }
    try {
      const res = await movieService.likeReview(reviewId);
      setData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          movie: {
            ...prev.movie,
            reviews: prev.movie.reviews?.map((r) =>
              r.id === reviewId ? { ...r, likes: res.likes } : r
            ),
          },
        };
      });
      showToast(res.liked ? 'Helpful vote counted!' : 'Vote removed', 'info');
    } catch {
      showToast('Failed to vote on review', 'error');
    }
  };

  const getEmbedUrl = (url?: string) => {
    if (!url) return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    const match = url.match(/(?:watch\?v=|youtu\.be\/)([\w-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
  };

  return (
    <div className="min-h-screen pb-16 space-y-10">
      {/* Cinematic Hero Backdrop Banner */}
      <div className="relative w-full aspect-[21/9] min-h-[360px] max-h-[520px] bg-neutral-950 overflow-hidden">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-transparent to-black/60" />
      </div>

      {/* Main Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-36 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left Column: Poster & Quick Actions */}
          <div className="md:col-span-1 space-y-4">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-[#2E2E2E] shadow-2xl bg-neutral-900 relative group">
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
              <button
                onClick={() => setTrailerOpen(true)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white font-bold text-xs"
              >
                <div className="w-12 h-12 rounded-full bg-[#F5C518] text-black flex items-center justify-center shadow-lg">
                  <Play className="w-5 h-5 fill-black ml-0.5" />
                </div>
              </button>
            </div>

            {/* Watchlist & Rate Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => toggleWatchlist(movie.id, movie.title)}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow ${
                  watchlisted
                    ? 'bg-[#F5C518] text-black shadow-amber-500/20'
                    : 'bg-[#1A1A1A] hover:bg-[#252525] border border-neutral-700 text-white'
                }`}
              >
                {watchlisted ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>In Your Watchlist</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add to Watchlist</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    showToast('Please sign in to rate and review', 'info');
                  } else {
                    setReviewModalOpen(true);
                  }
                }}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#1A1A1A] hover:bg-[#252525] border border-neutral-700 text-white flex items-center justify-center gap-2 transition"
              >
                <Star className="w-4 h-4 text-[#F5C518]" />
                <span>Rate & Review</span>
              </button>
            </div>
          </div>

          {/* Right Column: Title, Metadata, Personal Match, Synopsis */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                <span className="text-neutral-400 font-semibold">{releaseYear}</span>
                <span className="text-neutral-600">•</span>
                <span className="text-neutral-400 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {movie.runtime} min
                </span>
                <span className="text-neutral-600">•</span>
                <span className="text-neutral-400 font-semibold flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> {movie.language}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {movie.title}
              </h1>

              {/* Genres */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {movie.genres?.map((g) => (
                  <span
                    key={g.genre.id}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1A1A1A] border border-neutral-700 text-neutral-300"
                  >
                    {g.genre.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Ratings & Personal Match Score Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Global IMDb Community Rating */}
              <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    IMDb Community Rating
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-7 h-7 fill-[#F5C518] text-[#F5C518]" />
                    <span className="text-2xl font-black text-white">{movie.imdbRating.toFixed(1)}</span>
                    <span className="text-xs text-neutral-400">/ 10</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    {movie.voteCount.toLocaleString()} verified votes
                  </div>
                </div>
              </div>

              {/* Personal Match Score (Phase 10 ⭐) */}
              <div className="bg-gradient-to-br from-emerald-950/40 via-[#1A1A1A] to-[#1A1A1A] border border-emerald-500/40 rounded-xl p-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Personal Match Score</span>
                  </div>
                  {personalMatch && (
                    <span className="text-lg font-black text-emerald-400">
                      {personalMatch.matchScore}% Match
                    </span>
                  )}
                </div>

                {personalMatch ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-[11px] font-semibold text-neutral-300">Why this matches you:</p>
                    <ul className="text-xs text-neutral-300 space-y-0.5 list-disc list-inside">
                      {personalMatch.reasons.map((reason, idx) => (
                        <li key={idx} className="line-clamp-1">{reason}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-neutral-400">
                    <Link to="/login" className="text-[#F5C518] hover:underline font-bold">
                      Sign in
                    </Link>{' '}
                    to generate your tailored Personal Match Score.
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-neutral-400">
                Synopsis
              </h3>
              <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-normal">
                {movie.description}
              </p>
            </div>

            {/* Directors */}
            {movie.directors && movie.directors.length > 0 && (
              <div className="flex items-center gap-2 text-xs border-t border-[#262626] pt-3">
                <span className="text-neutral-400 font-semibold">Directed by:</span>
                <span className="text-white font-bold">
                  {movie.directors.map((d) => d.director.name).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Cast Members Carousel */}
        {movie.cast && movie.cast.length > 0 && (
          <div className="mt-12 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <div className="w-1.5 h-5 bg-[#F5C518] rounded-full" />
              <span>Top Cast</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {movie.cast.map(({ castMember, character }) => (
                <div
                  key={castMember.id}
                  className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-3 flex items-center gap-3"
                >
                  <img
                    src={castMember.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(castMember.name)}&background=252525&color=F5C518`}
                    alt={castMember.name}
                    className="w-12 h-12 rounded-full object-cover shrink-0 border border-neutral-700"
                  />
                  <div className="min-w-0">
                    <h5 className="font-bold text-xs text-white truncate">{castMember.name}</h5>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">{character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ratings Breakdown & User Reviews */}
        <div className="mt-14 space-y-6">
          <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-3">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <div className="w-1.5 h-5 bg-[#F5C518] rounded-full" />
              <span>Audience Reviews & Breakdown</span>
            </h3>

            <button
              onClick={() => {
                if (!isAuthenticated) showToast('Please sign in to write a review', 'info');
                else setReviewModalOpen(true);
              }}
              className="text-xs font-bold bg-[#F5C518] hover:bg-amber-400 text-black px-4 py-2 rounded-lg transition"
            >
              + Write a Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Rating Distribution Bar Chart */}
            <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-5 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Rating Distribution (10 Stars)
              </h4>
              {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((star) => {
                const count = ratingDistribution[star] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="w-5 text-neutral-400 font-mono text-right">{star}</span>
                    <Star className="w-3 h-3 text-[#F5C518] fill-[#F5C518]" />
                    <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#F5C518] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-6 text-[10px] text-neutral-400 text-right">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Reviews List */}
            <div className="md:col-span-2 space-y-4">
              {movie.reviews && movie.reviews.length > 0 ? (
                movie.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.user?.name || 'User')}&background=252525&color=F5C518`}
                          alt={rev.user?.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-bold text-xs text-white">{rev.user?.name || 'Anonymous'}</div>
                          <div className="text-[10px] text-neutral-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 font-bold text-xs bg-black/50 px-2 py-1 rounded border border-neutral-700">
                        <Star className="w-3 h-3 fill-[#F5C518] text-[#F5C518]" />
                        <span>{rev.rating} / 10</span>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-bold text-sm text-white mb-1">{rev.title}</h5>
                      <p className="text-xs text-neutral-300 leading-relaxed">{rev.content}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-800">
                      <button
                        onClick={() => handleLikeReview(rev.id)}
                        className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Helpful ({rev.likes})</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-neutral-400 bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl">
                  No audience reviews yet. Be the first to write a review!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Movies Carousel */}
        {similarMovies && similarMovies.length > 0 && (
          <div className="mt-14">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="w-1.5 h-5 bg-[#F5C518] rounded-full" />
              <span>More Like This</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {similarMovies.map((sim) => (
                <MovieCard key={sim.id} movie={sim} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      {trailerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setTrailerOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={getEmbedUrl(movie.trailerUrl)}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
            <button
              onClick={() => setTrailerOpen(false)}
              className="absolute top-3 right-3 bg-black/80 text-white rounded-full p-2 hover:bg-[#F5C518] hover:text-black transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      <ReviewModal
        movieId={movie.id}
        movieTitle={movie.title}
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onReviewSubmitted={loadMovie}
      />
    </div>
  );
};
