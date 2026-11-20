import { prisma } from '../prisma.js';

export interface PersonalMatchResult {
  matchScore: number;
  reasons: string[];
}

export async function calculatePersonalMatch(
  userId: string,
  movieId: string
): Promise<PersonalMatchResult> {
  // 1. Fetch the target movie
  const targetMovie = await prisma.movie.findUnique({
    where: { id: movieId },
    include: {
      genres: { include: { genre: true } },
      directors: { include: { director: true } },
    },
  });

  if (!targetMovie) {
    return { matchScore: 70, reasons: ['Popular across audience favorites'] };
  }

  // 2. Fetch user's interactions: reviews, ratings, watchlist
  const [userReviews, userWatchlist, userInteractions] = await Promise.all([
    prisma.review.findMany({
      where: { userId },
      include: {
        movie: {
          include: {
            genres: { include: { genre: true } },
            directors: { include: { director: true } },
          },
        },
      },
    }),
    prisma.watchlist.findMany({
      where: { userId },
      include: {
        movie: {
          include: {
            genres: { include: { genre: true } },
          },
        },
      },
    }),
    prisma.userMovieInteraction.findMany({
      where: { userId },
      take: 50,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  // If user has little to no history, return fallback onboarding advice
  const totalSignals = userReviews.length + userWatchlist.length + userInteractions.length;
  if (totalSignals === 0) {
    return {
      matchScore: Math.round(targetMovie.imdbRating * 10),
      reasons: ['Based on global IMDb community rating (Rate movies to personalize)'],
    };
  }

  // Scoring weights:
  // Genre compatibility: 35%
  // Rating preference / similarity: 25%
  // Director affinity: 15%
  // Runtime preference: 15%
  // Community baseline: 10%

  let genreScore = 0;
  let ratingScore = 0;
  let directorScore = 0;
  let runtimeScore = 0;
  const reasons: string[] = [];

  const targetGenres = targetMovie.genres.map((g) => g.genre.name.toLowerCase());
  const targetDirectors = targetMovie.directors.map((d) => d.director.name.toLowerCase());

  // A. Genre Compatibility Analysis
  const genreCounts: Record<string, number> = {};
  const genreHighRatings: Record<string, number> = {};

  userReviews.forEach((r) => {
    r.movie.genres.forEach((g) => {
      const gName = g.genre.name.toLowerCase();
      genreCounts[gName] = (genreCounts[gName] || 0) + 1;
      if (r.rating >= 8) {
        genreHighRatings[gName] = (genreHighRatings[gName] || 0) + 1;
      }
    });
  });

  userWatchlist.forEach((w) => {
    w.movie.genres.forEach((g) => {
      const gName = g.genre.name.toLowerCase();
      genreCounts[gName] = (genreCounts[gName] || 0) + 1;
    });
  });

  // Calculate matching genres
  let matchedGenreNames: string[] = [];
  targetGenres.forEach((g) => {
    if (genreCounts[g]) {
      matchedGenreNames.push(g);
      genreScore += 35 / Math.max(1, targetGenres.length);
    }
  });
  genreScore = Math.min(35, genreScore);

  if (matchedGenreNames.length > 0) {
    const formattedGenres = matchedGenreNames
      .map((g) => g.charAt(0).toUpperCase() + g.slice(1))
      .slice(0, 2)
      .join(' & ');
    reasons.push(`Frequently watch and enjoy ${formattedGenres} titles`);
  }

  // B. Rating Preference Analysis
  const highRatedReviews = userReviews.filter((r) => r.rating >= 8);
  if (highRatedReviews.length > 0) {
    const similarHighRated = highRatedReviews.some((r) =>
      r.movie.genres.some((g) => targetGenres.includes(g.genre.name.toLowerCase()))
    );

    if (similarHighRated) {
      ratingScore = 25;
      reasons.push('Rated similar movies 8+/10');
    } else {
      ratingScore = 15;
    }
  } else {
    ratingScore = 15;
  }

  // C. Director Affinity Analysis
  const likedDirectors = new Set<string>();
  userReviews
    .filter((r) => r.rating >= 8)
    .forEach((r) => {
      r.movie.directors.forEach((d) => likedDirectors.add(d.director.name.toLowerCase()));
    });

  const matchingDirector = targetDirectors.find((d) => likedDirectors.has(d));
  if (matchingDirector) {
    directorScore = 15;
    const dirName = targetMovie.directors.find(
      (d) => d.director.name.toLowerCase() === matchingDirector
    )?.director.name;
    reasons.push(`Directed by ${dirName}, whose work you rate highly`);
  } else {
    directorScore = 8;
  }

  // D. Runtime Preference Analysis
  if (userReviews.length > 0) {
    const avgRuntime =
      userReviews.reduce((sum, r) => sum + r.movie.runtime, 0) / userReviews.length;
    const diff = Math.abs(avgRuntime - targetMovie.runtime);

    if (diff < 30) {
      runtimeScore = 15;
      const hours = (targetMovie.runtime / 60).toFixed(1);
      reasons.push(`Matches your preferred runtime (~${hours} hours)`);
    } else if (diff < 60) {
      runtimeScore = 10;
    } else {
      runtimeScore = 5;
    }
  } else {
    runtimeScore = 10;
  }

  // E. Baseline community quality score
  const communityScore = Math.min(10, Math.max(5, (targetMovie.imdbRating / 10) * 10));

  // Compute final score and normalize to 50 - 99%
  const total = genreScore + ratingScore + directorScore + runtimeScore + communityScore;
  const matchScore = Math.min(99, Math.max(52, Math.round(total)));

  if (reasons.length === 0) {
    reasons.push('High community praise matching your general viewing tastes');
  }

  return { matchScore, reasons: reasons.slice(0, 3) };
}
