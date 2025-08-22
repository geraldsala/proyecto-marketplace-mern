import axios from 'axios';

// --- CONFIGURACIÓN CLAVE ---
// Creamos una instancia de axios que SIEMPRE apuntará a nuestro backend.
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // <-- LA LÍNEA MÁS IMPORTANTE
});

// Interceptor para añadir el token de autenticación a todas las peticiones
api.interceptors.request.use((config) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
  } catch (error) {
    console.error("Error al procesar userInfo desde localStorage", error);
  }
  return config;
});


// --- SERVICIOS ---

// PRODUCTOS
const getProducts = async () => { const { data } = await api.get('/products'); return data; };
const getProductById = async (id) => { const { data } = await api.get(`/products/${id}`); return data; };
const getMyProducts = async () => { const { data } = await api.get('/products/myproducts'); return data; };
const createProduct = async () => { const { data } = await api.post('/products', {}); return data; };
const updateProduct = async (id, productData) => { const { data } = await api.put(`/products/${id}`, productData); return data; };
const deleteProduct = async (id) => { await api.delete(`/products/${id}`); };

// CATEGORÍAS
const getCategories = async () => { const { data } = await api.get('/categories'); return data; };

// WISHLIST
const getWishlist = async () => { const { data } = await api.get('/users/wishlist'); return data; };
const addToWishlist = async (productId) => { await api.post(`/users/wishlist/${productId}`); };
const removeFromWishlist = async (productId) => { await api.delete(`/users/wishlist/${productId}`); };
const isInWishlist = async (productId) => {
    try {
        const wishlist = await getWishlist();
        return wishlist.some(item => item._id === productId);
    } catch (error) {
        return false;
    }
};

// SUSCRIPCIONES A TIENDAS
const toggleSubscription = async (storeId) => { await api.post('/storesubscriptions/toggle', { storeId }); };
const getMySubscriptions = async () => { const { data } = await api.get('/storesubscriptions/mystores'); return data; };
const getMySubscribers = async () => { const { data } = await api.get('/storesubscriptions/mysubscribers'); return data; };

// --- AÑADIDO: Servicio para el pop-up de suscripción ---
const subscribeToNewsletter = async (email) => {
    // Usamos nuestra instancia 'api' para que la llamada vaya al puerto 5000
    const { data } = await api.post('/subscribe', { email });
    return data;
};


const productService = {
  getProducts, getProductById, getMyProducts, createProduct, updateProduct, deleteProduct,
  getCategories,
  getWishlist, addToWishlist, removeFromWishlist, isInWishlist,
  toggleSubscription, getMySubscriptions, getMySubscribers,
  subscribeToNewsletter, // <-- Exportamos la nueva función
};

export default productService;