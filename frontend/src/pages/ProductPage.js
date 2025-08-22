// frontend/src/pages/ProductPage.js
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Image, Button, Spinner, Alert, Form, Modal
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart as faHeartSolid,
  faTruckFast,
  faCartPlus,
  faShieldHalved,
  faCircleCheck,
  faFlag,
  faStar as faStarSolid,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';

import productService from '../services/productService';
import userService from '../services/userService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import './detalleslap.css';

/* ===== Estrellas ===== */
function Stars({ value = 0, onRate, size = '1.2rem' }) {
  const stars = [1, 2, 3, 4, 5];
  const rounded = Math.round(Number(value) || 0);
  return (
    <span className="stars" style={{ fontSize: size }}>
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          className="btn p-0 border-0 bg-transparent"
          onClick={onRate ? () => onRate(n) : undefined}
          role={onRate ? 'button' : undefined}
          aria-label={`Calificar ${n} estrellas`}
          title={`Calificar ${n} estrellas`}
        >
          <FontAwesomeIcon
            icon={faStarSolid}
            className={`me-1 ${n <= rounded ? 'text-warning' : 'text-muted'}`}
          />
        </button>
      ))}
    </span>
  );
}

/* Utils */
function looksLikeObjectId(str) {
  return typeof str === 'string' && /^[a-f0-9]{24}$/i.test(str);
}
function capitalize(s) {
  return String(s).charAt(0).toUpperCase() + String(s).slice(1);
}

const REPORT_CATEGORIES = [
  'Producto falsificado',
  'Descripción engañosa',
  'Precio fraudulento',
  'Contenido inapropiado',
  'Producto peligroso/dañado',
  'Spam o duplicado',
  'Otra',
];

const ProductPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { userInfo } = useAuth();

  // base
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // galería
  const [sel, setSel] = useState(0);

  // reseñas (UI)
  const [myRate, setMyRate] = useState(0);
  const [coment, setComent] = useState('');
  const [reviews, setReviews] = useState([]);

  // reportes (UI)
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState(REPORT_CATEGORIES[0]);
  const [reportDetail, setReportDetail] = useState('');
  const [reportSending, setReportSending] = useState(false);

  // tienda mostrada
  const [resolvedStoreName, setResolvedStoreName] = useState('');
  const [resolvedStoreLogo, setResolvedStoreLogo] = useState('');

  // cargar producto
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductById(productId);
        setProduct(data);
        setReviews(data?.reviews || data?.calificaciones || []);
        setError('');
      } catch (err) {
        console.error(err);
        setError('No se pudo encontrar el producto.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // wishlist / suscripción
  useEffect(() => {
    const checkStatus = async () => {
      if (!userInfo || !product) return;
      try {
        const [wishlistStatus, subscriptions] = await Promise.all([
          userService.isInWishlist(product._id),
          userService.getMySubscriptions(),
        ]);
        setIsInWishlist(wishlistStatus);

        if (product.tienda) {
          const productStoreId =
            typeof product.tienda === 'string' ? product.tienda : product.tienda?._id;
          const isAlreadySubscribed = subscriptions.some(
            (store) => String(store._id) === String(productStoreId)
          );
          setIsSubscribed(isAlreadySubscribed);
        }
      } catch (err) {
        console.error('Error al verificar estados (wishlist/suscripción)', err);
      }
    };
    checkStatus();
  }, [userInfo, product]);

  // resolver nombre/logo tienda
  useEffect(() => {
    if (!product) return;

    if (typeof product.tienda === 'object' && product.tienda !== null) {
      const name =
        product.tienda.nombreTienda ||
        product.tienda.storeName ||
        product.tienda.name ||
        'La Tienda de Tecnología';
      const logo = product.tienda.logo || product.tienda.logoURL || '';
      setResolvedStoreName(name);
      setResolvedStoreLogo(logo);
      return;
    }

    const inlineName =
      product?.storeName || product?.tiendaNombre || product?.nombreTienda || '';
    if (inlineName && !looksLikeObjectId(inlineName)) {
      setResolvedStoreName(inlineName);
      return;
    }

    const tiendaId = typeof product.tienda === 'string' ? product.tienda : '';
    if (looksLikeObjectId(tiendaId) && userService?.getStorePublic) {
      (async () => {
        try {
          const store = await userService.getStorePublic(tiendaId);
          const name =
            store?.nombreTienda || store?.storeName || store?.name || 'Tienda';
          const logo = store?.logo || store?.logoURL || '';
          setResolvedStoreName(name);
          setResolvedStoreLogo(logo);
        } catch {
          setResolvedStoreName('Tienda');
        }
      })();
      return;
    }

    setResolvedStoreName(inlineName || 'La Tienda de Tecnología');
  }, [product]);

  // rating mostrado
  const productRating = Number(product?.calificacionPromedio || 0);
  const productRatingCount = Number(product?.numCalificaciones || 0);

  // especificaciones (robusto)
  const especificacionesLista = useMemo(() => {
    if (!product) return [];
    const src =
      product.especificaciones ||
      product.specs ||
      product.especificacionesTecnicas ||
      null;

    if (Array.isArray(src)) return src.map(String).filter(Boolean);

    if (typeof src === 'string') {
      const parts = src.split(/\r?\n|;|•/).map((s) => s.trim()).filter(Boolean);
      if (parts.length) return parts;
    }

    if (src && typeof src === 'object') {
      const out = Object.entries(src)
        .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
        .map(([k, v]) => `${capitalize(k)}: ${v}`);
      if (out.length) return out;
    }

    const known = [
      ['Modelo', product?.modelo],
      ['Procesador', product?.procesador || product?.cpu],
      ['RAM', product?.ram || product?.memoria],
      ['Almacenamiento', product?.almacenamiento || product?.storage],
      ['Pantalla', product?.pantalla || product?.display],
      ['Gráficos', product?.graficos || product?.gpu],
      ['Batería', product?.bateria],
      ['Sistema Operativo', product?.so || product?.sistemaOperativo],
      ['Compatibilidad', product?.compatibilidad],
      ['Peso', product?.peso],
      ['Dimensiones', product?.dimensiones],
      ['Color', product?.color],
      ['Conectividad', product?.conectividad],
      ['Cámara', product?.camara],
      ['Puertos', product?.puertos],
    ];
    return known
      .filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== '')
      .map(([k, v]) => `${k}: ${v}`);
  }, [product]);

  // Handlers
  const addToCartHandler = () => {
    if (!product) return;
    addToCart(product, Number(qty));
    navigate('/cart');
  };

  const wishlistHandler = async () => {
    if (!userInfo) return navigate('/login');
    try {
      if (isInWishlist) {
        await userService.removeFromWishlist(product._id);
      } else {
        await userService.addToWishlist(product._id);
      }
      setIsInWishlist(!isInWishlist);
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar la wishlist.');
    }
  };

const subscriptionHandler = async () => {
  if (!userInfo) return navigate('/login');
  if (!product || !product.tienda) return;

  const storeId = typeof product.tienda === 'string' ? product.tienda : product.tienda._id;

  try {
    await userService.toggleSubscription(storeId);
    setIsSubscribed(!isSubscribed);
  } catch (err) {
    console.error(err);
    alert('No se pudo actualizar la suscripción.');
  }
};



  // PUBLICAR RESEÑA -> guarda en BD y refresca el producto
  const publicarResena = async () => {
    if (!userInfo) return navigate('/login');
    if (!myRate) return alert('Selecciona una calificación.');
    try {
      const updated = await productService.addReview(product._id, {
        rating: myRate,
        comment: coment,
      });
      setProduct(updated);
      setReviews(updated?.reviews || updated?.calificaciones || []);
      setComent('');
      setMyRate(0);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'No se pudo guardar la reseña.';
      console.error('Error addReview:', err?.response || err);
      alert(msg);
    }
  };

  // ENVIAR REPORTE -> incrementa contador y puede inhabilitar
  const enviarReporte = async () => {
    if (!userInfo) return navigate('/login');
    setReportSending(true);
    try {
      const updated = await productService.reportProduct(product._id, {
        category: reportCategory,
        detail: reportDetail,
      });
      setProduct(updated);
      setShowReportModal(false);
      setReportCategory(REPORT_CATEGORIES[0]);
      setReportDetail('');
      alert(
        updated?.deshabilitado
          ? 'Gracias. El producto ha sido inhabilitado por múltiples reportes.'
          : 'Gracias. Tu reporte ha sido recibido.'
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'No se pudo enviar el reporte.';
      console.error('Error reportProduct:', err?.response || err);
      alert(msg);
    } finally {
      setReportSending(false);
    }
  };

  const storeName = resolvedStoreName || 'La Tienda de Tecnología';
  const storeLogo = resolvedStoreLogo || '';
  const storeId = product?.tienda?._id || (typeof product?.tienda === 'string' ? product.tienda : null);


  return (
    <Container className="py-4 detalleslap">
      {loading && (
        <Container className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2">Cargando detalles del producto...</p>
        </Container>
      )}

      {!loading && error && (
        <Container className="py-4">
          <Alert variant="danger">{error}</Alert>
        </Container>
      )}

      {!loading && !error && product && (
        <>
          <div className="mb-3">
            <Link to="/" className="text-decoration-none">&larr; Volver</Link>
          </div>

          <Row className="gy-4">
            {/* Galería */}
            <Col lg={6}>
              <div className="gallery card border-0 shadow-sm">
                <div className="gallery-main">
                  <img
                    src={(Array.isArray(product.imagenes) && product.imagenes[sel]) || product.imagen}
                    alt={product.nombre}
                  />
                  {!product.stock && <span className="badge-stock">SIN STOCK</span>}
                  {product.deshabilitado && <span className="badge-stock">INHABILITADO</span>}
                </div>

                {Array.isArray(product.imagenes) && product.imagenes.length > 1 && (
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
                )}
              </div>

              {/* Descripción */}
              <div className="card border-0 shadow-sm p-3 mt-3">
                <h5 className="mb-3">Descripción</h5>
                <p className="mb-0">{product.descripcion || 'Sin descripción'}</p>
              </div>

              {/* Especificaciones técnicas */}
              {especificacionesLista.length > 0 && (
                <div className="card border-0 shadow-sm p-3 mt-3">
                  <h5 className="mb-3">Especificaciones técnicas</h5>
                  <ul className="specs">
                    {especificacionesLista.map((s, i) => (
                      <li key={`${s}-${i}`}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Col>

            {/* Panel derecho */}
            <Col lg={6}>
              <div className="card border-0 shadow-sm p-3">
                {/* Título */}
                <h3 className="mb-1">{product.nombre}</h3>

                {/* Calificación (desde BD del producto) */}
                <div className="d-flex align-items-center text-muted mb-2">
                  <Stars value={productRating} size="1.05rem" />
                  <small className="ms-2">
                    {productRating ? `${productRating.toFixed(1)} / 5` : 'Sin calificaciones'}
                    {productRatingCount ? ` (${productRatingCount})` : ''}
                  </small>
                </div>

                {/* Banner de inhabilitado */}
                {product.deshabilitado && (
                  <Alert variant="warning" className="py-2">
                    Este producto ha sido inhabilitado temporalmente debido a múltiples reportes.
                  </Alert>
                )}

                {/* Envío */}
                {(product.tiempoEnvio || product.costoEnvio) && (
                  <div className="shipping mt-1">
                    <span className="badge-ship">
                      <FontAwesomeIcon icon={faTruckFast} className="me-1" />
                      {product.tiempoEnvio ? `Envío Rápido • ${product.tiempoEnvio}` : 'Envío'}
                      {product.costoEnvio != null
                        ? ` • ₡${Number(product.costoEnvio).toLocaleString('es-CR')}`
                        : ''}
                    </span>
                  </div>
                )}

                {/* Stock / ubicación */}
                <div className="meta mt-3">
                  <span className={`badge ${product.stock ? 'bg-primary' : 'bg-secondary'}`}>
                    {product.stock ? `En stock (${product.stock} disponibles)` : 'Sin stock'}
                  </span>
                  {product.ubicacion && (
                    <span className="ms-3 text-muted">Ubicación: {product.ubicacion}</span>
                  )}
                </div>

                {/* Precio */}
                <div className="price mt-3">
                  ₡{Number(product.precio || 0).toLocaleString('es-CR')}
                </div>

                {/* Cantidad + 3 botones */}
                <Row className="g-2 mt-2 align-items-end">
                  <Col xs="12" sm="4">
                    <Form.Group>
                      <Form.Label>Cantidad</Form.Label>
                      <Form.Control
                        type="number"
                        min={1}
                        max={Math.max(1, product.stock || 1)}
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value) || 1)}
                        disabled={product.deshabilitado}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs="12" sm="8">
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-secondary"
                        onClick={wishlistHandler}
                        className="flex-grow-1"
                        disabled={product.deshabilitado}
                      >
                        <FontAwesomeIcon
                          icon={isInWishlist ? faHeartSolid : faHeartRegular}
                          className="me-2"
                        />
                        Wishlist
                      </Button>

                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowReportModal(true)}
                        className="flex-grow-1"
                      >
                        <FontAwesomeIcon icon={faFlag} className="me-2" />
                        Reportar
                      </Button>

                      <Button
                        className="btn-addcart flex-grow-1"
                        onClick={addToCartHandler}
                        disabled={!product.stock || product.deshabilitado}
                      >
                        <FontAwesomeIcon icon={faCartPlus} className="me-2" />
                        Añadir
                      </Button>
                    </div>
                  </Col>
                </Row>

                {/* Seguridad */}
                <div className="mt-3 small text-muted d-flex flex-column gap-1">
                  <div><FontAwesomeIcon icon={faShieldHalved} className="me-2" />Pago seguro</div>
                  <div><FontAwesomeIcon icon={faCircleCheck} className="me-2" />Garantía del vendedor</div>
                </div>

                {/* Vendido por */}
                <div className="mt-3 d-flex align-items-center flex-wrap">
                  {resolvedStoreLogo && (
                    <Image
                      src={resolvedStoreLogo}
                      alt={resolvedStoreName}
                      roundedCircle
                      style={{ width: 40, height: 40, marginRight: 10 }}
                    />
                  )}
                  <span className="text-muted">Vendido por:</span>

                  {/* --- INICIO DEL CAMBIO --- */}
                  {/* Hacemos que el nombre de la tienda sea un enlace clickeable */}
                  <Link to={`/tienda/${storeId}`} className="text-decoration-none">
                    <strong className="ms-2">
                      {looksLikeObjectId(resolvedStoreName) ? 'Tienda' : resolvedStoreName}
                    </strong>
                  </Link>
                  {/* --- FIN DEL CAMBIO --- */}

                  {userInfo && userInfo.tipoUsuario === 'comprador' && product.tienda && (
                    <Button
                      variant={isSubscribed ? 'primary' : 'outline-primary'}
                      size="sm"
                      className="ms-3"
                      onClick={subscriptionHandler}
                    >
                      {isSubscribed ? 'Siguiendo' : 'Seguir Tienda'}
                    </Button>
                  )}
                  {/* ===== FIN DEL BOTÓN A AÑADIR ===== */}

                </div>
              </div>


              {/* Ficha del producto */}
              <div className="card border-0 shadow-sm p-3 mt-3">
                <h5 className="mb-3">Ficha del producto</h5>
                {product.estado && <div><strong>Estado:</strong> {product.estado}</div>}
                {typeof product.stock !== 'undefined' && (
                  <div><strong>Stock:</strong> {product.stock} uds</div>
                )}
                <div><strong>Tienda:</strong> {looksLikeObjectId(resolvedStoreName) ? 'Tienda' : resolvedStoreName}</div>
              </div>

              {/* Calificación + reseñas */}
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
                  disabled={product.deshabilitado}
                />
                <div className="d-grid mt-2">
                  <Button onClick={publicarResena} disabled={product.deshabilitado}>
                    Publicar reseña
                  </Button>
                </div>

                {reviews.length > 0 && (
                  <div className="mt-3">
                    <h6 className="mb-2">Reseñas recientes</h6>
                    <div className="d-flex flex-column gap-2">
                      {reviews.map((r, idx) => (
                        <div key={idx} className="border rounded p-2">
                          <div className="d-flex align-items-center justify-content-between">
                            <strong>{r.nombre || r.user?.name || 'Usuario'}</strong>
                            <small className="text-muted">
                              {r.creadoEn ? new Date(r.creadoEn).toLocaleString('es-CR') : ''}
                            </small>
                          </div>
                          <div className="mt-1">
                            <Stars value={r.calificacion || r.stars || 0} size="1.1rem" />
                          </div>
                          {(r.comentario || r.text) && (
                            <div className="mt-1">{r.comentario || r.text}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>

          {/* Modal reportar */}
          <Modal
            show={showReportModal}
            onHide={() => setShowReportModal(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Reportar producto</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Categoría del reporte</Form.Label>
                <Form.Select
                  value={reportCategory}
                  onChange={(e) => setReportCategory(e.target.value)}
                >
                  {REPORT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group>
                <Form.Label>Detalle (opcional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Describe brevemente el problema…"
                  value={reportDetail}
                  onChange={(e) => setReportDetail(e.target.value)}
                />
              </Form.Group>
              <small className="text-muted d-block mt-2">
                Nota: tu reporte ayuda a mantener el marketplace seguro. Solo se registra el conteo de reportes.
              </small>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowReportModal(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={enviarReporte}
                disabled={reportSending}
              >
                {reportSending ? 'Enviando…' : 'Enviar reporte'}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default ProductPage;
