import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { prisma } from './prisma.js';
import healthRouter from './routes/health.routes.js';
import authRouter from './routes/auth.routes.js';
import movieRouter from './routes/movie.routes.js';
import watchlistRouter from './routes/watchlist.routes.js';
import reviewRouter, { movieReviewRouter } from './routes/review.routes.js';
import profileRouter from './routes/profile.routes.js';
import aiRouter from './routes/ai.routes.js';
import { getGenres } from './controllers/movie.controller.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(requestLogger);

// Basic routing
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/movies/:id/reviews', movieReviewRouter);
app.use('/api/movies', movieRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/profile', profileRouter);
app.use('/api/ai', aiRouter);
app.get('/api/genres', getGenres);

// Fallback route for unmatched API calls
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl });
});

// Central error handler
app.use(errorHandler);

// Test database connection and start server
async function startServer() {
  try {
    await prisma.$connect();
    console.log('[Server] Connected to PostgreSQL database successfully.');

    app.listen(PORT, () => {
      console.log(`[Server] Express API server listening on http://localhost:${PORT}`);
      console.log(`[Server] Health check available at http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('[Server] Failed to connect to the database:', error);
    process.exit(1);
  }
}

startServer();

export default app;
