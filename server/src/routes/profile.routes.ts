import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getProfile,
  getProfileStats,
  saveOnboardingRatings,
} from '../controllers/profile.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', getProfile);
router.get('/stats', getProfileStats);
router.post('/onboarding', saveOnboardingRatings);

export default router;
