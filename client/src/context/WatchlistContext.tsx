import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext.js';
import { useToast } from './ToastContext.js';

interface WatchlistContextType {
  watchlistIds: Set<string>;
  isWatchlisted: (movieId: string) => boolean;
  toggleWatchlist: (movieId: string, movieTitle?: string) => Promise<boolean>;
  refreshWatchlist: () => Promise<void>;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const { isAuthenticated, refreshUser } = useAuth();
  const { showToast } = useToast();

  const fetchWatchlistIds = useCallback(async () => {
    if (!isAuthenticated) {
      setWatchlistIds(new Set());
      return;
    }

    try {
      const res = await axios.get<{ movieIds: string[] }>('/api/watchlist/ids');
      setWatchlistIds(new Set(res.data.movieIds));
    } catch {
      // Ignore initial loading errors
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWatchlistIds();
  }, [fetchWatchlistIds]);

  const isWatchlisted = useCallback(
    (movieId: string) => watchlistIds.has(movieId),
    [watchlistIds]
  );

  const toggleWatchlist = async (movieId: string, movieTitle?: string): Promise<boolean> => {
    if (!isAuthenticated) {
      showToast('Please sign in to save movies to your watchlist', 'info');
      return false;
    }

    const currentlyWatchlisted = watchlistIds.has(movieId);

    // Optimistic UI update
    setWatchlistIds((prev) => {
      const updated = new Set(prev);
      if (currentlyWatchlisted) {
        updated.delete(movieId);
      } else {
        updated.add(movieId);
      }
      return updated;
    });

    try {
      if (currentlyWatchlisted) {
        await axios.delete(`/api/watchlist/${movieId}`);
        showToast(`Removed ${movieTitle ? `"${movieTitle}"` : 'movie'} from Watchlist`, 'info');
      } else {
        await axios.post(`/api/watchlist/${movieId}`);
        showToast(`Added ${movieTitle ? `"${movieTitle}"` : 'movie'} to Watchlist`, 'success');
      }
      refreshUser();
      return !currentlyWatchlisted;
    } catch {
      // Rollback on error
      setWatchlistIds((prev) => {
        const rolledBack = new Set(prev);
        if (currentlyWatchlisted) {
          rolledBack.add(movieId);
        } else {
          rolledBack.delete(movieId);
        }
        return rolledBack;
      });
      showToast('Failed to update watchlist. Please try again.', 'error');
      return currentlyWatchlisted;
    }
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlistIds,
        isWatchlisted,
        toggleWatchlist,
        refreshWatchlist: fetchWatchlistIds,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (!context) throw new Error('useWatchlist must be used within WatchlistProvider');
  return context;
};
