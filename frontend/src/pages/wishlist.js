// frontend/src/pages/wishlist.js
import React, { useEffect, useState, useMemo } from 'react';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruckFast, faCartPlus, faHeart as faHeartFull } from '@fortawesome/free-solid-svg-icons';
import productService from '../services/productService';
 

function buildDetailPath(p) {
  const cat = (p.categoria || '').toLowerCase();
  const id = String(p._id || p.id);
  if (cat.includes('laptop')) return `/producto/laptop/${id}`;
  if (cat.includes('cel'))    return `/producto/celular/${id}`;
  if (cat.includes('audio'))  return `/producto/audio/${id}`;
  if (cat.includes('smart'))  return `/producto/smart/${id}`;
  // fallback genérico
  return `/producto/${id}`;
}

export default function WishlistPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await productService.getWishlist();
        if (!mounted) return;
        setItems(data || []);
      } catch (e) {
        if (!mounted) return;
        setError('No se pudo cargar tu wishlist.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const hasItems = useMemo(() => items.length > 0, [items]);

  async function handleRemove(pid) {
    await productService.removeFromWishlist(pid);
    setItems(cur => cur.filter(p => String(p._id || p.id) !== String(pid)));
  }

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" />
        <div className="mt-2">Cargando tu wishlist…</div>
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
    <div className="wishlist-page">
      <Container className="py-3">
        <h3 className="mb-3">Mi Wishlist</h3>

        {!hasItems && (
          <Alert variant="secondary">Tu wishlist está vacía.</Alert>
        )}

        {hasItems && (
          <Row className="gx-4 gy-4">
            {items.map((p) => {
              const id = String(p._id || p.id);
              return (
                <Col key={id} xs={12} sm={6} md={4} lg={3}>
                  <article className="product-card card border-0 shadow-sm h-100">
                    <div className="thumb">
                      {p.stock === 0 && <span className="badge-out">SIN STOCK</span>}
                      <img src={(p.imagenes && p.imagenes[0]) || p.img} alt={p.nombre} />
                    </div>
                    <div className="p-body p-3 d-flex flex-column">
                      <div className="badges mb-1">
                        {p.tiempoEnvio && (
                          <span className="badge-ship">
                            <FontAwesomeIcon icon={faTruckFast} className="me-1" />
                            {p.tiempoEnvio}
                          </span>
                        )}
                      </div>
                      <h6 className="title flex-grow-0">{p.nombre}</h6>
                      <div className="price mb-2">₡{Number(p.precio || 0).toLocaleString('es-CR')}</div>

                      <div className="mt-auto d-grid gap-2">
                        <LinkContainer to={buildDetailPath(p)}>
                          <Button size="sm" variant="dark">Ver detalle</Button>
                        </LinkContainer>

                        <Button size="sm" variant="outline-dark">
                          <FontAwesomeIcon icon={faCartPlus} className="me-2" />
                          Añadir al carrito
                        </Button>

                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => handleRemove(id)}
                        >
                          <FontAwesomeIcon icon={faHeartFull} className="me-2" />
                          Quitar de wishlist
                        </Button>
                      </div>
                    </div>
                  </article>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </div>
  );
}
