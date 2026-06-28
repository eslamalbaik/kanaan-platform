import API from './api';

export const cartService = {
  getCart: async () => {
    const res = await API.get('/cart');
    return { items: res.data.data?.items || [] };
  },

  addToCart: async (productId, quantity, attributes, customizationId) => {
    const body = { productId, quantity };
    if (attributes) body.attributes = attributes;
    if (customizationId) body.customizationId = customizationId;
    await API.post('/cart/items', body);
    const res = await API.get('/cart');
    return { items: res.data.data?.items || [] };
  },

  updateQuantity: async (itemId, newQuantity) => {
    await API.put(`/cart/items/${itemId}`, { quantity: newQuantity });
    const res = await API.get('/cart');
    return { items: res.data.data?.items || [] };
  },

  removeFromCart: async (itemId) => {
    await API.delete(`/cart/items/${itemId}`);
    const res = await API.get('/cart');
    return { items: res.data.data?.items || [] };
  },

  clearCart: async () => {
    await API.delete('/cart');
  },
};
