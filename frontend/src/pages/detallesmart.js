import React, { useMemo, useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Badge, Alert, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar as faStarSolid,
  faTruckFast,
  faHeart,
  faFlag,
  faCartPlus,
  faShieldHalved,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import productService from '../services/productService';
import './detallesmart.css';

function Stars({ value = 0, size = '1rem' }) {
  const arr = [1, 2, 3, 4, 5];
  return (
    <span className="stars" style={{ fontSize: size }}>
      {arr.map((n) => (
        <FontAwesomeIcon
          key={n}
          icon={faStarSolid}
          className={`me-1 ${n <= Math.round(value) ? 'star-active' : 'star-muted'}`}
          role="img"
        />
      ))}
    </span>
  );
}

export default function DetallesSmart() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [sel, setSel] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        setProduct(data);
      } catch (err) {
        setError('No se pudo encontrar el producto solicitado.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const precioTotal = useMemo(() => {
    if (!product) return 0;
    return product.precio * qty + product.costoEnvio;
  }, [qty, product]);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" /><p className="mt-2">Cargando detalles del producto...</p>
      </Container>
    );
  }

  if (error) {
    return <Container className="py-4"><Alert variant="danger">{error}</Alert></Container>;
  }

  if (!product) {
    return null;
  }

  const disponible = product.stock > 0;
  const especificacionesLista = [
      `Modelo: ${product.especificacionesTecnicas.modelo}`,
      `Compatibilidad: ${product.especificacionesTecnicas.compatibilidad}`,
  ];

  return (
    <Container className="detallesmart-page py-4">
      <Row className="gy-4">
        {/* Galería */}
        <Col lg={6}>
          <div className="gallery card border-0 shadow-sm">
            <div className="gallery-main">
              <img src={product.imagenes[sel]} alt={product.nombre} />
              {!disponible && <span className="badge-stock">SIN STOCK</span>}
            </div>
            <div className="thumbs mt-3">
              {product.imagenes.map((src, i) => (
                <button key={src + i} className={`thumb ${i === sel ? 'active' : ''}`} onClick={() => setSel(i)}>
                  <img src={src} alt={`Vista ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>
        </Col>

        {/* Info */}
        <Col lg={6}>
          <div className="card border-0 shadow-sm p-3 h-100 d-flex">
            <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
              <h2 className="m-0">{product.nombre}</h2>
              <Badge bg="success" pill className="align-self-start">{product.estado}</Badge>
            </div>
            <div className="seller mt-2">
              <span className="me-2 text-muted">Vendido por:</span>
              <strong>{product.tienda ? product.tienda.nombreTienda : 'Tienda no disponible'}</strong>
            </div>
            <div className="mt-2">
              <Stars value={4.6} /><span className="ms-2 text-muted">4.6 / 5 (ejemplo)</span>
            </div>
            <div className="price mt-3">₡{product.precio.toLocaleString('es-CR')}</div>
            <div className="shipping mt-2">
              <span className="badge-ship">
                <FontAwesomeIcon icon={faTruckFast} className="me-1" />
                {product.tiempoEnvio} • ₡{product.costoEnvio.toLocaleString('es-CR')}
              </span>
            </div>
            <div className="meta mt-3">
              <span className={`badge ${disponible ? 'bg-primary' : 'bg-secondary'}`}>
                {disponible ? `En stock (${product.stock} disponibles)` : 'Sin stock'}
              </span>
              <span className="ms-3 text-muted">Ubicación: {product.ubicacion}</span>
            </div>
            <Row className="g-2 mt-3 align-items-end">
              <Col xs="6" sm="4">
                <Form.Group>
                  <Form.Label>Cantidad</Form.Label>
                  <Form.Control type="number" min={1} max={product.stock} value={qty}
                    onChange={(e) => setQty(Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)))}
                    disabled={!disponible} />
                </Form.Group>
              </Col>
              <Col xs="12" sm="8" className="d-grid d-sm-flex gap-2">
                <Button variant="danger" className="flex-fill" disabled={!disponible}>
                  <FontAwesomeIcon icon={faCartPlus} className="me-2" />Añadir al carrito
                </Button>
                <Button variant="outline-secondary"><FontAwesomeIcon icon={faHeart} className="me-2" />Wishlist</Button>
              </Col>
            </Row>
            <div className="total mt-3">
              Total estimado (con envío): <strong>₡{precioTotal.toLocaleString('es-CR')}</strong>
            </div>
            <div className="trust mt-3 d-flex flex-wrap gap-3 text-muted">
              <span><FontAwesomeIcon icon={faShieldHalved} className="me-2" />Pago seguro</span>
              <span><FontAwesomeIcon icon={faCircleCheck} className="me-2" />Garantía del vendedor</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Descripción y Especificaciones */}
      <Row className="mt-4 gy-4">
        <Col lg={8}>
          <div className="card border-0 shadow-sm p-3">
            <h5 className="mb-3">Descripción</h5>
            <p className="mb-0">{product.descripcion}</p>
          </div>
          <div className="card border-0 shadow-sm p-3 mt-3">
            <h5 className="mb-3">Especificaciones técnicas</h5>
            <ul className="specs">{especificacionesLista.map((s) => <li key={s}>{s}</li>)}</ul>
          </div>
        </Col>
      </Row>
    </Container>
  );
}