import { Router } from 'express';
import {
  getFeaturedMovies,
  getTrendingMovies,
  getTopRatedMovies,
  getPopularMovies,
  getMoviesByGenre,
  searchMovies,
  listMovies,
  getMovieById,
  getMovieMatch,
  getPersonalizedRecommendations,
} from '../controllers/movie.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', listMovies);
router.get('/featured', getFeaturedMovies);
router.get('/trending', getTrendingMovies);
router.get('/top-rated', getTopRatedMovies);
router.get('/popular', getPopularMovies);
router.get('/by-genre', getMoviesByGenre);
router.get('/search', searchMovies);
router.get('/recommendations', optionalAuth, getPersonalizedRecommendations);
router.get('/:id', optionalAuth, getMovieById);
router.get('/:id/match', requireAuth, getMovieMatch);

export default router;
