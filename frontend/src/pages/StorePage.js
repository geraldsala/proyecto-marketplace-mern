// frontend/src/pages/StorePage.js

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Image } from 'react-bootstrap';
import userService from '../services/userService';

// Componente pequeño para la tarjeta de producto
const ProductCard = ({ product }) => (
  <Col md={4} lg={3} className="mb-4">
    <Card className="h-100">
      <Link to={`/producto/${product._id}`}>
        <Card.Img variant="top" src={product.imagenes?.[0] || '/placeholder.jpg'} />
      </Link>
      <Card.Body>
        <Card.Title as="div">
          <Link to={`/producto/${product._id}`} className="text-dark text-decoration-none">
            {product.nombre}
          </Link>
        </Card.Title>
        <Card.Text as="h5" className="mt-2">
          ₡{product.precio.toLocaleString('es-CR')}
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>
);

const StorePage = () => {
  const { id: storeId } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const { store: storeData, products: productsData } = await userService.getStorePublicProfile(storeId);
        setStore(storeData);
        setProducts(productsData);
      } catch (err) {
        setError('No se pudo cargar la información de la tienda. Es posible que no exista.');
      } finally {
        setLoading(false);
      }
    };
    fetchStoreData();
  }, [storeId]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Cargando tienda...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {store && (
        <Row className="mb-4 align-items-center">
          <Col xs="auto">
            <Image 
              src={store.fotoLogo || '/placeholder.jpg'} 
              roundedCircle 
              style={{ width: '100px', height: '100px' }} 
            />
          </Col>
          <Col>
            <h1>{store.nombreTienda || store.nombre}</h1>
            <p className="text-muted">Bienvenido a nuestra tienda.</p>
          </Col>
        </Row>
      )}

      <hr />

      <h2 className="my-4">Nuestros Productos</h2>
      {products.length > 0 ? (
        <Row>
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </Row>
      ) : (
        <Alert variant="info">Esta tienda aún no tiene productos publicados.</Alert>
      )}
    </Container>
  );
};

export default StorePage;