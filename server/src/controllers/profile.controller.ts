import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { InteractionType } from '@prisma/client';

// GET /api/profile
export async function getProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const [user, reviews, watchlist, interactions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, avatar: true, createdAt: true },
      }),
      prisma.review.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          movie: {
            include: {
              genres: { include: { genre: true } },
            },
          },
        },
      }),
      prisma.watchlist.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          movie: {
            include: {
              genres: { include: { genre: true } },
            },
          },
        },
      }),
      prisma.userMovieInteraction.findMany({
        where: { userId, interactionType: InteractionType.VIEW },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          movie: {
            include: {
              genres: { include: { genre: true } },
            },
          },
        },
      }),
    ]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      user,
      reviews,
      watchlist: watchlist.map((w) => w.movie),
      recentlyViewed: interactions.map((i) => i.movie),
    });
  } catch (error) {
    console.error('[Profile Controller: getProfile]', error);
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}

// GET /api/profile/stats
export async function getProfileStats(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const [reviews, watchlistCount] = await Promise.all([
      prisma.review.findMany({
        where: { userId },
        include: {
          movie: {
            include: {
              genres: { include: { genre: true } },
            },
          },
        },
      }),
      prisma.watchlist.count({ where: { userId } }),
    ]);

    const moviesRated = reviews.length;
    const reviewsWritten = reviews.filter((r) => r.content && r.content.length > 0).length;
    const avgRatingGiven =
      moviesRated > 0
        ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / moviesRated).toFixed(1))
        : 0;

    // Calculate favorite genres
    const genreCounts: Record<string, number> = {};
    reviews.forEach((r) => {
      r.movie.genres.forEach((g) => {
        const name = g.genre.name;
        genreCounts[name] = (genreCounts[name] || 0) + 1;
      });
    });

    const favoriteGenres = Object.entries(genreCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return res.status(200).json({
      moviesRated,
      reviewsWritten,
      watchlistCount,
      averageRatingGiven: avgRatingGiven,
      favoriteGenres,
    });
  } catch (error) {
    console.error('[Profile Controller: getProfileStats]', error);
    return res.status(500).json({ error: 'Failed to fetch profile stats' });
  }
}

// POST /api/profile/onboarding - Rate 5-10 movies to initialize taste profile
export async function saveOnboardingRatings(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { ratings } = req.body; // Array of { movieId: string, rating: number }

    if (!Array.isArray(ratings) || ratings.length === 0) {
      return res.status(400).json({ error: 'Ratings array is required' });
    }

    for (const item of ratings) {
      if (item.movieId && item.rating >= 1 && item.rating <= 10) {
        await prisma.review.upsert({
          where: {
            userId_movieId: { userId, movieId: item.movieId },
          },
          update: { rating: item.rating },
          create: {
            userId,
            movieId: item.movieId,
            rating: item.rating,
            title: 'Initial Rating',
            content: 'Rated during onboarding.',
          },
        });

        await prisma.userMovieInteraction.create({
          data: {
            userId,
            movieId: item.movieId,
            interactionType: InteractionType.RATE,
            value: item.rating,
          },
        });
      }
    }

    return res.status(200).json({ message: 'Taste profile initialized successfully' });
  } catch (error) {
    console.error('[Profile Controller: saveOnboardingRatings]', error);
    return res.status(500).json({ error: 'Failed to save onboarding ratings' });
  }
}
