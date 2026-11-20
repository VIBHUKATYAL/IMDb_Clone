import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { movieService } from '../services/movieService.js';
import { useToast } from '../context/ToastContext.js';

interface ReviewModalProps {
  movieId: string;
  movieTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  movieId,
  movieTitle,
  isOpen,
  onClose,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState<number>(8);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await movieService.addReview(movieId, { rating, title, content });
      showToast('Your rating and review were saved!', 'success');
      onReviewSubmitted();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1A1A1A] border border-[#2E2E2E] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-1">Rate & Review</h3>
        <p className="text-xs text-[#F5C518] font-medium mb-5">{movieTitle}</p>

        {error && (
          <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1 - 10 Star Rating Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">
              Your Rating: <span className="text-[#F5C518] font-bold text-sm">{hoverRating || rating} / 10</span>
            </label>
            <div className="flex items-center gap-1.5 p-3 bg-[#121212] rounded-xl border border-[#2E2E2E] justify-between">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-125 transition transform"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= (hoverRating || rating)
                        ? 'fill-[#F5C518] text-[#F5C518]'
                        : 'text-neutral-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Headline
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Masterpiece of modern storytelling"
              className="w-full bg-[#121212] border border-[#2E2E2E] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-[#F5C518] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Written Review
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write what made this movie memorable, the acting, direction, or cinematography..."
              className="w-full bg-[#121212] border border-[#2E2E2E] rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#F5C518] resize-none transition"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-neutral-300 hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-[#F5C518] hover:bg-amber-400 text-black transition shadow"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
