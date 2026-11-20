# MASTER BUILD PROMPT — IMDb-STYLE MOVIE PLATFORM

You are an expert full-stack engineer and UI/UX developer.

Build a **fully functional IMDb-style movie discovery platform** from scratch.

The project must have:
1. A polished IMDb-inspired frontend and user experience
2. A real working backend
3. A real database
4. Authentication
5. Movie browsing/search/filtering
6. Movie detail pages
7. Ratings and reviews
8. Watchlist
9. User profiles
10. Fully working interactions
11. Two original features:
   - Personal Match Score
   - AI Mood Mode

IMPORTANT:
This is NOT a static UI mockup.
Every important interaction must actually work end-to-end.

Do not create fake buttons that do nothing.

Do not leave TODOs or placeholder functionality for core features.

Use your own branding/name/assets instead of copying IMDb's proprietary logo, exact branding, or copyrighted assets.

---

# 1. PRIMARY GOAL

Create a movie platform that feels like a modern, production-quality IMDb alternative.

The user should be able to:

- Register
- Login/logout
- Browse movies
- Search movies
- Filter movies
- Sort movies
- Open movie details
- View cast/crew
- View ratings
- Submit ratings
- Write reviews
- Like reviews
- Add/remove movies from watchlist
- View watchlist
- View personal profile
- See their movie activity
- Receive personalized movie recommendations
- Use AI Mood Mode

The application must be responsive on:
- Desktop
- Tablet
- Mobile

---

# 2. TECH STACK

Use a practical stack that can be developed quickly and reliably.

Frontend:
- React
- TypeScript
- Vite or Next.js
- Tailwind CSS
- Lucide icons

Backend:
- Node.js
- Express OR Next.js API routes
- TypeScript

Database:
- PostgreSQL

ORM:
- Prisma

Authentication:
- JWT or secure session-based authentication
- bcrypt/password hashing

AI:
- Use an LLM API only where actually required for AI Mood Mode.
- Keep the AI integration isolated behind a backend API endpoint.
- Never expose API keys in frontend code.

Movie data:
- Use a legitimate movie API if available.
- Otherwise create a well-structured local seed dataset with enough movies to make the application usable.

Use environment variables for:
- DATABASE_URL
- AI_API_KEY
- MOVIE_API_KEY if applicable
- AUTH_SECRET

Create `.env.example`.

---

# 3. PROJECT STRUCTURE

Use a clean structure similar to:

/client or /src
  /components
  /pages
  /layouts
  /hooks
  /services
  /utils
  /types

/server
  /controllers
  /routes
  /services
  /middleware
  /utils

/prisma
  schema.prisma
  seed.ts

Do NOT over-engineer the application.

Prioritize functionality and clean architecture.

---

# 4. DATABASE DESIGN

Create a proper relational schema.

Minimum entities:

User
- id
- name
- email
- passwordHash
- avatar
- createdAt

Movie
- id
- title
- description
- posterUrl
- backdropUrl
- releaseDate
- runtime
- language
- country
- imdbRating
- popularity
- voteCount
- trailerUrl

Genre
- id
- name

MovieGenre
- movieId
- genreId

CastMember
- id
- name
- photoUrl
- biography

MovieCast
- movieId
- castMemberId
- character
- castOrder

Director
- id
- name

MovieDirector
- movieId
- directorId

Review
- id
- userId
- movieId
- rating
- title
- content
- likes
- createdAt

Watchlist
- id
- userId
- movieId
- createdAt

UserMovieInteraction
- id
- userId
- movieId
- interactionType
- value
- createdAt

Possible interaction types:
- VIEW
- LIKE
- DISLIKE
- RATE
- WATCHLIST_ADD
- WATCHLIST_REMOVE

Create proper foreign keys and indexes.

Prevent duplicate watchlist entries and duplicate ratings where appropriate.

---

# 5. PHASED DEVELOPMENT

DO NOT attempt to build everything blindly in one step.

Work through these phases sequentially.

After completing each phase:

1. Run the application.
2. Test the functionality.
3. Fix errors.
4. Check browser console.
5. Check backend logs.
6. Check database operations.
7. Only then move to the next phase.

Never move forward while the current phase has broken core functionality.

---

# PHASE 1 — PROJECT FOUNDATION

Set up:

- Frontend
- Backend
- PostgreSQL
- Prisma
- Environment configuration
- Basic routing
- Error handling
- API structure
- Database connection

Create:

GET /api/health

It should return:

{
  "status": "ok"
}

Create database migrations.

Create seed script.

Seed enough movie data for development.

Verify:

Frontend → Backend → Database

all communicate correctly.

---

# PHASE 2 — AUTHENTICATION

Implement:

- Register
- Login
- Logout
- Password hashing
- Authentication middleware
- Current-user endpoint

Routes:

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me

Frontend:

- Login page
- Register page
- Protected routes
- User state

Show the logged-in user's name/avatar in the navbar.

Test:

- Invalid credentials
- Duplicate email
- Successful login
- Logout
- Protected API access

---

# PHASE 3 — MAIN IMDb-STYLE UI

Create a polished movie platform layout.

Navbar:

- Logo / project name
- Search bar
- Movies
- TV Shows
- Watchlist
- Login/Profile

Homepage:

Hero section
Featured movie
Trending movies
Popular movies
Top rated movies
Upcoming movies
Genre sections

Movie cards must contain:

- Poster
- Title
- Year
- Rating
- Genre
- Watchlist button

Cards must actually link to movie detail pages.

Do NOT use generic empty placeholders if movie data is available.

---

# PHASE 4 — SEARCH

Implement real search.

Search should work against the backend/database.

Example:

GET /api/movies/search?q=inception

Support:

- title search
- partial matching
- genre
- year

Frontend search:

- Search suggestions
- Search results
- Loading state
- Empty state

Debounce search requests.

---

# PHASE 5 — MOVIE LISTING

Create:

/movies

Features:

- Search
- Genre filter
- Year filter
- Rating filter
- Language filter
- Sort by:
  - Popularity
  - Rating
  - Release date
  - Title

Use pagination or infinite loading.

Do not load thousands of records at once.

---

# PHASE 6 — MOVIE DETAIL PAGE

Create:

/movie/:id

Include:

- Large backdrop
- Poster
- Title
- Year
- Runtime
- Genres
- Rating
- Vote count
- Description
- Trailer
- Director
- Cast
- Reviews
- Similar movies
- Watchlist button
- Rate button

The page must fetch real data from the backend.

---

# PHASE 7 — RATINGS & REVIEWS

Users can:

- Give a 1–10 rating
- Write a review
- Edit their review
- Delete their review
- Like reviews

Show:

- Average rating
- Number of ratings
- Rating distribution
- Reviews sorted by:
  - Most helpful
  - Newest

Prevent unauthorized review editing/deleting.

---

# PHASE 8 — WATCHLIST

Implement:

Add to Watchlist
Remove from Watchlist
Check Watchlist status

Routes:

POST /api/watchlist/:movieId
DELETE /api/watchlist/:movieId
GET /api/watchlist

Create:

/watchlist

Display:

- Poster
- Title
- Rating
- Genre
- Release year
- Remove button

Persist everything in PostgreSQL.

---

# PHASE 9 — USER PROFILE

Create:

/profile

Show:

- Avatar
- Name
- Account creation date
- Rated movies
- Reviews
- Watchlist
- Recently viewed movies
- Favorite genres

Create a simple statistics section:

Movies rated
Reviews written
Watchlist count
Average rating given

---

# PHASE 10 — PERSONAL MATCH SCORE ⭐

THIS IS ONE OF THE TWO MAIN UNIQUE FEATURES.

Build a personalized movie matching system.

Every movie should display:

> 94% Match

The score must be personalized to the logged-in user.

Do NOT simply generate random percentages.

Calculate it using actual user behavior.

Use signals such as:

1. Movies the user rated highly
2. Genres the user frequently watches
3. Genres they rate highly
4. Directors they like
5. Runtime preference
6. Language preference
7. Similar movies
8. Watchlist activity

Create a backend service:

personalMatchService

Example scoring model:

Genre compatibility: 30%
Rating preference: 20%
Similar movies: 20%
Director preference: 10%
Runtime preference: 10%
Language preference: 10%

Normalize the result to:

0–100%

Display:

94% Match

Also show:

"Why this matches you"

Example:

94% Match

Because you:
- Frequently watch thrillers
- Rated similar movies 8+/10
- Prefer movies under 2.5 hours

This explanation must be generated from actual user data.

For a new user with insufficient history:

Show:

> Build your taste profile by rating a few movies.

Provide a quick onboarding flow where the user can rate 5–10 popular movies.

Use those ratings to initialize their taste profile.

---

# PHASE 11 — AI MOOD MODE 🤖 ⭐

THIS IS THE SECOND MAIN UNIQUE FEATURE.

Create a prominent button:

✨ AI Mood Mode

The user opens a dedicated modal/page.

Ask:

"What are you in the mood to watch?"

Allow natural language.

Examples:

"I'm tired after college and want something funny under 2 hours."

"I want a dark psychological thriller."

"I want something emotional but not depressing."

"I want an exciting movie for tonight."

The frontend sends the user's request to:

POST /api/ai/mood

Backend:

1. Receive user prompt.
2. Fetch relevant movies from the database.
3. Send only necessary movie metadata to the AI.
4. Ask the AI to rank/select movies based on the user's request.
5. Return structured JSON.

DO NOT allow the AI to invent movies.

The AI may ONLY recommend movies that exist in the supplied database.

Expected response:

{
  "recommendations": [
    {
      "movieId": 123,
      "matchScore": 94,
      "reason": "Funny, fast-paced and under two hours."
    }
  ]
}

Display 3–5 recommendations.

Each recommendation should show:

Poster
Title
Rating
Runtime
Genre
Match %
Reason

Example:

🎬 Game Night
94% Match

Comedy • Crime
1h 40m
⭐ 6.9

"Good fit because you asked for something funny, light and under two hours."

Include quick mood buttons:

😄 Funny
😱 Thriller
❤️ Romantic
😭 Emotional
🧠 Thought-provoking
🔥 Action
😌 Relaxing

These should work without requiring the user to type a prompt.

---

# PHASE 12 — PERSONALIZED HOME

Once the user has enough interaction data, personalize the homepage.

Sections:

"Because you watched..."
"Your top genres"
"95% matches for you"
"Based on your watchlist"
"Recommended for tonight"

Do not show personalized sections to logged-out users unless appropriate.

---

# PHASE 13 — UI POLISH

Make the application feel production quality.

Use:

- Dark cinematic theme
- Strong typography
- Large movie artwork
- Smooth hover states
- Skeleton loading
- Toast notifications
- Empty states
- Error states
- Responsive layouts
- Mobile navigation

Do not overuse animations.

Prioritize:

- readability
- spacing
- visual hierarchy
- fast navigation

Avoid:

- giant gradients everywhere
- unnecessary glassmorphism
- excessive animations
- random decorative UI

---

# PHASE 14 — FINAL TESTING

Perform a complete end-to-end test.

TEST USER FLOW:

1. Register
2. Login
3. Browse movies
4. Search movie
5. Filter movies
6. Open movie
7. Add to watchlist
8. Rate movie
9. Write review
10. Like review
11. Visit profile
12. Check personalized match
13. Use AI Mood Mode
14. Receive recommendations
15. Logout
16. Login again
17. Verify persisted data

Also test:

- Invalid login
- Empty search
- Movie not found
- API failure
- AI API failure
- Unauthorized API requests
- Duplicate watchlist
- Duplicate rating
- Mobile layout

Fix all critical errors.

---

# 6. API DESIGN

Use RESTful APIs.

Minimum:

AUTH
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me

MOVIES
GET /api/movies
GET /api/movies/:id
GET /api/movies/search
GET /api/movies/trending
GET /api/movies/top-rated

REVIEWS
GET /api/movies/:id/reviews
POST /api/movies/:id/reviews
PUT /api/reviews/:id
DELETE /api/reviews/:id
POST /api/reviews/:id/like

WATCHLIST
GET /api/watchlist
POST /api/watchlist/:movieId
DELETE /api/watchlist/:movieId

PROFILE
GET /api/profile
GET /api/profile/stats

PERSONALIZATION
GET /api/recommendations
GET /api/movies/:id/match

AI
POST /api/ai/mood

---

# 7. IMPORTANT ENGINEERING RULES

## Never fake functionality

If a button exists, it must work.

If something cannot be implemented in the current phase, do not pretend it works.

## Never hardcode personalized scores

Personal Match Score must use actual user data.

## Never let AI hallucinate movies

AI recommendations must be restricted to movies supplied by the backend.

## Never expose API keys

All secrets must remain server-side.

## Validate all input

Use proper validation for:

- email
- password
- ratings
- review content
- movie IDs
- API parameters

## Handle loading/error states

Every asynchronous operation needs:

- loading
- success
- error
- empty state where relevant

## Maintainability

Use reusable components.

Do not duplicate the same movie-card code throughout the application.

---

# 8. PERFORMANCE

The application should feel fast.

Implement:

- Lazy loading
- Image optimization where possible
- API pagination
- Debounced search
- Database indexes
- Efficient Prisma queries
- Avoid unnecessary API calls
- Cache static movie information where appropriate

Do not fetch entire tables when only a small subset is required.

---

# 9. SEED DATA

If an external movie API is not configured, create a seed dataset with at least:

- 100 movies
- Multiple genres
- Different ratings
- Different runtimes
- Different languages
- Different release years
- Directors
- Cast
- Descriptions
- Posters/backdrops where legally usable

The dataset should be diverse enough for:

- search
- filters
- recommendations
- Personal Match Score
- AI Mood Mode

---

# 10. FINAL UX REQUIREMENT

The application should feel like:

"IMDb + personalized movie discovery."

The two standout features should be obvious from the homepage:

🎯 Personal Match

✨ AI Mood Mode

Do not bury them inside settings.

---

# 11. DEVELOPMENT PRIORITY

If time becomes limited, prioritize in this exact order:

1. Database
2. Backend APIs
3. Authentication
4. Movie browsing
5. Search
6. Movie details
7. Watchlist
8. Ratings/reviews
9. Personal Match Score
10. AI Mood Mode
11. Profile
12. Visual polish

A fully working simpler application is better than a beautiful application with broken backend functionality.

---

# 12. FINAL REQUIREMENT

At the end, provide:

1. Exact commands to install dependencies
2. Exact command to start PostgreSQL/database if necessary
3. Prisma migration command
4. Seed command
5. Backend start command
6. Frontend start command
7. Required `.env` variables
8. API documentation summary
9. Test account credentials if a seed account is created
10. A short list of everything implemented
11. Any known limitations

DO NOT claim something is implemented unless it has been tested.

START NOW.

Begin with PHASE 1 only.

After completing PHASE 1, verify it works before continuing to PHASE 2.
Do not skip phases.

Save each and everything discussed in chat.md so other ai could understand it 