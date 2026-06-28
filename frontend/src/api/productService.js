import API from './api';

export const productService = {
  getProducts: async () => {
    const res = await API.get('/admin/products', { params: { limit: 100 } });
    const data = res.data.data;
    return Array.isArray(data) ? data : (data?.products || data || []);
  },

  addProduct: async (payload) => {
    const body = {
      name: payload.name,
      slug: payload.slug,
      price: payload.price,
      stockQuantity: payload.stockQuantity,
      description: payload.description,
      category: payload.category?._id || payload.category,
      attributes: payload.attributes || {},
      images: payload.images || [],
      isCustomizable: payload.isCustomizable || false,
    };
    const res = await API.post('/admin/products', body);
    const newProduct = res.data.data;
    const list = await productService.getProducts();
    return { newProduct, updatedList: list };
  },

  updateProduct: async (productId, payload) => {
    const body = {
      name: payload.name,
      slug: payload.slug,
      price: payload.price,
      stockQuantity: payload.stockQuantity,
      description: payload.description,
      category: payload.category?._id || payload.category,
      attributes: payload.attributes || {},
      images: payload.images || [],
      isCustomizable: payload.isCustomizable || false,
    };
    await API.put(`/admin/products/${productId}`, body);
    return await productService.getProducts();
  },

  deleteProduct: async (productId) => {
    await API.delete(`/admin/products/${productId}`);
    return await productService.getProducts();
  },

  getProductById: async (productId) => {
    try {
      const res = await API.get(`/products/${productId}`);
      const product = res.data.data;
      if (!product) return { product: null, relatedProducts: [] };

      const allRes = await API.get('/products', { params: { limit: 20 } });
      const allData = allRes.data.data;
      const all = Array.isArray(allData) ? allData : (allData?.products || []);

      const categoryId = product.category?._id || product.category;
      const related = all
        .filter(p => p._id !== productId && (p.category?._id || p.category) === categoryId)
        .slice(0, 8);

      return { product, relatedProducts: related };
    } catch {
      return { product: null, relatedProducts: [] };
    }
  },
};
