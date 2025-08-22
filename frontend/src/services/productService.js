import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para añadir el token de autenticación a todas las peticiones
api.interceptors.request.use((config) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
  } catch (error) {
    console.error("Error parsing user info from localStorage", error);
  }
  return config;
});


// === PRODUCTOS ===

const getProducts = async () => {
  const { data } = await api.get('/products');
  return data;
};

const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

const getMyProducts = async () => {
  const { data } = await api.get('/products/myproducts');
  return data;
};

const createProduct = async () => {
  // El backend crea un producto de ejemplo, por eso el body es vacío {}
  const { data } = await api.post('/products', {});
  return data;
};

const updateProduct = async (id, productData) => {
  const { data } = await api.put(`/products/${id}`, productData);
  return data;
};

const deleteProduct = async (id) => {
  await api.delete(`/products/${id}`);
};


// === CATEGORÍAS ===

const getCategories = async () => {
    const { data } = await api.get('/categories');
    return data;
};


// === WISHLIST (ejemplo, si lo necesitas) ===
const getWishlist = async () => {
    const { data } = await api.get('/users/wishlist');
    return data;
};

const addToWishlist = async (productId) => {
    await api.post(`/users/wishlist/${productId}`);
};

const removeFromWishlist = async (productId) => {
    await api.delete(`/users/wishlist/${productId}`);
};


const productService = {
  getProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};

export default productService;