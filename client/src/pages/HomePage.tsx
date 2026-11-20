import React, { useState, useEffect } from 'react';
import { Sparkles, Compass } from 'lucide-react';
import { movieService, RecommendationSection } from '../services/movieService.js';
import { Movie } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { HeroCarousel } from '../components/HeroCarousel.js';
import { MovieSection } from '../components/MovieSection.js';
import { AIMoodModal } from '../components/AIMoodModal.js';
import { OnboardingModal } from '../components/OnboardingModal.js';

export const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [scifiMovies, setScifiMovies] = useState<Movie[]>([]);
  const [comedyMovies, setComedyMovies] = useState<Movie[]>([]);
  const [personalizedSections, setPersonalizedSections] = useState<RecommendationSection[]>([]);

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [feat, trend, pop, top, act, sci, com] = await Promise.all([
        movieService.getFeatured(),
        movieService.getTrending(),
        movieService.getPopular(),
        movieService.getTopRated(),
        movieService.getByGenre('Action'),
        movieService.getByGenre('Sci-Fi'),
        movieService.getByGenre('Comedy'),
      ]);

      setFeaturedMovies(feat);
      setTrendingMovies(trend);
      setPopularMovies(pop);
      setTopRatedMovies(top);
      setActionMovies(act);
      setScifiMovies(sci);
      setComedyMovies(com);

      if (isAuthenticated) {
        const recs = await movieService.getPersonalizedRecommendations();
        setPersonalizedSections(recs);
      }
    } catch (err) {
      console.error('Failed to load homepage data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Hero Carousel */}
      <HeroCarousel movies={featuredMovies} onOpenAIModal={() => setAiModalOpen(true)} />

      {/* AI Mood Mode Banner (Prominent Homepage Callout) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#1A1A1A] to-neutral-900 border border-[#F5C518]/30 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 bg-[#F5C518] text-black text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Mood Mode</span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Not sure what to watch? Let AI find the exact match.
          </h3>
          <p className="text-xs md:text-sm text-neutral-300 max-w-xl">
            Type anything like <i>"I'm tired and want something funny under 2 hours"</i> or pick a mood—strictly grounded in 176+ real movies.
          </p>
        </div>

        <button
          onClick={() => setAiModalOpen(true)}
          className="shrink-0 bg-[#F5C518] hover:bg-amber-400 text-black font-extrabold text-xs md:text-sm px-6 py-3 rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 fill-black" />
          <span>Launch AI Mood Mode</span>
        </button>
      </div>

      {/* Taste Profile Banner for Logged-In Users with little history */}
      {isAuthenticated && (!user?.stats?.reviewsCount || user.stats.reviewsCount === 0) && (
        <div className="bg-[#1A1A1A] border border-neutral-700 p-4 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Unlock Your Personal Match Score</h4>
              <p className="text-xs text-neutral-400">
                Rate 5 popular movies to activate your personalized taste profile.
              </p>
            </div>
          </div>
          <button
            onClick={() => setOnboardingOpen(true)}
            className="text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white px-3.5 py-2 rounded-lg border border-neutral-600 transition shrink-0"
          >
            Rate 5 Movies
          </button>
        </div>
      )}

      {/* Personalized Sections (When Authenticated) */}
      {personalizedSections.map((section, idx) => (
        <MovieSection
          key={idx}
          title={section.title}
          subtitle="Calculated uniquely from your viewing and rating signals"
          movies={section.movies}
          showPersonalMatch={true}
        />
      ))}

      {/* Loading Skeleton */}
      {loading && (
        <div className="py-12 flex justify-center items-center">
          <div className="w-8 h-8 border-2 border-[#F5C518] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Standard Categorized Movie Sections */}
      {!loading && (
        <>
          <MovieSection
            title="Trending Top 10"
            subtitle="Most viewed and discussed titles this week"
            movies={trendingMovies}
            showPersonalMatch={isAuthenticated}
          />

          <MovieSection
            title="Fan Favorites & Top Rated"
            subtitle="The highest community rated masterpieces of all time"
            movies={topRatedMovies}
            showPersonalMatch={isAuthenticated}
          />

          <MovieSection
            title="Popular CinePulse Picks"
            subtitle="Audience choices recommended for movie night"
            movies={popularMovies}
            showPersonalMatch={isAuthenticated}
          />

          <MovieSection
            title="High-Octane Action"
            subtitle="Adrenaline-fueled setpieces and adventures"
            movies={actionMovies}
            showPersonalMatch={isAuthenticated}
          />

          <MovieSection
            title="Sci-Fi & Mind-Benders"
            subtitle="Space exploration, future technology, and altered realities"
            movies={scifiMovies}
            showPersonalMatch={isAuthenticated}
          />

          <MovieSection
            title="Laugh Out Loud Comedies"
            subtitle="Hilarious, lighthearted, and guaranteed mood boosters"
            movies={comedyMovies}
            showPersonalMatch={isAuthenticated}
          />
        </>
      )}

      {/* Modals */}
      <AIMoodModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
      <OnboardingModal
        sampleMovies={topRatedMovies}
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onComplete={loadData}
      />
    </div>
  );
};
