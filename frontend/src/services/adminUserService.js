// frontend/src/services/adminUserService.js
import axios from 'axios';
const withAuth = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const adminUserService = {
  list: async ({ token, search = '', page = 1, limit = 10 }) => {
    const { data } = await axios.get(
      `/api/admin/users?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`,
      withAuth(token)
    );
    return data; // {items:[{_id,nombre,email,tipoUsuario}], total, ...}
  },
};

export default adminUserService;
