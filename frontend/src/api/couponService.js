import API from './api';

export const couponService = {
  validateCoupon: async (code) => {
    const res = await API.post('/coupons/validate', { code: code.trim().toUpperCase() });
    return res.data.data;
  },

  // Admin endpoints (path: /admin/coupon)
  getAll: async () => {
    const res = await API.get('/admin/coupon');
    return res.data.data || [];
  },

  create: async (payload) => {
    const res = await API.post('/admin/coupon', payload);
    return res.data.data;
  },

  deactivate: async (id) => {
    const res = await API.delete(`/admin/coupon/${id}`);
    return res.data.data;
  },
};
