import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getWatchlist,
  getWatchlistIds,
  addToWatchlist,
  removeFromWatchlist,
} from '../controllers/watchlist.controller.js';

const router = Router();

// All watchlist routes require authentication
router.use(requireAuth);

router.get('/', getWatchlist);
router.get('/ids', getWatchlistIds);
router.post('/:movieId', addToWatchlist);
router.delete('/:movieId', removeFromWatchlist);

export default router;
