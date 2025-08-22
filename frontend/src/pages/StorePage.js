// frontend/src/pages/StorePage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Image, Badge } from 'react-bootstrap';
import storeService from '../services/storeService';

const ProductCard = ({ product }) => (
  <Col md={4} lg={3} className="mb-4">
    <Card className="h-100">
      <Link to={`/producto/${product._id}`}>
        <Card.Img
          variant="top"
          src={(Array.isArray(product.imagenes) && product.imagenes[0]) || '/placeholder.jpg'}
          alt={product.nombre || 'Producto'}
        />
      </Link>
      <Card.Body>
        <Card.Title as="div">
          <Link to={`/producto/${product._id}`} className="text-dark text-decoration-none">
            {product.nombre || 'Sin nombre'}
          </Link>
        </Card.Title>
        <Card.Text as="h5" className="mt-2">
          ₡{Number(product.precio || 0).toLocaleString('es-CR')}
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>
);

const StorePage = () => {
  const { slug } = useParams(); // ✅ usamos slug, no id
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]); // la puedes poblar si ya tienes /products
  const [loadingStore, setLoadingStore] = useState(true);
  const [loadingProds, setLoadingProds] = useState(false);
  const [errStore, setErrStore] = useState('');
  const [errProds, setErrProds] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoadingStore(true);
        const data = await storeService.getBySlug(slug);
        setStore(data);
        setErrStore('');
      } catch (e) {
        setStore(null);
        setErrStore(e?.response?.data?.message || 'No se pudo cargar la tienda.');
      } finally {
        setLoadingStore(false);
      }
    })();
  }, [slug]);

  // Si tienes el endpoint de productos por tienda, descomenta:
  /*
  useEffect(() => {
    (async () => {
      try {
        setLoadingProds(true);
        const data = await storeService.getProductsBySlug(slug, { page: 1, limit: 12, sort: 'latest' });
        setProducts(data.items || []);
        setErrProds('');
      } catch (e) {
        setProducts([]);
        setErrProds(e?.response?.data?.message || 'No se pudieron cargar los productos.');
      } finally {
        setLoadingProds(false);
      }
    })();
  }, [slug]);
  */

  if (loadingStore) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Cargando tienda...</p>
      </Container>
    );
  }

  if (errStore) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{errStore}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {store && (
        <Row className="mb-4 align-items-center">
          <Col xs="auto">
            <Image
              src={store.logoUrl || '/placeholder.jpg'} // ✅ coincide con tu API
              roundedCircle
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              alt={store.name}
            />
          </Col>
          <Col>
            <div className="d-flex align-items-center gap-2">
              <h1 className="mb-0">{store.name}</h1>
              {store.isActive ? <Badge bg="success">Activa</Badge> : <Badge bg="secondary">Inactiva</Badge>}
            </div>
            <div className="text-muted"><code>/tienda/{store.slug}</code></div>
          </Col>
        </Row>
      )}

      <hr />

      <h2 className="my-4">Nuestros Productos</h2>

      {loadingProds ? (
        <Spinner animation="border" />
      ) : errProds ? (
        <Alert variant="danger">{errProds}</Alert>
      ) : products.length > 0 ? (
        <Row>
          {products.map((product) => (
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
