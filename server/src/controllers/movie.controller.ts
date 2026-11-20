import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { calculatePersonalMatch } from '../services/personalMatchService.js';
import { Prisma } from '@prisma/client';

const movieInclude = {
  genres: {
    include: {
      genre: true,
    },
  },
  directors: {
    include: {
      director: true,
    },
  },
  cast: {
    take: 10,
    orderBy: { castOrder: 'asc' as const },
    include: {
      castMember: true,
    },
  },
};

// GET /api/movies/featured - 5 top movies for hero banner
export async function getFeaturedMovies(_req: Request, res: Response) {
  try {
    const movies = await prisma.movie.findMany({
      where: {
        backdropUrl: { not: null },
      },
      take: 6,
      orderBy: [
        { popularity: 'desc' },
        { imdbRating: 'desc' },
      ],
      include: movieInclude,
    });

    return res.status(200).json({ movies });
  } catch (error) {
    console.error('[Movie Controller: getFeaturedMovies]', error);
    return res.status(500).json({ error: 'Failed to fetch featured movies' });
  }
}

// GET /api/movies/trending - Top 12 trending
export async function getTrendingMovies(_req: Request, res: Response) {
  try {
    const movies = await prisma.movie.findMany({
      take: 12,
      orderBy: { popularity: 'desc' },
      include: movieInclude,
    });

    return res.status(200).json({ movies });
  } catch (error) {
    console.error('[Movie Controller: getTrendingMovies]', error);
    return res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
}

// GET /api/movies/top-rated - Top 12 rated
export async function getTopRatedMovies(_req: Request, res: Response) {
  try {
    const movies = await prisma.movie.findMany({
      take: 12,
      orderBy: { imdbRating: 'desc' },
      include: movieInclude,
    });

    return res.status(200).json({ movies });
  } catch (error) {
    console.error('[Movie Controller: getTopRatedMovies]', error);
    return res.status(500).json({ error: 'Failed to fetch top-rated movies' });
  }
}

// GET /api/movies/popular - 12 popular movies
export async function getPopularMovies(_req: Request, res: Response) {
  try {
    const movies = await prisma.movie.findMany({
      skip: 6,
      take: 12,
      orderBy: { popularity: 'desc' },
      include: movieInclude,
    });

    return res.status(200).json({ movies });
  } catch (error) {
    console.error('[Movie Controller: getPopularMovies]', error);
    return res.status(500).json({ error: 'Failed to fetch popular movies' });
  }
}

// GET /api/movies/by-genre?genre=Action&limit=12
export async function getMoviesByGenre(req: Request, res: Response) {
  try {
    const genreName = req.query.genre as string;
    const limit = parseInt(req.query.limit as string) || 12;

    if (!genreName) {
      return res.status(400).json({ error: 'Genre query parameter is required' });
    }

    const movies = await prisma.movie.findMany({
      where: {
        genres: {
          some: {
            genre: {
              name: {
                equals: genreName,
                mode: 'insensitive',
              },
            },
          },
        },
      },
      take: limit,
      orderBy: { imdbRating: 'desc' },
      include: movieInclude,
    });

    return res.status(200).json({ genre: genreName, movies });
  } catch (error) {
    console.error('[Movie Controller: getMoviesByGenre]', error);
    return res.status(500).json({ error: 'Failed to fetch movies by genre' });
  }
}

// GET /api/movies/search?q=inception&genre=Action&year=2010
export async function searchMovies(req: Request, res: Response) {
  try {
    const q = ((req.query.q as string) || '').trim();
    const genre = req.query.genre as string;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const limit = parseInt(req.query.limit as string) || 20;

    const where: Prisma.MovieWhereInput = {};

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        {
          directors: {
            some: {
              director: { name: { contains: q, mode: 'insensitive' } },
            },
          },
        },
        {
          cast: {
            some: {
              castMember: { name: { contains: q, mode: 'insensitive' } },
            },
          },
        },
      ];
    }

    if (genre) {
      where.genres = {
        some: {
          genre: { name: { equals: genre, mode: 'insensitive' } },
        },
      };
    }

    if (year) {
      const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
      const endDate = new Date(`${year}-12-31T23:59:59.999Z`);
      where.releaseDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const movies = await prisma.movie.findMany({
      where,
      take: limit,
      orderBy: [{ imdbRating: 'desc' }, { popularity: 'desc' }],
      include: movieInclude,
    });

    return res.status(200).json({
      query: q,
      total: movies.length,
      movies,
    });
  } catch (error) {
    console.error('[Movie Controller: searchMovies]', error);
    return res.status(500).json({ error: 'Failed to perform search' });
  }
}

// GET /api/movies - Full Listing with filters & pagination
export async function listMovies(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 16));
    const skip = (page - 1) * limit;

    const genre = req.query.genre as string;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : undefined;
    const language = req.query.language as string;
    const sortBy = (req.query.sortBy as string) || 'popularity';
    const search = ((req.query.search as string) || '').trim();

    const where: Prisma.MovieWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (genre) {
      where.genres = {
        some: {
          genre: { name: { equals: genre, mode: 'insensitive' } },
        },
      };
    }

    if (year) {
      where.releaseDate = {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lte: new Date(`${year}-12-31T23:59:59.999Z`),
      };
    }

    if (minRating) {
      where.imdbRating = { gte: minRating };
    }

    if (language) {
      where.language = { equals: language, mode: 'insensitive' };
    }

    let orderBy: Prisma.MovieOrderByWithRelationInput = { popularity: 'desc' };
    if (sortBy === 'rating') {
      orderBy = { imdbRating: 'desc' };
    } else if (sortBy === 'releaseDate') {
      orderBy = { releaseDate: 'desc' };
    } else if (sortBy === 'title') {
      orderBy = { title: 'asc' };
    }

    const [total, movies] = await Promise.all([
      prisma.movie.count({ where }),
      prisma.movie.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: movieInclude,
      }),
    ]);

    return res.status(200).json({
      movies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Movie Controller: listMovies]', error);
    return res.status(500).json({ error: 'Failed to fetch movies listing' });
  }
}

// GET /api/movies/:id - Full details
export async function getMovieById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const movie = await prisma.movie.findUnique({
      where: { id },
      include: {
        genres: { include: { genre: true } },
        directors: { include: { director: true } },
        cast: {
          orderBy: { castOrder: 'asc' },
          include: { castMember: true },
        },
        reviews: {
          orderBy: [{ likes: 'desc' }, { createdAt: 'desc' }],
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    // Rating distribution (1 - 10)
    const ratingDistribution: Record<number, number> = {};
    for (let i = 1; i <= 10; i++) ratingDistribution[i] = 0;
    movie.reviews.forEach((r) => {
      ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
    });

    // Fetch similar movies (by primary genre)
    const primaryGenreId = movie.genres[0]?.genreId;
    let similarMovies: any[] = [];
    if (primaryGenreId) {
      similarMovies = await prisma.movie.findMany({
        where: {
          id: { not: movie.id },
          genres: { some: { genreId: primaryGenreId } },
        },
        take: 6,
        orderBy: { imdbRating: 'desc' },
        include: movieInclude,
      });
    }

    // Personal Match Score if authenticated
    let personalMatch: { matchScore: number; reasons: string[] } | null = null;
    if (req.user?.id) {
      personalMatch = await calculatePersonalMatch(req.user.id, movie.id);
    }

    return res.status(200).json({
      movie,
      ratingDistribution,
      similarMovies,
      personalMatch,
    });
  } catch (error) {
    console.error('[Movie Controller: getMovieById]', error);
    return res.status(500).json({ error: 'Failed to fetch movie details' });
  }
}

// GET /api/movies/:id/match - Personal match for logged in user
export async function getMovieMatch(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const match = await calculatePersonalMatch(userId, id);
    return res.status(200).json(match);
  } catch (error) {
    console.error('[Movie Controller: getMovieMatch]', error);
    return res.status(500).json({ error: 'Failed to calculate personal match' });
  }
}

// GET /api/genres - List all genres with movie counts
export async function getGenres(_req: Request, res: Response) {
  try {
    const genres = await prisma.genre.findMany({
      include: {
        _count: {
          select: { movies: true },
        },
      },
      orderBy: {
        movies: { _count: 'desc' },
      },
    });

    return res.status(200).json({
      genres: genres.map((g) => ({
        id: g.id,
        name: g.name,
        movieCount: g._count.movies,
      })),
    });
  } catch (error) {
    console.error('[Movie Controller: getGenres]', error);
    return res.status(500).json({ error: 'Failed to fetch genres' });
  }
}

// GET /api/recommendations - Personalized Home Rows
export async function getPersonalizedRecommendations(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(200).json({ sections: [] });
    }

    // User's rated movies
    const userReviews = await prisma.review.findMany({
      where: { userId },
      orderBy: { rating: 'desc' },
      include: { movie: { include: movieInclude } },
      take: 5,
    });

    const sections: any[] = [];

    if (userReviews.length > 0) {
      const topMovie = userReviews[0].movie;
      const topGenre = topMovie.genres[0]?.genre.name;

      if (topGenre) {
        const becauseYouLiked = await prisma.movie.findMany({
          where: {
            id: { notIn: userReviews.map((r) => r.movieId) },
            genres: { some: { genre: { name: topGenre } } },
          },
          take: 8,
          orderBy: { imdbRating: 'desc' },
          include: movieInclude,
        });

        sections.push({
          title: `Because You Rated "${topMovie.title}"`,
          type: 'because_you_watched',
          movies: becauseYouLiked,
        });
      }

      // Top 90%+ Matches
      const candidateMovies = await prisma.movie.findMany({
        where: { id: { notIn: userReviews.map((r) => r.movieId) } },
        take: 15,
        orderBy: { popularity: 'desc' },
        include: movieInclude,
      });

      const highMatches = [];
      for (const m of candidateMovies) {
        const match = await calculatePersonalMatch(userId, m.id);
        if (match.matchScore >= 85) {
          highMatches.push({ ...m, matchScore: match.matchScore, matchReasons: match.reasons });
        }
      }

      if (highMatches.length > 0) {
        sections.push({
          title: '90%+ Personal Matches for You',
          type: 'top_matches',
          movies: highMatches.slice(0, 8),
        });
      }
    }

    return res.status(200).json({ sections });
  } catch (error) {
    console.error('[Movie Controller: getPersonalizedRecommendations]', error);
    return res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
}
