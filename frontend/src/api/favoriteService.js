import API from './api';

export const favoriteService = {
  getFavorites: async () => {
    const res = await API.get('/favorites');
    return res.data.data || [];
  },

  addFavorite: async (productId) => {
    const res = await API.post(`/favorites/${productId}`);
    return res.data;
  },

  removeFavorite: async (productId) => {
    const res = await API.delete(`/favorites/${productId}`);
    return res.data;
  },
};
