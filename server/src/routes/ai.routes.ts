import { Router } from 'express';
import { handleMoodQuery } from '../controllers/ai.controller.js';

const router = Router();

router.post('/mood', handleMoodQuery);

export default router;
