// frontend/src/components/profile/ProductPanel.js

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, Alert, Table, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../context/AuthContext'; // Ajustamos la ruta del import
import productService from '../../services/productService'; // Ajustamos la ruta del import

const ProductPanel = () => {
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);

  const loadMyProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getMyProducts();
      setProducts(data);
    } catch (err) {
      setError('No se pudieron cargar tus productos.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (userInfo?.tipoUsuario === 'tienda') {
      loadMyProducts();
    }
  }, [userInfo]);

  const createProductHandler = async () => {
    setLoadingCreate(true);
    setError('');
    try {
      const newProduct = await productService.createProduct();
      navigate(`/tienda/producto/${newProduct._id}/edit`);
    } catch (err) {
      const message = 
        (err.response && err.response.data && err.response.data.message) || 
        'Ocurrió un error inesperado.';
      setError(message);
      setLoadingCreate(false);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await productService.deleteProduct(id);
        loadMyProducts();
      } catch (err) {
        setError('No se pudo eliminar el producto.');
      }
    }
  };

  return (
    <Card className="p-4 border-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Panel de Productos</h2>
        <Button variant="primary" onClick={createProductHandler} disabled={loadingCreate}>
          {loadingCreate ? <Spinner as="span" animation="border" size="sm" /> : <><FontAwesomeIcon icon={faPlus} className="me-2" /> Crear Producto</>}
        </Button>
      </div>
      {loading ? <div className="text-center"><Spinner animation="border" /></div> : error ? <Alert variant="danger">{error}</Alert> : (
        <Table striped bordered hover responsive>
          <thead><tr><th>ID</th><th>NOMBRE</th><th>PRECIO</th><th>STOCK</th><th>ACCIONES</th></tr></thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product._id}</td><td>{product.nombre}</td><td>₡{product.precio.toLocaleString('es-CR')}</td><td>{product.stock}</td>
                <td>
                  <Button as={Link} to={`/tienda/producto/${product._id}/edit`} variant="light" size="sm" className="me-2"><FontAwesomeIcon icon={faEdit} /></Button>
                  <Button variant="danger" size="sm" onClick={() => deleteHandler(product._id)}><FontAwesomeIcon icon={faTrash} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
};

export default ProductPanel;