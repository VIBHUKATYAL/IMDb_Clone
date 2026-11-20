import { Request, Response } from 'express';
import { getMoodRecommendations } from '../services/aiMoodService.js';

// POST /api/ai/mood
export async function handleMoodQuery(req: Request, res: Response) {
  try {
    const { prompt, quickMood } = req.body;

    if (!prompt && !quickMood) {
      return res.status(400).json({
        error: 'Please provide either a natural language prompt or select a quick mood.',
      });
    }

    const recommendations = await getMoodRecommendations(prompt || '', quickMood);

    return res.status(200).json({
      prompt: prompt || quickMood,
      recommendations,
    });
  } catch (error) {
    console.error('[AI Controller: handleMoodQuery]', error);
    return res.status(500).json({ error: 'Failed to process AI mood recommendation' });
  }
}
