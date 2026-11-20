import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { InteractionType } from '@prisma/client';

// GET /api/watchlist/ids - Return array of movie IDs in user's watchlist
export async function getWatchlistIds(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const items = await prisma.watchlist.findMany({
      where: { userId },
      select: { movieId: true },
    });

    return res.status(200).json({
      movieIds: items.map((i) => i.movieId),
    });
  } catch (error) {
    console.error('[Watchlist Controller: getWatchlistIds]', error);
    return res.status(500).json({ error: 'Failed to fetch watchlist IDs' });
  }
}

// GET /api/watchlist - Return full movies in user's watchlist
export async function getWatchlist(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const items = await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        movie: {
          include: {
            genres: {
              include: { genre: true },
            },
            directors: {
              include: { director: true },
            },
          },
        },
      },
    });

    return res.status(200).json({
      watchlist: items.map((item) => ({
        id: item.id,
        createdAt: item.createdAt,
        movie: item.movie,
      })),
      count: items.length,
    });
  } catch (error) {
    console.error('[Watchlist Controller: getWatchlist]', error);
    return res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
}

// POST /api/watchlist/:movieId - Add to watchlist
export async function addToWatchlist(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { movieId } = req.params;

    // Check movie existence
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Upsert watchlist item to prevent duplicate key errors
    const item = await prisma.watchlist.upsert({
      where: {
        userId_movieId: {
          userId,
          movieId,
        },
      },
      update: {},
      create: {
        userId,
        movieId,
      },
    });

    // Record interaction for Personal Match Score engine
    await prisma.userMovieInteraction.create({
      data: {
        userId,
        movieId,
        interactionType: InteractionType.WATCHLIST_ADD,
        value: 1,
      },
    });

    return res.status(200).json({
      message: 'Added to watchlist',
      watchlistId: item.id,
      movieId,
    });
  } catch (error) {
    console.error('[Watchlist Controller: addToWatchlist]', error);
    return res.status(500).json({ error: 'Failed to add to watchlist' });
  }
}

// DELETE /api/watchlist/:movieId - Remove from watchlist
export async function removeFromWatchlist(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { movieId } = req.params;

    await prisma.watchlist.deleteMany({
      where: {
        userId,
        movieId,
      },
    });

    // Record interaction for Personal Match Score engine
    await prisma.userMovieInteraction.create({
      data: {
        userId,
        movieId,
        interactionType: InteractionType.WATCHLIST_REMOVE,
        value: 0,
      },
    });

    return res.status(200).json({
      message: 'Removed from watchlist',
      movieId,
    });
  } catch (error) {
    console.error('[Watchlist Controller: removeFromWatchlist]', error);
    return res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
}
