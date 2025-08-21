import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products';

const getProducts = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

const getProductById = async (id) => {
  const { data } = await axios.get(`${API_URL}/${id}`);
  return data;
};

const getMyProducts = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axios.get(`${API_URL}/myproducts`, config);
  return data;
};

const createProduct = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axios.post(API_URL, {}, config);
  return data;
};

const updateProduct = async (id, productData, token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axios.put(`${API_URL}/${id}`, productData, config);
  return data;
};

// --- NUEVA FUNCIÓN ---
// Función para eliminar un producto
const deleteProduct = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  await axios.delete(`${API_URL}/${id}`, config);
};


const productService = {
  getProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct, // <-- Añadido aquí
};

export default productService;