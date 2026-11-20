export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  stats?: {
    watchlistCount: number;
    reviewsCount: number;
  };
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface Genre {
  id: string;
  name: string;
}

export interface CastMember {
  id: string;
  name: string;
  photoUrl?: string;
  biography?: string;
  character?: string;
  castOrder?: number;
}

export interface Director {
  id: string;
  name: string;
}

export interface Review {
  id: string;
  userId: string;
  movieId: string;
  rating: number;
  title: string;
  content: string;
  likes: number;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  backdropUrl?: string;
  releaseDate: string;
  runtime: number;
  language: string;
  country: string;
  imdbRating: number;
  popularity: number;
  voteCount: number;
  trailerUrl?: string;
  genres?: { genre: Genre }[];
  cast?: { castMember: CastMember; character: string; castOrder: number }[];
  directors?: { director: Director }[];
  reviews?: Review[];
  matchScore?: number;
  matchReasons?: string[];
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  database: 'connected' | 'disconnected';
  timestamp: string;
  uptime: number;
}
