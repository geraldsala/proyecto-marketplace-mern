import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container, Row, Col, Alert, Spinner, Card } from 'react-bootstrap';
import productService from '../services/productService';
import { AuthContext } from '../context/AuthContext';

const ProductEditPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);

  const categories = ['Laptops', 'Audio', 'Celulares', 'Smart Home'];
  const productStates = ['nuevo', 'usado', 'reacondicionado'];

  const [product, setProduct] = useState({
    nombre: '',
    precio: 0,
    imagenes: [],
    categoria: '',
    stock: 0,
    descripcion: '',
    estado: 'nuevo',
    especificacionesTecnicas: { modelo: '', ram: '', compatibilidad: '' }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(productId);
        if (!Array.isArray(data.imagenes)) data.imagenes = [];
        if (!data.especificacionesTecnicas) data.especificacionesTecnicas = { modelo: '', ram: '', compatibilidad: '' };
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError('No se pudo cargar el producto.');
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await productService.updateProduct(productId, product, userInfo.token);
      navigate('/panel'); // CORRECCIÓN: Redirige a /panel
    } catch (err) {
      setError('No se pudo actualizar el producto.');
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };
  
  const onSpecsChange = (e) => {
    const { name, value } = e.target;
    setProduct(prevState => ({
        ...prevState,
        especificacionesTecnicas: {
            ...prevState.especificacionesTecnicas,
            [name]: value
        }
    }));
  };

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }

  return (
    <Container className="py-4">
      {/* CORRECCIÓN: El enlace ahora apunta a /panel */}
      <Link to="/panel" className="btn btn-light my-3">
        Volver al Panel
      </Link>
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Card className="p-4">
            <h1>Editar Producto</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={submitHandler}>
              <h5 className="mt-4 mb-3">Información General</h5>
              <Form.Group controlId="nombre" className="mb-3">
                <Form.Label>Nombre del Producto</Form.Label>
                <Form.Control type="text" name="nombre" value={product.nombre} onChange={onChange} />
              </Form.Group>
              <Form.Group controlId="descripcion" className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control as="textarea" rows={4} name="descripcion" value={product.descripcion} onChange={onChange} />
              </Form.Group>
              <Form.Group controlId="imagenes" className="mb-3">
                <Form.Label>Imágenes (URLs separadas por coma)</Form.Label>
                <Form.Control as="textarea" rows={3} name="imagenes" value={product.imagenes.join(', ')}
                  onChange={(e) => setProduct({...product, imagenes: e.target.value.split(',').map(img => img.trim())})}
                />
              </Form.Group>
              <hr />
              <h5 className="mt-4 mb-3">Detalles del Producto</h5>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="categoria" className="mb-3">
                    <Form.Label>Categoría</Form.Label>
                    <Form.Select name="categoria" value={product.categoria} onChange={onChange} required>
                      <option value="">Selecciona una categoría...</option>
                      {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group controlId="estado" className="mb-3">
                        <Form.Label>Estado del Producto</Form.Label>
                        <Form.Select name="estado" value={product.estado} onChange={onChange} required>
                            {productStates.map((s) => (<option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>))}
                        </Form.Select>
                    </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="precio" className="mb-3">
                    <Form.Label>Precio (en Colones)</Form.Label>
                    <Form.Control type="number" name="precio" value={product.precio} onChange={onChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="stock" className="mb-3">
                    <Form.Label>Cantidad en Stock</Form.Label>
                    <Form.Control type="number" name="stock" value={product.stock} onChange={onChange} />
                  </Form.Group>
                </Col>
              </Row>
              <hr />
              <h5 className="mt-4 mb-3">Especificaciones Técnicas</h5>
              <Form.Group controlId="modelo" className="mb-3">
                <Form.Label>Modelo</Form.Label>
                <Form.Control type="text" name="modelo" value={product.especificacionesTecnicas.modelo} onChange={onSpecsChange} />
              </Form.Group>
              <Form.Group controlId="ram" className="mb-3">
                <Form.Label>RAM</Form.Label>
                <Form.Control type="text" name="ram" value={product.especificacionesTecnicas.ram} onChange={onSpecsChange} />
              </Form.Group>
              <Form.Group controlId="compatibilidad" className="mb-3">
                <Form.Label>Compatibilidad</Form.Label>
                <Form.Control type="text" name="compatibilidad" value={product.especificacionesTecnicas.compatibilidad} onChange={onSpecsChange} />
              </Form.Group>
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