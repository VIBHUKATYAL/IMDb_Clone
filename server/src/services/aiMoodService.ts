import { prisma } from '../prisma.js';
import https from 'https';

export interface MoodRecommendation {
  movieId: string;
  movie: any;
  matchScore: number;
  reason: string;
}

export const QUICK_MOODS: Record<string, { genres: string[]; keywords: string[]; tone: string }> = {
  Funny: {
    genres: ['Comedy', 'Animation', 'Adventure'],
    keywords: ['funny', 'laugh', 'humor', 'hilarious', 'witty', 'lighthearted'],
    tone: 'Delightfully funny, lighthearted, and guaranteed to lift your spirits.',
  },
  Thriller: {
    genres: ['Thriller', 'Crime', 'Mystery'],
    keywords: ['tense', 'suspense', 'dark', 'twists', 'detective', 'serial killer', 'danger'],
    tone: 'Gripping suspense with edge-of-your-seat tension and psychological intrigue.',
  },
  Romantic: {
    genres: ['Romance', 'Drama', 'Comedy'],
    keywords: ['love', 'couple', 'heartfelt', 'relationship', 'passion', 'romantic'],
    tone: 'A beautifully crafted romantic journey filled with emotion and chemistry.',
  },
  Emotional: {
    genres: ['Drama', 'Biography', 'War'],
    keywords: ['cry', 'poignant', 'touching', 'moving', 'heartbreaking', 'deep'],
    tone: 'Deeply moving, emotional storytelling with powerful human performances.',
  },
  'Thought-provoking': {
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
    keywords: ['mind-bending', 'philosophical', 'reality', 'complex', 'intellectual', 'dystopian'],
    tone: 'A mind-bending narrative that challenges your perception and leaves you thinking.',
  },
  Action: {
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    keywords: ['explosive', 'exciting', 'fast-paced', 'hero', 'battle', 'stunts', 'adrenaline'],
    tone: 'Adrenaline-fueled action packed with thrilling set-pieces and high stakes.',
  },
  Relaxing: {
    genres: ['Animation', 'Comedy', 'Family', 'Adventure'],
    keywords: ['chill', 'cozy', 'comfort', 'peaceful', 'warm', 'wholesome'],
    tone: 'Warm, comforting, and easy-going—perfect for unwinding without stress.',
  },
};

// Call Groq Cloud API with openai/gpt-oss-120b model
async function callGroqLLM(prompt: string, candidateMovies: any[]): Promise<{ movieId: string; matchScore: number; reason: string }[]> {
  const apiKey = process.env.AI_API_KEY || process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('No Groq API key configured');
  }

  // Minimize payload size: send compact metadata for 30 relevant candidates
  const candidatesSummary = candidateMovies.slice(0, 30).map((m) => ({
    id: m.id,
    title: m.title,
    runtime: m.runtime,
    genres: m.genres.map((g: any) => g.genre.name).join(', '),
    rating: m.imdbRating,
    synopsis: m.description,
  }));

  const systemMessage = `You are CinePulse's AI Movie Recommender.
The user will tell you their mood or what they want to watch.
You MUST choose 3 to 4 best matching movies ONLY from the provided candidate list.
DO NOT hallucinate or suggest any movie that is not in the provided candidates list.
Return ONLY a valid JSON object with the exact schema:
{
  "recommendations": [
    {
      "movieId": "<exact_id_from_candidates>",
      "matchScore": <integer between 75 and 99>,
      "reason": "<one concise natural sentence explaining why this fits their exact mood/constraints>"
    }
  ]
}`;

  const userMessage = `User request: "${prompt}"

Available candidate movies from database:
${JSON.stringify(candidatesSummary)}

Select the 3-4 best matches and return JSON:`;

  const requestBody = JSON.stringify({
    model: 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              return reject(new Error(`Groq API returned HTTP ${res.statusCode}: ${data}`));
            }
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.message?.content;
            const result = JSON.parse(content);
            if (Array.isArray(result.recommendations) && result.recommendations.length > 0) {
              resolve(result.recommendations);
            } else {
              reject(new Error('Invalid response format from Groq'));
            }
          } catch (err) {
            reject(err);
          }
        });
      }
    );

    req.on('error', reject);
    req.write(requestBody);
    req.end();
  });
}

export async function getMoodRecommendations(
  prompt: string,
  quickMood?: string
): Promise<MoodRecommendation[]> {
  const queryText = (prompt || quickMood || '').toLowerCase();

  // 1. Parse runtime constraints from prompt
  let maxRuntime: number | null = null;
  if (/under\s+(?:2|two)\s+hours?/i.test(queryText) || /less\s+than\s+(?:2|two)\s+hours?/i.test(queryText)) {
    maxRuntime = 120;
  } else if (/under\s+90\s+min/i.test(queryText) || /short/i.test(queryText)) {
    maxRuntime = 100;
  } else if (/under\s+(\d+)\s+min/i.test(queryText)) {
    const match = queryText.match(/under\s+(\d+)\s+min/i);
    if (match) maxRuntime = parseInt(match[1]);
  }

  // 2. Fetch candidate movies from PostgreSQL database
  const allMovies = await prisma.movie.findMany({
    where: {
      ...(maxRuntime ? { runtime: { lte: maxRuntime } } : {}),
    },
    include: {
      genres: { include: { genre: true } },
      directors: { include: { director: true } },
      cast: { take: 3, include: { castMember: true } },
    },
    orderBy: { popularity: 'desc' },
  });

  const movieMap = new Map(allMovies.map((m) => [m.id, m]));

  // 3. Try Groq Cloud LLM (openai/gpt-oss-120b) if API key is present
  const apiKey = process.env.AI_API_KEY || process.env.GROQ_API_KEY;
  if (apiKey && apiKey.startsWith('gsk_')) {
    try {
      console.log('[AI Mood] Invoking Groq Cloud model: openai/gpt-oss-120b...');
      const llmResults = await callGroqLLM(prompt || quickMood || '', allMovies);

      const recommendations: MoodRecommendation[] = [];
      for (const item of llmResults) {
        const movie = movieMap.get(item.movieId);
        if (movie) {
          recommendations.push({
            movieId: movie.id,
            movie,
            matchScore: Math.min(99, Math.max(65, item.matchScore || 90)),
            reason: item.reason,
          });
        }
      }

      if (recommendations.length > 0) {
        console.log(`[AI Mood] Successfully generated ${recommendations.length} recommendations using openai/gpt-oss-120b on Groq Cloud.`);
        return recommendations;
      }
    } catch (err) {
      console.warn('[AI Mood] Groq Cloud invocation error, falling back to local NLP engine:', (err as Error).message);
    }
  }

  // 4. Fallback: Intelligent Local Scoring Engine
  const scored = allMovies.map((movie) => {
    let score = 50;
    const movieText = `${movie.title} ${movie.description} ${movie.genres.map((g) => g.genre.name).join(' ')}`.toLowerCase();
    const movieGenres = movie.genres.map((g) => g.genre.name.toLowerCase());

    if (quickMood && QUICK_MOODS[quickMood]) {
      const preset = QUICK_MOODS[quickMood];
      const matchedGenre = preset.genres.some((g) => movieGenres.includes(g.toLowerCase()));
      if (matchedGenre) score += 30;
      preset.keywords.forEach((kw) => {
        if (movieText.includes(kw)) score += 8;
      });
    }

    const words = queryText.split(/\s+/).filter((w) => w.length > 2);
    words.forEach((w) => {
      if (movieText.includes(w)) score += 10;
    });

    score += movie.imdbRating * 2;

    let runtimeReason = '';
    if (maxRuntime && movie.runtime <= maxRuntime) {
      score += 15;
      runtimeReason = `under ${Math.round(maxRuntime / 60)} hours (${movie.runtime}m)`;
    }

    const mainGenre = movie.genres[0]?.genre.name || 'Movie';
    const primaryDirector = movie.directors[0]?.director.name;

    let reason = '';
    if (quickMood && QUICK_MOODS[quickMood]) {
      reason = QUICK_MOODS[quickMood].tone;
      if (runtimeReason) reason += ` Perfectly sized at ${movie.runtime}m.`;
    } else if (queryText.includes('tired') || queryText.includes('college') || queryText.includes('relax')) {
      reason = `Light and entertaining ${mainGenre.toLowerCase()} that is easy to enjoy without heavy mental strain (${movie.runtime}m).`;
    } else if (queryText.includes('thrill') || queryText.includes('dark')) {
      reason = `Tense, gripping storytelling from ${primaryDirector || 'acclaimed filmmakers'} with sharp twists.`;
    } else if (queryText.includes('funny') || queryText.includes('comedy') || queryText.includes('laugh')) {
      reason = `High-energy humor with witty characters and great comedic timing (${movie.runtime}m).`;
    } else if (queryText.includes('exciting') || queryText.includes('action')) {
      reason = `Thrilling cinematic spectacle with relentless pacing and unforgettable action sequences.`;
    } else {
      reason = `Top pick matching your mood: acclaimed ${mainGenre.toLowerCase()} masterpiece rated ${movie.imdbRating}/10.`;
    }

    return {
      movieId: movie.id,
      movie,
      matchScore: Math.min(99, Math.max(65, Math.round(score))),
      reason,
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, 4);
}
