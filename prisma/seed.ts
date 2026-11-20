import { PrismaClient, InteractionType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface SeedMovie {
  title: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  releaseDate: string;
  runtime: number;
  language: string;
  country: string;
  imdbRating: number;
  popularity: number;
  voteCount: number;
  trailerUrl: string;
  genres: string[];
  directors: string[];
  cast: { name: string; character: string; photoUrl?: string }[];
}

async function main() {
  console.log('[Seed] Starting database seeding...');

  // 1. Create or upsert seed users
  const passwordHash = await bcrypt.hash('password123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      name: 'Demo Cinephile',
      email: 'demo@example.com',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    },
  });

  const criticUser = await prisma.user.upsert({
    where: { email: 'critic@example.com' },
    update: {},
    create: {
      name: 'Film Critic Roger',
      email: 'critic@example.com',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  });

  console.log(`[Seed] Seed users verified: ${demoUser.email}, ${adminUser.email}, ${criticUser.email}`);

  // 2. Load movies dataset
  const jsonPath = path.resolve(process.cwd(), 'prisma/movies-seed.json');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const moviesData: SeedMovie[] = JSON.parse(rawData);

  console.log(`[Seed] Inserting ${moviesData.length} movies with relations...`);

  const createdMovieIds: string[] = [];

  for (const item of moviesData) {
    // Check if movie already exists
    let movie = await prisma.movie.findFirst({
      where: { title: item.title },
    });

    if (!movie) {
      movie = await prisma.movie.create({
        data: {
          title: item.title,
          description: item.description,
          posterUrl: item.posterUrl,
          backdropUrl: item.backdropUrl,
          releaseDate: new Date(item.releaseDate),
          runtime: item.runtime,
          language: item.language,
          country: item.country,
          imdbRating: item.imdbRating,
          popularity: item.popularity,
          voteCount: item.voteCount,
          trailerUrl: item.trailerUrl,
        },
      });
    }

    createdMovieIds.push(movie.id);

    // Link Genres
    for (const genreName of item.genres) {
      const genre = await prisma.genre.upsert({
        where: { name: genreName },
        update: {},
        create: { name: genreName },
      });

      await prisma.movieGenre.upsert({
        where: {
          movieId_genreId: {
            movieId: movie.id,
            genreId: genre.id,
          },
        },
        update: {},
        create: {
          movieId: movie.id,
          genreId: genre.id,
        },
      });
    }

    // Link Directors
    for (const directorName of item.directors) {
      let director = await prisma.director.findFirst({
        where: { name: directorName },
      });

      if (!director) {
        director = await prisma.director.create({
          data: { name: directorName },
        });
      }

      await prisma.movieDirector.upsert({
        where: {
          movieId_directorId: {
            movieId: movie.id,
            directorId: director.id,
          },
        },
        update: {},
        create: {
          movieId: movie.id,
          directorId: director.id,
        },
      });
    }

    // Link Cast
    let castOrder = 0;
    for (const actor of item.cast) {
      let castMember = await prisma.castMember.findFirst({
        where: { name: actor.name },
      });

      if (!castMember) {
        castMember = await prisma.castMember.create({
          data: {
            name: actor.name,
            photoUrl: actor.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(actor.name)}&background=252525&color=F5C518`,
            biography: `${actor.name} is a celebrated actor recognized worldwide for prominent roles.`,
          },
        });
      }

      await prisma.movieCast.upsert({
        where: {
          movieId_castMemberId: {
            movieId: movie.id,
            castMemberId: castMember.id,
          },
        },
        update: {
          character: actor.character,
          castOrder,
        },
        create: {
          movieId: movie.id,
          castMemberId: castMember.id,
          character: actor.character,
          castOrder,
        },
      });
      castOrder++;
    }
  }

  console.log(`[Seed] Seeded ${createdMovieIds.length} movies successfully.`);

  // 3. Seed sample reviews and user interactions for demonstration of Personal Match Score
  if (createdMovieIds.length > 5) {
    const [m1, m2, m3, m4, m5] = createdMovieIds;

    // Seed Watchlist for demo user
    await prisma.watchlist.upsert({
      where: { userId_movieId: { userId: demoUser.id, movieId: m1 } },
      update: {},
      create: { userId: demoUser.id, movieId: m1 },
    });

    await prisma.watchlist.upsert({
      where: { userId_movieId: { userId: demoUser.id, movieId: m2 } },
      update: {},
      create: { userId: demoUser.id, movieId: m2 },
    });

    // Seed Reviews
    const review1 = await prisma.review.upsert({
      where: { userId_movieId: { userId: demoUser.id, movieId: m1 } },
      update: {},
      create: {
        userId: demoUser.id,
        movieId: m1,
        rating: 10,
        title: 'An absolute masterpiece of cinema',
        content: 'From the screenplay to the performances, every moment is poignant, gripping, and deeply human.',
        likes: 12,
      },
    });

    await prisma.review.upsert({
      where: { userId_movieId: { userId: criticUser.id, movieId: m1 } },
      update: {},
      create: {
        userId: criticUser.id,
        movieId: m1,
        rating: 9,
        title: 'Timeless storytelling',
        content: 'Remarkable pacing and thematic depth that endures across generations.',
        likes: 5,
      },
    });

    await prisma.review.upsert({
      where: { userId_movieId: { userId: demoUser.id, movieId: m3 } },
      update: {},
      create: {
        userId: demoUser.id,
        movieId: m3,
        rating: 10,
        title: 'Unmatched intensity and acting',
        content: 'The tension never lets up. The cinematography and philosophical conflict are brilliant.',
        likes: 8,
      },
    });

    // Seed user interactions (for taste profile & personal match score)
    await prisma.userMovieInteraction.createMany({
      data: [
        { userId: demoUser.id, movieId: m1, interactionType: InteractionType.RATE, value: 10 },
        { userId: demoUser.id, movieId: m1, interactionType: InteractionType.VIEW, value: 1 },
        { userId: demoUser.id, movieId: m2, interactionType: InteractionType.WATCHLIST_ADD, value: 1 },
        { userId: demoUser.id, movieId: m3, interactionType: InteractionType.RATE, value: 10 },
        { userId: demoUser.id, movieId: m4, interactionType: InteractionType.RATE, value: 9 },
        { userId: demoUser.id, movieId: m5, interactionType: InteractionType.LIKE, value: 1 },
      ],
      skipDuplicates: true,
    });

    console.log('[Seed] Sample reviews, watchlist, and user interactions initialized.');
  }

  const movieCount = await prisma.movie.count();
  const genreCount = await prisma.genre.count();
  const directorCount = await prisma.director.count();
  const castCount = await prisma.castMember.count();
  const reviewCount = await prisma.review.count();

  console.log('----------------------------------------------------');
  console.log(`[Seed Complete] Database seeded successfully!`);
  console.log(`  Total Movies:        ${movieCount}`);
  console.log(`  Total Genres:        ${genreCount}`);
  console.log(`  Total Directors:     ${directorCount}`);
  console.log(`  Total Cast Members:  ${castCount}`);
  console.log(`  Total Reviews:       ${reviewCount}`);
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('[Seed Error]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
