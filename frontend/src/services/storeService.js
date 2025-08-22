// frontend/src/services/storeService.js
import axios from 'axios';

const storeService = {
  // GET /api/stores/:slug → { _id, name, slug, logoUrl, isActive, ... }
  getBySlug: async (slug) => {
    const { data } = await axios.get(`/api/stores/${slug}`);
    return data;
  },

  // GET /api/stores/:slug/products?search=&page=&limit=&sort=
  // → { items: [...], total, pages }
  getProductsBySlug: async (
    slug,
    { search = '', page = 1, limit = 12, sort = 'latest' } = {}
  ) => {
    const { data } = await axios.get(
      `/api/stores/${slug}/products?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}&sort=${sort}`
    );
    return data;
  },
};

export default storeService;
