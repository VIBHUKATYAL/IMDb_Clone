import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { WatchlistProvider } from './context/WatchlistContext.js';
import { Navbar } from './components/Navbar.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { HomePage } from './pages/HomePage.js';
import { MoviesPage } from './pages/MoviesPage.js';
import { MovieDetailPage } from './pages/MovieDetailPage.js';
import { WatchlistPage } from './pages/WatchlistPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { AIMoodModal } from './components/AIMoodModal.js';

export default function App() {
  const [aiModalOpen, setAiModalOpen] = useState(false);

  return (
    <AuthProvider>
      <ToastProvider>
        <WatchlistProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-[#121212] text-[#F5F5F5] flex flex-col font-sans selection:bg-[#F5C518] selection:text-black">
              <Navbar onOpenAIModal={() => setAiModalOpen(true)} />
              <main className="flex-1">
                <Routes>
                  {/* Public Browsing Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/movies" element={<MoviesPage />} />
                  <Route path="/movie/:id" element={<MovieDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/watchlist" element={<WatchlistPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <footer className="border-t border-[#2E2E2E] bg-[#121212] py-8 text-center text-xs text-neutral-500">
                <div className="max-w-7xl mx-auto px-4 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-neutral-400 font-bold">
                    <span>CinePulse</span>
                    <span>•</span>
                    <span className="text-[#F5C518]">IMDb-Inspired Cinema Platform</span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    Built with React, TypeScript, Tailwind CSS, Express, Prisma & PostgreSQL • Featuring Personal Match Score & AI Mood Mode
                  </p>
                </div>
              </footer>

              {/* Global AI Mood Modal */}
              <AIMoodModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />
            </div>
          </BrowserRouter>
        </WatchlistProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
