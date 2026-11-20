import https from 'https';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

const TMDB_KEYS = [
  process.env.TMDB_API_KEY || 'fb7bb23f03b6994dafc674c074d01761',
  'e55425032d3d0f371fc776f302e7c09b',
  '8301a21598f8b45668d5711a814f01f6',
  '8cf43ad9c085135b9479ad5cf6bbcbda',
  'da63548086e399ffc910fbc08526df05',
  '13e53ff644a8bd4ba37b3e1044ad24f3',
  '269890f657dddf4635473cf4cf456576',
  'a2f888b27315e62e471b2d587048f32e',
  '8476a7ab80ad76f0936744df0430e67c',
  '5622cafbfe8f8cfe358a29c53e19bba0',
];

let currentKeyIndex = 0;
function getKey(): string {
  return TMDB_KEYS[currentKeyIndex % TMDB_KEYS.length];
}

function rotateKey(): void {
  currentKeyIndex = (currentKeyIndex + 1) % TMDB_KEYS.length;
  console.log(`[TMDB Sync] Rotated to key index ${currentKeyIndex}`);
}

function fetchJSON(url: string, retryCount = 0): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', async () => {
        try {
          if (res.statusCode === 429 || res.statusCode === 401) {
            if (retryCount < TMDB_KEYS.length) {
              rotateKey();
              const newUrl = url.replace(/api_key=[^&]+/, `api_key=${getKey()}`);
              return resolve(fetchJSON(newUrl, retryCount + 1));
            }
          }
          const json = JSON.parse(data);
          if (res.statusCode && res.statusCode >= 400) {
            return reject(new Error(`HTTP ${res.statusCode}: ${json.status_message || data}`));
          }
          resolve(json);
        } catch (err) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

// Search TMDB for a movie by title and optional year
async function searchTMDBMovie(title: string, year?: number) {
  let url = `https://api.themoviedb.org/3/search/movie?api_key=${getKey()}&query=${encodeURIComponent(title)}`;
  if (year) {
    url += `&year=${year}`;
  }
  const data = await fetchJSON(url);
  if (data.results && data.results.length > 0) {
    return data.results[0];
  }
  // If year search had no match, fallback to title search
  if (year) {
    const fallbackData = await fetchJSON(`https://api.themoviedb.org/3/search/movie?api_key=${getKey()}&query=${encodeURIComponent(title)}`);
    return fallbackData.results?.[0] || null;
  }
  return null;
}

// Get movie details including credits and videos
async function getTMDBMovieDetails(tmdbId: number) {
  const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${getKey()}&append_to_response=credits,videos`;
  return await fetchJSON(url);
}

function cleanText(str: string): string {
  if (!str) return str;
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[łŁ]/g, 'l')
    .replace(/[øØ]/g, 'o')
    .replace(/[æÆ]/g, 'ae')
    .replace(/[ß]/g, 'ss')
    .replace(/[^\x00-\x7F]/g, '')
    .trim();
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('[TMDB Sync] Initializing TMDB enrichment...');
  console.log(`[TMDB Sync] Primary key active: ${getKey()}`);

  const forceAll = process.argv.includes('--all');
  const movies = await prisma.movie.findMany({
    where: forceAll ? {} : {
      OR: [
        { posterUrl: { startsWith: 'https://images.unsplash' } },
        { cast: { none: {} } }
      ]
    },
    include: {
      directors: { include: { director: true } },
      cast: { include: { castMember: true } },
    },
    orderBy: { popularity: 'desc' }
  });

  console.log(`[TMDB Sync] Found ${movies.length} movies in database to enrich with genuine posters and cast.`);

  let updatedCount = 0;
  const seedJsonPath = path.resolve(process.cwd(), 'prisma/movies-seed.json');
  let seedData: any[] = [];
  if (fs.existsSync(seedJsonPath)) {
    try {
      seedData = JSON.parse(fs.readFileSync(seedJsonPath, 'utf-8'));
    } catch (_) {}
  }

  for (let i = 0; i < movies.length; i++) {
    const movie = movies[i];
    const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : undefined;
    process.stdout.write(`[${i + 1}/${movies.length}] "${movie.title}" (${releaseYear || 'N/A'})... `);

    try {
      const searchResult = await searchTMDBMovie(movie.title, releaseYear);
      if (!searchResult) {
        console.log('⚠️ Not found on TMDB');
        continue;
      }

      const details = await getTMDBMovieDetails(searchResult.id);

      // 1. Build genuine URLs
      const posterUrl = details.poster_path
        ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
        : movie.posterUrl;

      const backdropUrl = details.backdrop_path
        ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
        : movie.backdropUrl;

      // Find official YouTube trailer
      let trailerUrl = movie.trailerUrl;
      const videos = details.videos?.results || [];
      const officialTrailer = videos.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer') ||
                              videos.find((v: any) => v.site === 'YouTube' && v.type === 'Teaser');
      if (officialTrailer?.key) {
        trailerUrl = `https://www.youtube.com/watch?v=${officialTrailer.key}`;
      }

      // Update movie record
      await prisma.movie.update({
        where: { id: movie.id },
        data: {
          posterUrl,
          backdropUrl,
          trailerUrl,
        }
      });

      // 2. Update or insert genuine cast members (top 5-6 billed)
      const tmdbCast = (details.credits?.cast || []).slice(0, 6);
      if (tmdbCast.length > 0) {
        // Delete previous movie cast relationships
        await prisma.movieCast.deleteMany({
          where: { movieId: movie.id }
        });

        for (let order = 0; order < tmdbCast.length; order++) {
          const c = tmdbCast[order];
          const cleanedName = cleanText(c.name) || c.name;
          const cleanedCharacter = cleanText(c.character) || 'Cast';
          const photoUrl = c.profile_path
            ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanedName)}&background=252525&color=F5C518`;

          // Generate stable deterministic ID
          const castMemberId = `tmdb-cast-${c.id}`;

          const castMember = await prisma.castMember.upsert({
            where: { id: castMemberId },
            update: {
              name: cleanedName,
              photoUrl,
            },
            create: {
              id: castMemberId,
              name: cleanedName,
              photoUrl,
              biography: `${cleanedName} is a celebrated actor recognized for prominent roles.`
            }
          });

          await prisma.movieCast.create({
            data: {
              movieId: movie.id,
              castMemberId: castMember.id,
              character: cleanedCharacter,
              castOrder: order,
            }
          });
        }
      }

      // 3. Update Director photo if available
      const tmdbCrew = details.credits?.crew || [];
      const director = tmdbCrew.find((c: any) => c.job === 'Director');
      if (director && director.profile_path && movie.directors?.[0]) {
        const photoUrl = `https://image.tmdb.org/t/p/w185${director.profile_path}`;
        await prisma.director.update({
          where: { id: movie.directors[0].directorId },
          data: { photoUrl }
        }).catch(() => {});
      }

      // Also update seed JSON in memory
      const seedMovie = seedData.find((s: any) => s.title.toLowerCase() === movie.title.toLowerCase());
      if (seedMovie) {
        seedMovie.posterUrl = posterUrl;
        seedMovie.backdropUrl = backdropUrl;
        seedMovie.trailerUrl = trailerUrl;
        if (tmdbCast.length > 0) {
          seedMovie.cast = tmdbCast.map((c: any, idx: number) => ({
            name: c.name,
            character: c.character || 'Cast',
            photoUrl: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : undefined,
            castOrder: idx,
          }));
        }
      }

      updatedCount++;
      console.log(`✓ Enriched (Poster, ${tmdbCast.length} Cast, Trailer)`);

      // Gentle 100ms throttle
      await delay(100);
    } catch (err: any) {
      console.log(`❌ Error: ${err.message}`);
    }
  }

  // Save updated seed JSON
  if (seedData.length > 0) {
    fs.writeFileSync(seedJsonPath, JSON.stringify(seedData, null, 2), 'utf-8');
    console.log('[TMDB Sync] prisma/movies-seed.json updated with genuine TMDB data.');
  }

  console.log(`\n🎉 TMDB Sync Complete! Successfully enriched ${updatedCount}/${movies.length} movies.`);
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
