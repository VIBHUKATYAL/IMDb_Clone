# IMDb Clone Platform (CinePulse) — Complete Project Log & Architecture

This document provides a comprehensive record of the full-stack IMDb-style platform built, tested, and verified end-to-end.

---

## 1. Project Overview & Tech Stack

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite 5, Tailwind CSS, Lucide Icons, Axios, React Router DOM v6
- **Backend**: Node.js, Express, TypeScript, tsx, CORS, dotenv, Zod validation
- **Database & ORM**: PostgreSQL 18.7 with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) with 7-day expiration, bcryptjs password hashing (10 salt rounds)
- **Special Features**:
  1. **Personal Match Score (⭐)**: Advanced behavior-based recommendation score (0-100%) calculated via `personalMatchService` using user ratings, watchlist history, favorite genres, director affinity, and runtime preferences + "Why this matches you" explanatory breakdown.
  2. **AI Mood Mode (🤖 ⭐)**: Natural language mood-based movie discovery restricted strictly to the database catalog via backend AI service + 7 quick mood filters (😄 Funny, 😱 Thriller, ❤️ Romantic, 😭 Emotional, 🧠 Mind-Bending, 🔥 Action, 😌 Relaxing).
- **Movie Catalog**: High-quality dataset of 176 well-structured movies with real poster backdrops, directors, cast, genres, ratings, runtimes, and synopses.

---

## 2. All Phases Roadmap & Completion Status

- [x] **Phase 1: Project Foundation** — Setup monorepo, Express API, PostgreSQL, Prisma ORM, health endpoint, seed script.
- [x] **Phase 2: Authentication** — Register, login, logout, password hashing, JWT middleware, Me endpoint, AuthContext.
- [x] **Phase 3: Main IMDb-Style UI** — Hero carousel with trailer modal, featured, trending, top rated, genre rows, reusable MovieCard.
- [x] **Phase 4: Search** — Real database search, debounced autocomplete suggestions dropdown, title/genre/director matching.
- [x] **Phase 5: Movie Listing** — Filterable `/movies` page with search, genre, year, rating, language, sorting, pagination.
- [x] **Phase 6: Movie Detail Page** — `/movie/:id` with large backdrop, poster, trailer embed, cast, directors, genres, similar movies.
- [x] **Phase 7: Ratings & Reviews** — 1-10 star rating selector, review write/edit/delete, helpful voting, rating distribution bar chart.
- [x] **Phase 8: Watchlist** — Add/remove, live badge counter, persisted in PostgreSQL, dedicated `/watchlist` page.
- [x] **Phase 9: User Profile** — `/profile` with stats (movies rated, reviews written, watchlist count, avg rating given), favorite genres, activity history.
- [x] **Phase 10: Personal Match Score (⭐)** — Mathematical behavioral scoring (0-100%) + "Why this matches you" explanations + onboarding rating modal for new users.
- [x] **Phase 11: AI Mood Mode (🤖 ⭐)** — Natural language prompt processing, runtime constraint parsing, 7 quick mood buttons, strictly grounded candidate scoring.
- [x] **Phase 12: Personalized Home** — Dynamic rows ("Because you rated...", "90%+ Matches for you") rendered for authenticated users.
- [x] **Phase 13: UI Polish** — IMDb dark theme (#121212, #1A1A1A, #F5C518 gold), responsive layout, toast notification alerts.
- [x] **Phase 14: Final Testing & Verification** — Complete 17-step user flow test suite executed and passed with 100% success rate.

---

## 3. How to Run the Application

### Running Services
To run the database, backend, and frontend concurrently in one terminal:
```bash
npm run dev
```

Or individually:
- **PostgreSQL Database**: `npm run db:start` (starts embedded PostgreSQL on port `5432`)
- **Backend API**: `npm run server` (starts Express server on `http://localhost:5000`)
- **Frontend App**: `npm run client` (starts Vite dev server on `http://localhost:5173`)

### Database Utilities
- **Sync Prisma schema**: `npm run db:push`
- **Re-seed catalog (176 movies)**: `npm run db:seed`

---

## 4. Test Accounts

| Email | Password | Role / Taste Profile |
|---|---|---|
| `demo@example.com` | `password123` | Demo User (with sample ratings, reviews, watchlist entries) |
| `critic@example.com` | `password123` | Film Critic |
| `admin@example.com` | `password123` | Administrator |

---

## 5. API Endpoints Reference

### Health
- `GET /api/health` — System status & database connectivity check

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Sign in and receive JWT token
- `POST /api/auth/logout` — Terminate session
- `GET /api/auth/me` — Retrieve current authenticated user profile & activity counts

### Movies
- `GET /api/movies` — List movies with pagination, search, genre, year, rating, sort
- `GET /api/movies/featured` — Top featured movies for hero banner
- `GET /api/movies/trending` — Trending movies sorted by popularity
- `GET /api/movies/top-rated` — Highest IMDb rated movies
- `GET /api/movies/popular` — Popular audience choices
- `GET /api/movies/by-genre?genre=...` — Filter by genre
- `GET /api/movies/search?q=...` — Partial matching on title, description, director, cast
- `GET /api/movies/recommendations` — Personalized rows for authenticated user
- `GET /api/movies/:id` — Complete movie details, cast, crew, distribution, similar titles
- `GET /api/movies/:id/match` — Personal Match Score (0-100%) and reasons

### Reviews & Ratings
- `GET /api/movies/:id/reviews` — Reviews for a movie
- `POST /api/movies/:id/reviews` — Submit or update rating & review
- `DELETE /api/reviews/:id` — Delete a review
- `POST /api/reviews/:id/like` — Toggle helpful vote on a review

### Watchlist
- `GET /api/watchlist` — Full list of watchlisted movies
- `GET /api/watchlist/ids` — Array of movie IDs for fast card checks
- `POST /api/watchlist/:movieId` — Add movie to watchlist
- `DELETE /api/watchlist/:movieId` — Remove movie from watchlist

### Profile & Taste Onboarding
- `GET /api/profile` — User profile, rated movies, watchlist
- `GET /api/profile/stats` — Aggregated user viewing and rating statistics
- `POST /api/profile/onboarding` — Rate 5-10 movies to initialize taste profile

### AI Mood Mode
- `POST /api/ai/mood` — Natural language prompt + quick moods recommendations strictly from database powered by Groq Cloud model `openai/gpt-oss-120b`.

---

## 6. End-to-End Verification Test Results

```text
[1/17] Registering new user... -> Status: 201 | PASS
[2/17] Testing user login... -> Status: 200 | PASS
[3/17] Browsing catalog (featured, trending, top-rated)... -> Status: 200 | PASS
[4/17] Searching movies for "dark"... -> Status: 200, 4 matches | PASS
[5/17] Filtering movies by Genre="Action", Year=2008, MinRating=8.0... -> Status: 200 | PASS
[6/17] Opening movie details... -> Status: 200 | PASS
[7/17] Adding movie to watchlist... -> Status: 200 | PASS
[8 & 9/17] Submitting 10-star rating and written review... -> Status: 201 | PASS
[10/17] Liking the submitted review... -> Status: 200 | PASS
[11/17] Visiting user profile and statistics... -> Status: 200 | PASS
[12/17] Checking Personal Match Score... -> Score: 99% with computed reasons | PASS
[13 & 14/17] Testing AI Mood Mode... -> Status: 200, 4 grounded recommendations | PASS
[15/17] Testing user logout... -> Status: 200 | PASS
[16/17] Logging back in... -> Status: 200 | PASS
[17/17] Verifying persisted data in PostgreSQL... -> Watchlist & Reviews Persisted | PASS
```

---

## 7. AI Mood Mode & Groq Cloud Model Details

- **Model Configured**: `openai/gpt-oss-120b` (hosted on Groq Cloud via OpenAI-compatible Chat Completions API).
- **Endpoint**: `https://api.groq.com/openai/v1/chat/completions`
- **Authentication**: `AI_API_KEY` loaded from `.env`.
- **Anti-Hallucination Architecture**:
  1. The user's prompt is analyzed and mapped to candidate movies filtered directly from PostgreSQL.
  2. Compact candidate metadata (IDs, titles, runtime, genres, rating, synopsis) is submitted to `openai/gpt-oss-120b`.
  3. The model selects the top 3-4 movies strictly from the provided candidate IDs and formulates personalized rationale sentences for each.
  4. Full movie objects are populated from PostgreSQL and returned to the UI.
- **Live Test Verification**:
  - Prompt: `"mind-bending sci-fi thriller with a plot twist"`
  - Status: `200 OK` (sub-second response time).
  - Selected Matches: *Inception* (95%), *The Matrix* (94%), *Nope* (90%).
  - Real Model Rationale: *"Inception blends sci‑fi concepts with a mind‑bending heist and a shocking plot twist."*

---

## 8. GitHub Repository

- **Remote URL**: `https://github.com/VIBHUKATYAL/IMDb_Clone.git`
- **Branch**: `main`
- **Commit**: `105b4a0` — *"Initial commit: CinePulse full-stack IMDb clone with AI Mood Mode and Personal Match Score"*
- **Pushed Status**: Successfully pushed and up-to-date with `origin/main`.


