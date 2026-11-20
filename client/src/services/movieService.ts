import axios from 'axios';
import { Movie, Review } from '../types/index.js';

export interface MoviesListResponse {
  movies: Movie[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MovieDetailResponse {
  movie: Movie;
  ratingDistribution: Record<number, number>;
  similarMovies: Movie[];
  personalMatch: {
    matchScore: number;
    reasons: string[];
  } | null;
}

export interface RecommendationSection {
  title: string;
  type: string;
  movies: Movie[];
}

export interface MoodRecommendationItem {
  movieId: string;
  movie: Movie;
  matchScore: number;
  reason: string;
}

export const movieService = {
  getFeatured: async (): Promise<Movie[]> => {
    const res = await axios.get<{ movies: Movie[] }>('/api/movies/featured');
    return res.data.movies;
  },

  getTrending: async (): Promise<Movie[]> => {
    const res = await axios.get<{ movies: Movie[] }>('/api/movies/trending');
    return res.data.movies;
  },

  getTopRated: async (): Promise<Movie[]> => {
    const res = await axios.get<{ movies: Movie[] }>('/api/movies/top-rated');
    return res.data.movies;
  },

  getPopular: async (): Promise<Movie[]> => {
    const res = await axios.get<{ movies: Movie[] }>('/api/movies/popular');
    return res.data.movies;
  },

  getByGenre: async (genre: string, limit = 12): Promise<Movie[]> => {
    const res = await axios.get<{ movies: Movie[] }>('/api/movies/by-genre', {
      params: { genre, limit },
    });
    return res.data.movies;
  },

  getGenres: async (): Promise<{ id: string; name: string; movieCount: number }[]> => {
    const res = await axios.get<{ genres: { id: string; name: string; movieCount: number }[] }>(
      '/api/genres'
    );
    return res.data.genres;
  },

  search: async (q: string, genre?: string, year?: number, limit = 20): Promise<Movie[]> => {
    const res = await axios.get<{ movies: Movie[] }>('/api/movies/search', {
      params: { q, genre, year, limit },
    });
    return res.data.movies;
  },

  list: async (params: {
    page?: number;
    limit?: number;
    genre?: string;
    year?: number;
    minRating?: number;
    language?: string;
    sortBy?: string;
    search?: string;
  }): Promise<MoviesListResponse> => {
    const res = await axios.get<MoviesListResponse>('/api/movies', { params });
    return res.data;
  },

  getById: async (id: string): Promise<MovieDetailResponse> => {
    const res = await axios.get<MovieDetailResponse>(`/api/movies/${id}`);
    return res.data;
  },

  getPersonalizedRecommendations: async (): Promise<RecommendationSection[]> => {
    const res = await axios.get<{ sections: RecommendationSection[] }>(
      '/api/movies/recommendations'
    );
    return res.data.sections;
  },

  // Watchlist
  getWatchlist: async (): Promise<Movie[]> => {
    const res = await axios.get<{ watchlist: { movie: Movie }[] }>('/api/watchlist');
    return res.data.watchlist.map((w) => w.movie);
  },

  // Reviews
  addReview: async (movieId: string, data: { rating: number; title: string; content: string }): Promise<Review> => {
    const res = await axios.post<{ review: Review }>(`/api/movies/${movieId}/reviews`, data);
    return res.data.review;
  },

  deleteReview: async (reviewId: string): Promise<void> => {
    await axios.delete(`/api/reviews/${reviewId}`);
  },

  likeReview: async (reviewId: string): Promise<{ liked: boolean; likes: number }> => {
    const res = await axios.post<{ liked: boolean; likes: number }>(`/api/reviews/${reviewId}/like`);
    return res.data;
  },

  // AI Mood
  getMoodRecommendations: async (prompt?: string, quickMood?: string): Promise<MoodRecommendationItem[]> => {
    const res = await axios.post<{ recommendations: MoodRecommendationItem[] }>('/api/ai/mood', {
      prompt,
      quickMood,
    });
    return res.data.recommendations;
  },

  // Profile & Onboarding
  getProfile: async () => {
    const res = await axios.get('/api/profile');
    return res.data;
  },

  getProfileStats: async () => {
    const res = await axios.get('/api/profile/stats');
    return res.data;
  },

  saveOnboarding: async (ratings: { movieId: string; rating: number }[]) => {
    const res = await axios.post('/api/profile/onboarding', { ratings });
    return res.data;
  },
};
