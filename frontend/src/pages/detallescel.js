// frontend/src/pages/detallescel.js
import React, { useMemo, useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
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
import './detallescel.css';

/* ----------------- Helpers de reportes (localStorage) ----------------- */
const REPORTS_KEY = 'reports:v1';
function getReportsMap() {
  try { return JSON.parse(localStorage.getItem(REPORTS_KEY) || '{}'); }
  catch { return {}; }
}
function getReportCount(productId) {
  const map = getReportsMap();
  return Number(map[productId] || 0);
}
function addReport(productId) {
  const map = getReportsMap();
  map[productId] = Number(map[productId] || 0) + 1;
  localStorage.setItem(REPORTS_KEY, JSON.stringify(map));
  return map[productId];
}
function isDisabledByReports(productId) {
  return getReportCount(productId) >= 10;
}

/** Estrellas (permite calificar si se pasa onRate) */
function Stars({ value = 0, size = '1rem', onRate }) {
  const arr = [1, 2, 3, 4, 5];
  const rounded = Math.round(Number(value) || 0);
  return (
    <span className="stars" style={{ fontSize: size }}>
      {arr.map((n) => (
        <FontAwesomeIcon
          key={n}
          icon={faStarSolid}
          className={`me-1 ${n <= (onRate ? value : rounded) ? 'star-active' : 'star-muted'}`}
          onClick={onRate ? () => onRate(n) : undefined}
          role={onRate ? 'button' : 'img'}
        />
      ))}
    </span>
  );
}

export default function DetallesCelular() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [sel, setSel] = useState(0);
  const [qty, setQty] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Calificación y reseñas (local para la UI)
  const [myRate, setMyRate] = useState(0);
  const [coment, setComent] = useState('');
  const [reseñas, setReseñas] = useState([]);

  // Reportes (UI y estado)
  const [showReport, setShowReport] = useState(false);
  const [reportCat, setReportCat] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
  const [reportCount, setReportCount] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);

  // ---------- Carga del producto ----------
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await productService.getProductById(id);
        if (!isMounted) return;

        // Normalización para que la UI no se rompa si faltan datos
        const safe = {
          id: String(data?._id ?? data?.id ?? id),
          nombre: data?.nombre ?? data?.title ?? 'Producto',
          categoria: data?.categoria ?? data?.category ?? 'Celulares',
          grupo: data?.grupo ?? 'Smartphones',
          marca: data?.marca ?? data?.brand ?? '—',
          estado: data?.estado ?? 'Nuevo',
          precio: Number(data?.precio ?? data?.price ?? 0),
          costoEnvio: Number(data?.costoEnvio ?? 0),
          tiempoEnvio: data?.tiempoEnvio ?? 'Envío Rápido',
          stock: Number(data?.stock ?? 0),
          ubicacion: data?.ubicacion ?? 'San José',
          descripcion: data?.descripcion ?? 'Sin descripción.',
          tienda: data?.tienda ?? { nombreTienda: 'Marketplace Tech' },
          imagenes:
            Array.isArray(data?.imagenes) && data.imagenes.length
              ? data.imagenes
              : [data?.img ?? 'https://via.placeholder.com/600x600?text=Producto'],
          especificacionesTecnicas: {
            modelo: data?.especificacionesTecnicas?.modelo ?? '—',
            ram: data?.especificacionesTecnicas?.ram ?? '—',
            compatibilidad: data?.especificacionesTecnicas?.compatibilidad ?? '—',
            ...data?.especificacionesTecnicas,
          },
          rating: Number(data?.rating ?? 4.7),
          reseñas: Array.isArray(data?.reseñas) ? data.reseñas : [],
        };

        setProduct(safe);
        setReseñas(safe.reseñas);
        setSel(0);
        setQty(1);
        setMyRate(0);
        setComent('');

        // Estado de reportes/inhabilitación
        const currentCount = getReportCount(safe.id);
        setReportCount(currentCount);
        setIsDisabled(isDisabledByReports(safe.id));
      } catch (err) {
        if (!isMounted) return;
        setError('No se pudo encontrar el producto solicitado.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // ---------- Cálculos ----------
  const disponible = (product?.stock ?? 0) > 0 && !isDisabled;

  const precioTotal = useMemo(() => {
    if (!product) return 0;
    const base = product.precio || 0;
    const envio = product.costoEnvio || 0;
    return base * qty + envio;
  }, [qty, product]);

  const especificacionesLista = useMemo(() => {
    if (!product) return [];
    const e = product.especificacionesTecnicas ?? {};
    return [
      `Modelo: ${e.modelo ?? '—'}`,
      `RAM: ${e.ram ?? '—'}`,
      `Compatibilidad: ${e.compatibilidad ?? '—'}`,
    ];
  }, [product]);

  // ---------- Reportar (idéntico a detalleslap) ----------
  const REPORT_CATEGORIES = [
    'Información incorrecta',
    'Producto fraudulento',
    'Contenido inapropiado',
    'Precio engañoso',
    'Problemas de propiedad intelectual',
    'Otro',
  ];

  const submitReport = (e) => {
    e?.preventDefault?.();
    if (!reportCat) return;

    const productId = product?.id || id;
    const newCount = addReport(productId);
    setReportCount(newCount);
    setReportSuccess('Tu reporte se realizó con éxito. ¡Gracias por ayudarnos a mejorar!');
    setShowReport(false);
    setReportCat('');
    setReportDetails('');

    if (newCount >= 10) {
      setIsDisabled(true);
    }
  };

  const agregarReseña = () => {
    if (!myRate || !coment.trim()) return;
    setReseñas((cur) => [{ usuario: 'Tú', estrellas: myRate, comentario: coment.trim() }, ...cur]);
    setComent('');
    setMyRate(0);
  };

  // ---------- Estados de carga / error ----------
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

  // ---------- UI ----------
  return (
    <Container className="detallescelular-page py-4">
      {isDisabled && (
        <Alert variant="warning" className="mb-3">
          Este producto ha sido <strong>inhabilitado</strong> por reportes de la comunidad.
        </Alert>
      )}
      {reportSuccess && (
        <Alert variant="success" className="mb-3" onClose={() => setReportSuccess('')} dismissible>
          {reportSuccess}
        </Alert>
      )}

      <Row className="gy-4">
        {/* Galería */}
        <Col lg={6}>
          <div className="gallery card border-0 shadow-sm">
            <div className="gallery-main">
              <img src={product.imagenes[sel]} alt={product.nombre} />
              {!disponible && (
                <span className={`badge-stock ${isDisabled ? 'badge-disabled' : ''}`}>
                  {isDisabled ? 'INHABILITADO' : 'SIN STOCK'}
                </span>
              )}
            </div>

            <div className="thumbs mt-3">
              {product.imagenes.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  className={`thumb ${i === sel ? 'active' : ''}`}
                  onClick={() => setSel(i)}
                  aria-label={`Vista ${i + 1}`}
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
              <div className="d-flex align-items-center gap-2">
                <Badge bg="success" pill className="align-self-start">
                  {product.estado}
                </Badge>
                {isDisabled && <Badge bg="secondary" pill className="align-self-start">Inhabilitado</Badge>}
              </div>
            </div>

            {/* Vendedor */}
            <div className="seller mt-2">
              <span className="me-2 text-muted">Vendido por:</span>
              <strong>{product.tienda?.nombreTienda ?? 'Tienda'}</strong>
            </div>

            {/* Rating promedio */}
            <div className="mt-2">
              <Stars value={product.rating} />
              <span className="ms-2 text-muted">{product.rating?.toFixed?.(1) ?? '4.7'} / 5</span>
            </div>

            {/* Precio */}
            <div className="price mt-3">
              ₡{(product.precio || 0).toLocaleString('es-CR')}
            </div>

            {/* Envío */}
            <div className="shipping mt-2">
              <span className="badge-ship">
                <FontAwesomeIcon icon={faTruckFast} className="me-1" />
                {product.tiempoEnvio} • ₡{(product.costoEnvio || 0).toLocaleString('es-CR')}
              </span>
            </div>

            {/* Meta */}
            <div className="meta mt-3">
              <span className={`badge ${disponible ? 'bg-primary' : 'bg-secondary'}`}>
                {disponible ? `En stock (${product.stock} disponibles)` : isDisabled ? 'Inhabilitado' : 'Sin stock'}
              </span>
              <span className="ms-3 text-muted">Ubicación: {product.ubicacion}</span>
              <span className="ms-3 text-muted">Reportes: {reportCount}</span>
            </div>

            {/* Acciones (incluye Reportar idéntico a detalleslap) */}
            <Row className="g-2 mt-3 align-items-end">
              <Col xs="6" sm="4">
                <Form.Group>
                  <Form.Label>Cantidad</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    max={Math.max(1, product.stock || 1)}
                    value={qty}
                    onChange={(e) =>
                      setQty(
                        Math.max(
                          1,
                          Math.min(product.stock || 1, Number(e.target.value) || 1)
                        )
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

                <Button variant="outline-secondary" disabled={isDisabled}>
                  <FontAwesomeIcon icon={faHeart} className="me-2" />
                  Wishlist
                </Button>

                <Button
                  variant="outline-dark"
                  onClick={() => setShowReport(true)}
                >
                  <FontAwesomeIcon icon={faFlag} className="me-2" />
                  Reportar
                </Button>
              </Col>
            </Row>

            {/* Total */}
            <div className="total mt-3">
              Total estimado (con envío):{' '}
              <strong>₡{precioTotal.toLocaleString('es-CR')}</strong>
            </div>

            {/* Confianza */}
            <div className="trust mt-3 d-flex flex-wrap gap-3 text-muted">
              <span>
                <FontAwesomeIcon icon={faShieldHalved} className="me-2" />
                Pago seguro
              </span>
              <span>
                <FontAwesomeIcon icon={faCircleCheck} className="me-2" />
                Garantía del vendedor
              </span>
            </div>
          </div>
        </Col>
      </Row>

      {/* Descripción + Ficha + Calificación */}
      <Row className="mt-4 gy-4">
        {/* Descripción y especificaciones */}
        <Col lg={8}>
          <div className="card border-0 shadow-sm p-3">
            <h5 className="mb-3">Descripción</h5>
            <p className="mb-0">{product.descripcion}</p>
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

        {/* Ficha del producto (grupo) + Calificación */}
        <Col lg={4}>
          <div className="card border-0 shadow-sm p-3">
            <h5 className="mb-3">Ficha del producto</h5>
            <div><strong>Categoría:</strong> {product.categoria}</div>
            <div><strong>Grupo:</strong> {product.grupo}</div>
            <div><strong>Marca:</strong> {product.marca}</div>
            <div><strong>Modelo:</strong> {product.especificacionesTecnicas?.modelo ?? '—'}</div>
            <div><strong>Stock:</strong> {product.stock}</div>
          </div>

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
              <Button onClick={() => {
                if (!myRate || !coment.trim()) return;
                setReseñas((cur) => [{ usuario: 'Tú', estrellas: myRate, comentario: coment.trim() }, ...cur]);
                setComent('');
                setMyRate(0);
              }} variant="primary">
                Enviar reseña
              </Button>
            </div>
            <hr />
            <h6 className="mb-2">Comentarios</h6>
            <ul className="reviews">
              {reseñas.map((r, idx) => (
                <li key={idx}>
                  <strong className="me-2">{r.usuario ?? 'Usuario'}</strong>
                  <Stars value={r.estrellas ?? r.rating ?? 0} />
                  <div className="text-muted mt-1">{r.comentario ?? ''}</div>
                </li>
              ))}
              {reseñas.length === 0 && (
                <li className="text-muted">Sé el primero en dejar una reseña.</li>
              )}
            </ul>
          </div>
        </Col>
      </Row>

      {/* ------------------------- Modal Reportar ------------------------- */}
      <Modal show={showReport} onHide={() => setShowReport(false)} centered>
        <Form onSubmit={submitReport}>
          <Modal.Header closeButton>
            <Modal.Title>Reportar producto</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Categoría del reporte</Form.Label>
              <Form.Select
                value={reportCat}
                onChange={(e) => setReportCat(e.target.value)}
                required
              >
                <option value="">Selecciona una categoría…</option>
                {REPORT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group>
              <Form.Label>Detalles (opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Describe brevemente lo sucedido…"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
              />
              <Form.Text className="text-muted">
                Reportes actuales: {reportCount} / 10 para inhabilitar el producto.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowReport(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">Enviar reporte</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
