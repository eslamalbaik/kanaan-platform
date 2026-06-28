import API from './api';

export const categoryService = {
  getAllCategories: async () => {
    const res = await API.get('/categories');
    const data = res.data.data;
    return Array.isArray(data) ? data : [];
  },

  getDefaultCategoryId: async () => {
    const cats = await categoryService.getAllCategories();
    return cats[0]?._id || '';
  },

  createCategory: async (payload) => {
    const res = await API.post('/admin/categories', payload);
    return res.data.data;
  },

  updateCategory: async (id, payload) => {
    const res = await API.put(`/admin/categories/${id}`, payload);
    return res.data.data;
  },

  deleteCategory: async (id) => {
    await API.delete(`/admin/categories/${id}`);
  },

  // kept for backward compat - now saves via API
  saveAllCategories: async () => {},
};
