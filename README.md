# 🎬 CinePulse — Full-Stack IMDb Clone

A modern, production-grade IMDb-style movie exploration and recommendation platform built with **React 18 + TypeScript + Vite**, **Node.js Express + TypeScript**, **PostgreSQL + Prisma ORM**, and **Groq Cloud AI (`openai/gpt-oss-120b`)**.

---

## ✨ Key Features

- **🎨 IMDb Dark-Theme UI**: High-fidelity dark aesthetic (#121212, #1A1A1A, #F5C518 gold accents), fully responsive layout.
- **🎞️ Hero Carousel & Trailer Player**: Dynamic featured movies banner with auto-scroll and integrated YouTube trailer modal.
- **🔍 Real-Time Search & Autocomplete**: Debounced search dropdown matching movie titles, descriptions, cast members, and directors.
- **📂 Filterable Catalog (`/movies`)**: Multi-filter catalog supporting search queries, genres, release year, minimum IMDb rating, sorting, and pagination.
- **📄 Deep Movie Detail Pages (`/movie/:id`)**: High-res backdrop, synopsis, runtime, box office stats, director & cast cards, and similar movie recommendations.
- **⭐ 1-10 Star Rating & Review System**: Interactive star selector, written user reviews, review editing/deletion, and helpful review upvotes with a rating distribution chart.
- **📌 Interactive Watchlist**: Add/remove movies instantly with optimistic UI updates and persistent storage in PostgreSQL.
- **👤 User Profile & Statistics**: Viewing habits summary, favorite genres breakdown, rated movies, and reviews history.
- **⭐ Personal Match Score**: Behavioral recommendation engine (0-100%) calculated based on user ratings, genres, runtime preferences, and director affinity with "Why this matches you" explanations.
- **🤖 AI Mood Mode (Groq Cloud 120B)**: Natural language movie discovery powered by Groq Cloud model `openai/gpt-oss-120b`, strictly grounded in PostgreSQL catalog candidate movies to avoid hallucinations + 7 quick mood filters.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Bundler & Dev Server**: Vite 5
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js with TypeScript (`tsx`)
- **Web Framework**: Express 4
- **ORM**: Prisma ORM v5
- **Validation**: Zod
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs password hashing

### Database & AI
- **Database**: PostgreSQL (with embedded database support)
- **Catalog Dataset**: 176 carefully curated movies, 20 genres, 102 directors, 297 cast members
- **AI Recommendation Engine**: Groq Cloud API with `openai/gpt-oss-120b`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Clone the repository
```bash
git clone https://github.com/VIBHUKATYAL/IMDb_Clone.git
cd IMDb_Clone
```

### 2. Install dependencies
```bash
# Install root and backend dependencies
npm install

# Install client dependencies
npm --prefix client install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update `.env` with your settings:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/imdb_clone?schema=public"
PORT=5000
AUTH_SECRET="your-jwt-secret-key"
AI_API_KEY="your-groq-api-key"
CLIENT_URL="http://localhost:5173"
```

### 4. Database Setup & Seeding
```bash
# Start the local database
npm run db:start

# Push schema to database
npm run db:push

# Seed catalog (176 movies, genres, cast, crew, test accounts)
npm run db:seed
```

### 5. Run the Application
Run both backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 👥 Demo Accounts

| Email | Password | Role |
|---|---|---|
| `demo@example.com` | `password123` | Active User (with pre-loaded ratings, reviews & watchlist) |
| `critic@example.com` | `password123` | Film Critic |
| `admin@example.com` | `password123` | Admin User |

---

## 📡 API Overview

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | Register a new user |
| `/api/auth/login` | POST | Sign in with email and password |
| `/api/auth/me` | GET | Retrieve authenticated user profile |
| `/api/movies` | GET | Filter and paginate movies |
| `/api/movies/featured` | GET | Featured hero banner movies |
| `/api/movies/trending` | GET | Trending movies |
| `/api/movies/top-rated` | GET | Top rated IMDb movies |
| `/api/movies/search` | GET | Live search autocomplete |
| `/api/movies/:id` | GET | Full movie details with cast and reviews |
| `/api/movies/:id/match`| GET | Personal Match Score & breakdown |
| `/api/movies/:id/reviews` | POST | Submit rating and review |
| `/api/watchlist` | GET/POST/DELETE | Manage personal watchlist |
| `/api/profile` | GET | User stats and rated history |
| `/api/ai/mood` | POST | Groq Cloud 120B AI mood recommendations |

---

## 📄 License
MIT
