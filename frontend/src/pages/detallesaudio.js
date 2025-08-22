// frontend/src/pages/detallesaudio.js
import React, { useMemo, useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar as faStarSolid,
  faTruckFast,
  faHeart,
  faCartPlus,
  faShieldHalved,
  faCircleCheck,
  faFlag,
} from '@fortawesome/free-solid-svg-icons';
import productService from '../services/productService';
import './detallesaudio.css';

/* ----------------- Helpers de reportes (localStorage) ----------------- */
const REPORTS_KEY = 'reports:v1';
function getReportsMap() {
  try { return JSON.parse(localStorage.getItem(REPORTS_KEY) || '{}'); } catch { return {}; }
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

/* --------------------- Helpers de wishlist (fallback) ------------------ */
const WL_KEY = 'wishlist:ids';
function wlGetSet() {
  try { return new Set(JSON.parse(localStorage.getItem(WL_KEY) || '[]')); }
  catch { return new Set(); }
}
function wlSave(set) {
  localStorage.setItem(WL_KEY, JSON.stringify([...set]));
}

/* --------------------------- Estrellas UI ----------------------------- */
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

/* -------- Normalización de datos que devuelve la API (defensiva) ------ */
function normalizeProduct(data) {
  const fallbackImg = 'https://via.placeholder.com/800x500?text=Sin+imagen';
  const imagenes =
    Array.isArray(data?.imagenes) && data.imagenes.length
      ? data.imagenes
      : data?.img
      ? [data.img]
      : [fallbackImg];

  const precio = data?.precio ?? data?.price ?? 0;
  const costoEnvio = data?.costoEnvio ?? data?.shippingCost ?? 0;
  const tiempoEnvio = data?.tiempoEnvio ?? data?.shippingTime ?? '24–48 horas';
  const tienda = data?.tienda ?? { nombreTienda: data?.storeName || 'Marketplace Tech' };

  const especificacionesTecnicas = {
    modelo: data?.especificacionesTecnicas?.modelo ?? data?.modelo ?? 'N/A',
    compatibilidad: data?.especificacionesTecnicas?.compatibilidad ?? 'Bluetooth',
    ram: data?.especificacionesTecnicas?.ram ?? data?.ram ?? 'N/A',
  };

  return {
    id: String(data?._id ?? data?.id ?? ''), // admite _id o id
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
  const [reseñasUI, setReseñasUI] = useState([]);

  // Reporte
  const [showReport, setShowReport] = useState(false);
  const [reportCat, setReportCat] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
  const [reportCount, setReportCount] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);

  // Wishlist (igual que detalleslap)
  const [inWishlist, setInWishlist] = useState(false);
  const [wishMsg, setWishMsg] = useState('');
  const [wishLoading, setWishLoading] = useState(false);

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

        const currentCount = getReportCount(normalized.id || id);
        setReportCount(currentCount);
        setIsDisabled(isDisabledByReports(normalized.id || id));

        // --- Estado de wishlist ---
        const pid = normalized.id || id;
        if (productService.isInWishlist) {
          const ok = await productService.isInWishlist(pid);
          setInWishlist(!!ok);
        } else {
          const s = wlGetSet();
          setInWishlist(s.has(pid));
        }
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

  const disponible = !!product && product.stock > 0 && !isDisabled;

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

  /* ------------------ Envío del reporte (modal) ------------------ */
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

    if (newCount >= 10) setIsDisabled(true);
  };

  /* ------------------------- Wishlist toggle ---------------------- */
  const toggleWishlist = async () => {
    if (!product) return;
    const pid = product.id || id;
    setWishLoading(true);
    setWishMsg('');

    try {
      if (inWishlist) {
        if (productService.removeFromWishlist) {
          await productService.removeFromWishlist(pid);
        } else {
          const s = wlGetSet();
          s.delete(pid);
          wlSave(s);
        }
        setInWishlist(false);
        setWishMsg('Eliminado de tu wishlist.');
      } else {
        if (productService.addToWishlist) {
          await productService.addToWishlist(pid);
        } else {
          const s = wlGetSet();
          s.add(pid);
          wlSave(s);
        }
        setInWishlist(true);
        setWishMsg('Agregado a tu wishlist.');
      }
      setTimeout(() => setWishMsg(''), 1500);
    } catch (e) {
      setWishMsg('No se pudo actualizar la wishlist.');
      setTimeout(() => setWishMsg(''), 2000);
    } finally {
      setWishLoading(false);
    }
  };

  /* ------------------------ Loading / Error ----------------------- */
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
      {wishMsg && (
        <Alert variant="info" className="mb-3" onClose={() => setWishMsg('')} dismissible>
          {wishMsg}
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
                <Badge bg="success" pill className="align-self-start">{product.estado}</Badge>
                {isDisabled && <Badge bg="secondary" pill className="align-self-start">Inhabilitado</Badge>}
              </div>
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
                {disponible ? `En stock (${product.stock} disponibles)` : isDisabled ? 'Inhabilitado' : 'Sin stock'}
              </span>
              <span className="ms-3 text-muted">Ubicación: {product.ubicacion}</span>
              <span className="ms-3 text-muted">Reportes: {reportCount}</span>
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
                      setQty(Math.max(1, Math.min(product.stock || 1, Number(e.target.value) || 1)))
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

                <Button
                  variant={inWishlist ? 'secondary' : 'outline-secondary'}
                  onClick={toggleWishlist}
                  disabled={wishLoading || isDisabled}
                  title={inWishlist ? 'Quitar de wishlist' : 'Agregar a wishlist'}
                >
                  <FontAwesomeIcon icon={faHeart} className="me-2" />
                  {inWishlist ? 'En wishlist' : 'Wishlist'}
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
