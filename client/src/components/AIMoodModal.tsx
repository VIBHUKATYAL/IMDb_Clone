import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X, Send, Star, Bookmark, Check, ArrowRight } from 'lucide-react';
import { movieService, MoodRecommendationItem } from '../services/movieService.js';
import { useWatchlist } from '../context/WatchlistContext.js';

interface AIMoodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_MOODS = [
  { label: '😄 Funny', value: 'Funny' },
  { label: '😱 Thriller', value: 'Thriller' },
  { label: '❤️ Romantic', value: 'Romantic' },
  { label: '😭 Emotional', value: 'Emotional' },
  { label: '🧠 Mind-Bending', value: 'Thought-provoking' },
  { label: '🔥 Action', value: 'Action' },
  { label: '😌 Relaxing', value: 'Relaxing' },
];

export const AIMoodModal: React.FC<AIMoodModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<MoodRecommendationItem[]>([]);
  const [searchedPrompt, setSearchedPrompt] = useState('');

  const { isWatchlisted, toggleWatchlist } = useWatchlist();

  if (!isOpen) return null;

  const handleSearch = async (moodValue?: string) => {
    const activeMood = moodValue !== undefined ? moodValue : selectedMood;
    if (!prompt.trim() && !activeMood) return;

    setLoading(true);
    setRecommendations([]);
    setSearchedPrompt(prompt.trim() || activeMood || '');

    try {
      const results = await movieService.getMoodRecommendations(prompt.trim(), activeMood || undefined);
      setRecommendations(results);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const handleQuickMoodClick = (val: string) => {
    setSelectedMood(val);
    handleSearch(val);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[#F5C518]/10 rounded-xl text-[#F5C518]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                AI Mood Mode
              </h2>
              <span className="bg-[#F5C518] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded">
                Unique Feature
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
              Tell us how you feel or what you want—grounded strictly in real catalog movies
            </p>
          </div>
        </div>

        {/* Natural Language Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-4"
        >
          <div className="relative">
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. I'm tired after college and want something funny under 2 hours..."
              className="w-full bg-[#121212] border border-[#2E2E2E] focus:border-[#F5C518] rounded-xl p-3.5 pr-12 text-sm text-white placeholder-neutral-500 focus:outline-none resize-none transition"
            />
            <button
              type="submit"
              disabled={loading || (!prompt.trim() && !selectedMood)}
              className="absolute right-3 bottom-3 p-2 bg-[#F5C518] hover:bg-amber-400 disabled:opacity-40 text-black rounded-lg transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Mood Buttons */}
          <div>
            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Or pick a quick mood:
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => handleQuickMoodClick(m.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                    selectedMood === m.value
                      ? 'bg-[#F5C518] text-black border-[#F5C518] font-bold shadow-md shadow-amber-500/20'
                      : 'bg-[#121212] hover:bg-[#252525] border-[#2E2E2E] text-neutral-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#F5C518] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-neutral-400 animate-pulse">
              AI is matching movies against your mood from the database...
            </p>
          </div>
        )}

        {/* Recommendations Result */}
        {!loading && recommendations.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2E2E2E] pb-2 text-xs">
              <span className="font-semibold text-white">
                Recommendations for: <span className="text-[#F5C518]">"{searchedPrompt}"</span>
              </span>
              <span className="text-neutral-400">{recommendations.length} movies matched</span>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {recommendations.map(({ movie, matchScore, reason }) => {
                const watchlisted = isWatchlisted(movie.id);
                return (
                  <div
                    key={movie.id}
                    className="flex items-center justify-between gap-4 p-3 bg-[#121212] border border-[#2E2E2E] hover:border-neutral-700 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        className="w-14 h-20 object-cover rounded-lg shrink-0 bg-neutral-900 border border-neutral-800"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/movie/${movie.id}`}
                            onClick={onClose}
                            className="font-bold text-sm text-white hover:text-[#F5C518] truncate transition"
                          >
                            {movie.title}
                          </Link>
                          <span className="shrink-0 bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-black px-1.5 py-0.5 rounded">
                            {matchScore}% Match
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                          <span className="flex items-center gap-1 font-bold text-white">
                            <Star className="w-3 h-3 fill-[#F5C518] text-[#F5C518]" />
                            {movie.imdbRating.toFixed(1)}
                          </span>
                          <span>•</span>
                          <span>{movie.runtime} min</span>
                          <span>•</span>
                          <span className="truncate">
                            {movie.genres?.map((g: any) => g.genre.name).slice(0, 2).join(', ')}
                          </span>
                        </div>

                        <p className="text-xs text-neutral-300 mt-1.5 italic line-clamp-1">
                          "{reason}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleWatchlist(movie.id, movie.title)}
                        className={`p-2 rounded-lg border transition ${
                          watchlisted
                            ? 'bg-[#F5C518] text-black border-[#F5C518]'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                        }`}
                        title={watchlisted ? 'In Watchlist' : 'Add to Watchlist'}
                      >
                        {watchlisted ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>

                      <Link
                        to={`/movie/${movie.id}`}
                        onClick={onClose}
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
                        title="View details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
