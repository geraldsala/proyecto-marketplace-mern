// frontend/src/pages/detallesaudio.js
import React, { useMemo, useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Badge, Alert, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar as faStarSolid,
  faTruckFast,
  faHeart,
  faCartPlus,
  faShieldHalved,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import productService from '../services/productService';
import './detallesaudio.css';

// Estrellas
function Stars({ value = 0, size = '1rem', onRate }) {
  const arr = [1, 2, 3, 4, 5];
  return (
    <span className="stars" style={{ fontSize: size }}>
      {arr.map((n) => (
        <FontAwesomeIcon
          key={n}
          icon={faStarSolid}
          className={`me-1 ${n <= Math.round(value) ? 'star-active' : 'star-muted'}`}
          onClick={onRate ? () => onRate(n) : undefined}
          role={onRate ? 'button' : 'img'}
        />
      ))}
    </span>
  );
}

// Normaliza/Completa un producto proveniente del backend
function normalizeProduct(data) {
  const fallbackImg =
    'https://via.placeholder.com/800x500?text=Sin+imagen';

  // Arreglo de imágenes: admite `imagenes` (array), o `img` (string)
  const imagenes = Array.isArray(data?.imagenes) && data.imagenes.length
    ? data.imagenes
    : (data?.img ? [data.img] : [fallbackImg]);

  // Precio y envío (admite distintos nombres de campo)
  const precio = data?.precio ?? data?.price ?? 0;
  const costoEnvio = data?.costoEnvio ?? data?.shippingCost ?? 0;
  const tiempoEnvio = data?.tiempoEnvio ?? data?.shippingTime ?? '24–48 horas';

  // Tienda
  const tienda = data?.tienda ?? { nombreTienda: (data?.storeName || 'Marketplace Tech') };

  // Especificaciones
  const especificacionesTecnicas = {
    modelo: data?.especificacionesTecnicas?.modelo ?? data?.modelo ?? 'N/A',
    compatibilidad: data?.especificacionesTecnicas?.compatibilidad ?? 'Bluetooth',
    ram: data?.especificacionesTecnicas?.ram ?? data?.ram ?? 'N/A',
  };

  return {
    id: String(data?.id ?? ''),
    nombre: data?.nombre ?? data?.title ?? 'Producto',
    estado: data?.estado ?? 'Nuevo',
    descripcion: data?.descripcion ?? '',
    ubicacion: data?.ubicacion ?? 'San José, Costa Rica',
    stock: Number.isFinite(data?.stock) ? data.stock : 0,
    rating: Number.isFinite(data?.rating) ? data.rating : 4.8,
    reseñas: Array.isArray(data?.reseñas) ? data.reseñas : [],
    tienda,
    imagenes,
    precio,
    costoEnvio,
    tiempoEnvio,
    especificacionesTecnicas,
  };
}

export default function DetallesAudio() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI local
  const [sel, setSel] = useState(0);     // imagen seleccionada
  const [qty, setQty] = useState(1);     // cantidad
  const [myRate, setMyRate] = useState(0);
  const [coment, setComent] = useState('');
  const [reseñasUI, setReseñasUI] = useState([]); // reseñas locales

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await productService.getProductById(id);
        const normalized = normalizeProduct(data || {});
        setProduct(normalized);
        setReseñasUI(normalized.reseñas);
        setSel(0);
        setQty(1);
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
    return (product.precio * qty) + product.costoEnvio;
  }, [qty, product]);

  const disponible = !!product && product.stock > 0;

  const especificacionesLista = useMemo(() => {
    if (!product) return [];
    const spec = product.especificacionesTecnicas || {};
    const base = [
      `Modelo: ${spec.modelo}`,
      `Compatibilidad: ${spec.compatibilidad}`,
    ];
    if (spec.ram && spec.ram !== 'N/A') base.splice(1, 0, `RAM: ${spec.ram}`);
    return base;
  }, [product]);

  const agregarReseña = () => {
    if (!myRate || !coment.trim()) return;
    setReseñasUI(prev => [{ usuario: 'Tú', estrellas: myRate, comentario: coment.trim() }, ...prev]);
    setComent('');
    setMyRate(0);
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Cargando detalles del producto...</p>
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

  if (!product) return null;

  return (
    <Container className="detallesaudio-page py-4">
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
                <button
                  key={`${src}-${i}`}
                  className={`thumb ${i === sel ? 'active' : ''}`}
                  onClick={() => setSel(i)}
                >
                  <img src={src} alt={`Vista ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>
        </Col>

        {/* Info principal */}
        <Col lg={6}>
          <div className="card border-0 shadow-sm p-3 h-100 d-flex">
            <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
              <h2 className="m-0">{product.nombre}</h2>
              <Badge bg="success" pill className="align-self-start">
                {product.estado}
              </Badge>
            </div>

            {/* Vendedor */}
            <div className="seller mt-2">
              <span className="me-2 text-muted">Vendido por:</span>
              <strong>{product.tienda?.nombreTienda || 'Marketplace Tech'}</strong>
            </div>

            {/* Rating promedio */}
            <div className="mt-2">
              <Stars value={product.rating} />
              <span className="ms-2 text-muted">{product.rating.toFixed(1)} / 5</span>
            </div>

            {/* Precio */}
            <div className="price mt-3">
              ₡{product.precio.toLocaleString('es-CR')}
            </div>

            {/* Envío */}
            <div className="shipping mt-2">
              <span className="badge-ship">
                <FontAwesomeIcon icon={faTruckFast} className="me-1" />
                Envío Rápido • {product.tiempoEnvio} • ₡{product.costoEnvio.toLocaleString('es-CR')}
              </span>
            </div>

            {/* Estado / ubicación */}
            <div className="meta mt-3">
              <span className={`badge ${disponible ? 'bg-primary' : 'bg-secondary'}`}>
                {disponible ? `En stock (${product.stock} disponibles)` : 'Sin stock'}
              </span>
              <span className="ms-3 text-muted">Ubicación: {product.ubicacion}</span>
            </div>

            {/* Acciones */}
            <Row className="g-2 mt-3 align-items-end">
              <Col xs="6" sm="4">
                <Form.Group>
                  <Form.Label>Cantidad</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    max={Math.max(1, product.stock)}
                    value={qty}
                    autoComplete="off"
                    inputMode="numeric"
                    onChange={(e) =>
                      setQty(
                        Math.max(1, Math.min(product.stock || 1, Number(e.target.value) || 1))
                      )
                    }
                    disabled={!disponible}
                  />
                </Form.Group>
              </Col>
              <Col xs="12" sm="8" className="d-grid d-sm-flex gap-2">
                <Button variant="danger" className="flex-fill" disabled={!disponible}>
                  <FontAwesomeIcon icon={faCartPlus} className="me-2" />
                  Añadir al carrito
                </Button>
                <Button variant="outline-secondary">
                  <FontAwesomeIcon icon={faHeart} className="me-2" />
                  Wishlist
                </Button>
              </Col>
            </Row>

            {/* Total */}
            <div className="total mt-3">
              Total estimado (con envío): <strong>₡{precioTotal.toLocaleString('es-CR')}</strong>
            </div>

            {/* Confianza */}
            <div className="trust mt-3 d-flex flex-wrap gap-3 text-muted">
              <span><FontAwesomeIcon icon={faShieldHalved} className="me-2" />Pago seguro</span>
              <span><FontAwesomeIcon icon={faCircleCheck} className="me-2" />Garantía del vendedor</span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Descripción + Especificaciones + Reseñas */}
      <Row className="mt-4 gy-4">
        <Col lg={8}>
          <div className="card border-0 shadow-sm p-3">
            <h5 className="mb-3">Descripción</h5>
            <p className="mb-0">{product.descripcion || 'Sin descripción.'}</p>
          </div>

          <div className="card border-0 shadow-sm p-3 mt-3">
            <h5 className="mb-3">Especificaciones técnicas</h5>
            <ul className="specs">
              {especificacionesLista.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </Col>

        <Col lg={4}>
          {/* Ficha breve */}
          <div className="card border-0 shadow-sm p-3">
            <h5 className="mb-3">Ficha del producto</h5>
            <div><strong>Estado:</strong> {product.estado}</div>
            <div><strong>Stock:</strong> {product.stock} uds</div>
            <div><strong>Tienda:</strong> {product.tienda?.nombreTienda || 'Marketplace Tech'}</div>
          </div>

          {/* Reseñas rápidas */}
          <div className="card border-0 shadow-sm p-3 mt-3">
            <h5 className="mb-2">Tu calificación</h5>
            <Stars value={myRate} onRate={setMyRate} size="1.35rem" />
            <Form.Control
              className="mt-2"
              as="textarea"
              rows={3}
              placeholder="Escribe tu comentario…"
              value={coment}
              onChange={(e) => setComent(e.target.value)}
            />
            <div className="d-grid mt-2">
              <Button onClick={agregarReseña} variant="primary">Enviar reseña</Button>
            </div>
            {reseñasUI.length > 0 && <hr />}
            {reseñasUI.length > 0 && <h6 className="mb-2">Comentarios</h6>}
            <ul className="reviews">
              {reseñasUI.map((r, idx) => (
                <li key={idx}>
                  <strong className="me-2">{r.usuario}</strong>
                  <Stars value={r.estrellas} />
                  <div className="text-muted mt-1">{r.comentario}</div>
                </li>
              ))}
            </ul>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
