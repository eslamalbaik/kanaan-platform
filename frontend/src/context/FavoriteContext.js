import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { favoriteService } from '../api/favoriteService';
import { useAuth } from './AuthContext';

const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]); // array of product objects
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user || user.role === 'admin') return;
    setLoading(true);
    try {
      const data = await favoriteService.getFavorites();
      const validData = (data || []).filter(Boolean);
      setFavorites(validData);
      setFavoriteIds(new Set(validData.map(p => p._id)));
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      fetchFavorites();
    } else {
      setFavorites([]);
      setFavoriteIds(new Set());
    }
  }, [user, fetchFavorites]);

  const isFavorite = (productId) => favoriteIds.has(productId);

  const toggleFavorite = async (product) => {
    if (!user || user.role === 'admin') return;
    const productId = product._id || product.id;
    const alreadyFav = favoriteIds.has(productId);

    // optimistic update
    if (alreadyFav) {
      setFavoriteIds(prev => { const s = new Set(prev); s.delete(productId); return s; });
      setFavorites(prev => prev.filter(p => p._id !== productId));
      try {
        await favoriteService.removeFavorite(productId);
      } catch {
        // rollback
        setFavoriteIds(prev => new Set([...prev, productId]));
        setFavorites(prev => [...prev, product]);
      }
    } else {
      setFavoriteIds(prev => new Set([...prev, productId]));
      setFavorites(prev => [...prev, product]);
      try {
        await favoriteService.addFavorite(productId);
      } catch {
        // rollback
        setFavoriteIds(prev => { const s = new Set(prev); s.delete(productId); return s; });
        setFavorites(prev => prev.filter(p => p._id !== productId));
      }
    }
  };

  return (
    <FavoriteContext.Provider value={{ favorites, favoriteIds, isFavorite, toggleFavorite, fetchFavorites, loading }}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorite = () => useContext(FavoriteContext);
