import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';
import productService from '../services/productService';
import { useAuth } from '../context/AuthContext';

const ProductEditPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useAuth();
  
  // --- CAMBIO 1: Estado para guardar las categorías que vienen del backend ---
  const [categories, setCategories] = useState([]);
  
  // El estado del producto ahora está más limpio
  const [product, setProduct] = useState({
    nombre: '',
    precio: 0,
    imagenes: [],
    categoria: '', // Esto guardará el ID de la categoría
    stock: 0,
    descripcion: '',
    estado: 'nuevo',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadProductAndCategories = async () => {
      setLoading(true);
      try {
        // Pedimos el producto y las categorías al mismo tiempo para más eficiencia
        const [productData, categoriesData] = await Promise.all([
          productService.getProductById(productId),
          productService.getCategories()
        ]);

        // Nos aseguramos de que la categoría en el estado sea solo el ID
        if (productData.categoria && typeof productData.categoria === 'object') {
          productData.categoria = productData.categoria._id;
        }
        
        setProduct(productData);
        setCategories(categoriesData);

      } catch (err) {
        setError('No se pudo cargar la información del producto.');
      } finally {
        setLoading(false);
      }
    };
    loadProductAndCategories();
  }, [productId]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await productService.updateProduct(productId, product);
      navigate('/panel'); // Redirige al panel de la tienda
    } catch (err) {
      setError('No se pudo actualizar el producto.');
    }
  };

  const onChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };
  
  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }

  return (
    <Container className="py-4">
      <Link to="/panel" className="btn btn-light my-3">Volver al Panel</Link>
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Card className="p-4">
            <h1>Editar Producto</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={submitHandler}>
              {/* ... (campos de Nombre, Descripción, Imágenes, etc. se quedan igual) ... */}

              {/* --- CAMBIO 2: El menú desplegable de categorías ahora es dinámico --- */}
              <Form.Group controlId="categoria" className="mb-3">
                <Form.Label>Categoría</Form.Label>
                <Form.Select 
                  name="categoria" 
                  value={product.categoria} // El valor es el ID de la categoría
                  onChange={onChange} 
                  required
                >
                  <option value="">Selecciona una categoría...</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.nombre}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              
              {/* ... (el resto de los campos como Precio, Stock, etc. se quedan igual) ... */}
              
              <Button type="submit" variant="primary" className="w-100 mt-3">
                Actualizar Producto
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductEditPage;