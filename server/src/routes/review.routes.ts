import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getMovieReviews,
  createOrUpdateReview,
  deleteReview,
  toggleReviewLike,
} from '../controllers/review.controller.js';

const router = Router();

// Routes for reviews mounted at /api/reviews
router.delete('/:id', requireAuth, deleteReview);
router.post('/:id/like', requireAuth, toggleReviewLike);

// Movie-specific review routes (mounted under /api/movies/:id/reviews)
export const movieReviewRouter = Router({ mergeParams: true });
movieReviewRouter.get('/', getMovieReviews);
movieReviewRouter.post('/', requireAuth, createOrUpdateReview);

export default router;
