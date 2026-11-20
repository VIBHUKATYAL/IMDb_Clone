import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { Movie } from '../types/index.js';
import { movieService } from '../services/movieService.js';
import { useToast } from '../context/ToastContext.js';

interface OnboardingModalProps {
  sampleMovies: Movie[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  sampleMovies,
  isOpen,
  onClose,
  onComplete,
}) => {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleRate = (movieId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [movieId]: rating }));
  };

  const handleSave = async () => {
    const ratingEntries = Object.entries(ratings).map(([movieId, rating]) => ({
      movieId,
      rating,
    }));

    if (ratingEntries.length === 0) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      await movieService.saveOnboarding(ratingEntries);
      showToast('Taste profile initialized! Personal Match scores updated.', 'success');
      onComplete();
      onClose();
    } catch {
      showToast('Failed to save onboarding ratings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const ratedCount = Object.keys(ratings).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-[#F5C518]/10 rounded-xl text-[#F5C518] mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Build Your Personal Taste Profile
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Rate a few popular movies to unlock accurate Personal Match scores across the platform
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {sampleMovies.slice(0, 8).map((movie) => {
            const currentRating = ratings[movie.id] || 0;
            return (
              <div
                key={movie.id}
                className="flex items-center gap-3 p-2.5 bg-[#121212] border border-[#2E2E2E] rounded-xl"
              >
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-12 h-16 object-cover rounded shrink-0 bg-neutral-900"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">{movie.title}</h4>
                  <p className="text-[10px] text-neutral-400 truncate mb-1.5">
                    {movie.genres?.map((g) => g.genre.name).slice(0, 2).join(', ')}
                  </p>

                  {/* 1-10 Quick Stars */}
                  <div className="flex items-center gap-1">
                    {[2, 4, 6, 8, 10].map((starVal) => (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => handleRate(movie.id, starVal)}
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition ${
                          currentRating >= starVal
                            ? 'bg-[#F5C518] text-black'
                            : 'bg-neutral-800 text-neutral-400 hover:text-white'
                        }`}
                      >
                        {starVal}
                      </button>
                    ))}
                    {currentRating > 0 && (
                      <span className="text-[10px] font-bold text-[#F5C518] ml-1">
                        ★ {currentRating}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-[#2E2E2E] flex items-center justify-between">
          <div className="text-xs text-neutral-400">
            {ratedCount} {ratedCount === 1 ? 'movie' : 'movies'} rated
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-xs text-neutral-400 hover:text-white px-3 py-2 transition"
            >
              Skip for now
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#F5C518] hover:bg-amber-400 text-black font-bold text-xs px-5 py-2.5 rounded-lg transition shadow flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Finish & Calculate Matches'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
