import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { InteractionType } from '@prisma/client';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(10),
  title: z.string().min(2, 'Title must be at least 2 characters').max(150),
  content: z.string().min(5, 'Review content must be at least 5 characters').max(2000),
});

// GET /api/movies/:id/reviews
export async function getMovieReviews(req: Request, res: Response) {
  try {
    const { id: movieId } = req.params;
    const sortBy = (req.query.sort as string) || 'helpful'; // 'helpful' or 'newest'

    const reviews = await prisma.review.findMany({
      where: { movieId },
      orderBy: sortBy === 'newest' ? { createdAt: 'desc' } : [{ likes: 'desc' }, { createdAt: 'desc' }],
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return res.status(200).json({ reviews });
  } catch (error) {
    console.error('[Review Controller: getMovieReviews]', error);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}

// POST /api/movies/:id/reviews
export async function createOrUpdateReview(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id: movieId } = req.params;

    const parseResult = reviewSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: parseResult.error.errors[0]?.message || 'Invalid review data',
      });
    }

    const { rating, title, content } = parseResult.data;

    // Check movie exists
    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Upsert review (one review per user per movie)
    const review = await prisma.review.upsert({
      where: {
        userId_movieId: { userId, movieId },
      },
      update: {
        rating,
        title,
        content,
      },
      create: {
        userId,
        movieId,
        rating,
        title,
        content,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Record interaction for Personal Match Score engine
    await prisma.userMovieInteraction.create({
      data: {
        userId,
        movieId,
        interactionType: InteractionType.RATE,
        value: rating,
      },
    });

    // Recalculate movie average rating
    const allReviews = await prisma.review.findMany({ where: { movieId } });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / Math.max(1, allReviews.length);

    await prisma.movie.update({
      where: { id: movieId },
      data: {
        imdbRating: Number(avgRating.toFixed(1)),
        voteCount: { increment: 1 },
      },
    });

    return res.status(201).json({
      message: 'Review saved successfully',
      review,
    });
  } catch (error) {
    console.error('[Review Controller: createOrUpdateReview]', error);
    return res.status(500).json({ error: 'Failed to save review' });
  }
}

// DELETE /api/reviews/:id
export async function deleteReview(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (review.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this review' });
    }

    await prisma.review.delete({ where: { id } });
    return res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('[Review Controller: deleteReview]', error);
    return res.status(500).json({ error: 'Failed to delete review' });
  }
}

// POST /api/reviews/:id/like
export async function toggleReviewLike(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id: reviewId } = req.params;

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const existingLike = await prisma.reviewLike.findUnique({
      where: {
        userId_reviewId: { userId, reviewId },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.reviewLike.delete({
        where: {
          userId_reviewId: { userId, reviewId },
        },
      });
      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: { likes: { decrement: 1 } },
      });
      return res.status(200).json({ liked: false, likes: Math.max(0, updated.likes) });
    } else {
      // Like
      await prisma.reviewLike.create({
        data: { userId, reviewId },
      });
      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: { likes: { increment: 1 } },
      });
      return res.status(200).json({ liked: true, likes: updated.likes });
    }
  } catch (error) {
    console.error('[Review Controller: toggleReviewLike]', error);
    return res.status(500).json({ error: 'Failed to toggle review like' });
  }
}
