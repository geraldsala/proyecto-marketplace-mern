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

// Reutiliza el CSS de tus páginas de detalle
import './detalleslap.css';

/* ===== Estrellas reutilizable ===== */
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
function slugish(s) {
  return String(s || '').toLowerCase().trim().replace(/\s+/g, '_');
}
function singularize(s) {
  const t = String(s || '').toLowerCase().trim();
  if (t.endsWith('es')) return t.slice(0, -2);
  if (t.endsWith('s')) return t.slice(0, -1);
  return t;
}

const ProductPage = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { userInfo } = useAuth();

  // --- estado base ---
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // --- galería ---
  const [sel, setSel] = useState(0);

  // --- reseñas (UI local) ---
  const [myRate, setMyRate] = useState(0);
  const [coment, setComent] = useState('');
  const [reviews, setReviews] = useState([]); // {stars, text, user, date}

  // --- tienda resuelta ---
  const [resolvedStoreName, setResolvedStoreName] = useState('');
  const [resolvedStoreLogo, setResolvedStoreLogo] = useState('');

  // Carga del producto
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductById(productId);
        setProduct(data);
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

  // Wishlist / suscripción
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

  // Resolver nombre/logo de tienda
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
      product.storeName || product.tiendaNombre || product.nombreTienda || '';
    if (inlineName && !looksLikeObjectId(inlineName)) {
      setResolvedStoreName(inlineName);
      return;
    }

    const tiendaId = typeof product.tienda === 'string' ? product.tienda : '';
    if (looksLikeObjectId(tiendaId) && userService && typeof userService.getStorePublic === 'function') {
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

  // ======= categoría del producto (para rating por categoría) =======
  const categoryKey = useMemo(() => {
    const raw =
      product?.categoria ??
      product?.categoría ??
      product?.category ??
      product?.tipo ??
      product?.seccion ??
      product?.sección ??
      '';
    return String(raw).toLowerCase().trim();
  }, [product]);

  // ======= rating de tienda (por categoría si existe, o general) =======
  const { storeRating, storeRatingCount } = useMemo(() => {
    const t = product?.tienda;

    // posibles contenedores de ratings por categoría
    const ratingsByCat =
      (typeof t === 'object' && (t.ratingsByCategory || t.ratingPorCategoria || t.calificacionesPorCategoria || t.ratings || t.calificaciones)) ||
      product?.tiendaRatingsByCategory ||
      product?.ratingsByCategory ||
      null;

    let ratingFromCat = null;
    let countFromCat = null;

    if (ratingsByCat && categoryKey) {
      const key = categoryKey;
      const sg = singularize(key);

      if (Array.isArray(ratingsByCat)) {
        // [{ category|categoria|key, rating|calificacion|score, count|reviews|numReviews }]
        const entry =
          ratingsByCat.find((r) => slugish(r.category ?? r.categoria ?? r.key) === slugish(key)) ||
          ratingsByCat.find((r) => slugish(r.category ?? r.categoria ?? r.key) === slugish(sg));
        if (entry) {
          ratingFromCat =
            entry.rating ?? entry.calificacion ?? entry.score ?? entry.valor ?? null;
          countFromCat =
            entry.count ?? entry.reviews ?? entry.numReviews ?? null;
        }
      } else if (typeof ratingsByCat === 'object') {
        // { laptops: 4.6 } ó { laptop: { rating:4.6, count:120 } }
        const entry =
          ratingsByCat[key] ??
          ratingsByCat[sg] ??
          ratingsByCat[slugish(key)] ??
          ratingsByCat[slugish(sg)];
        if (entry != null) {
          if (typeof entry === 'number') {
            ratingFromCat = entry;
          } else if (typeof entry === 'object') {
            ratingFromCat =
              entry.rating ?? entry.calificacion ?? entry.score ?? entry.valor ?? null;
            countFromCat =
              entry.count ?? entry.reviews ?? entry.numReviews ?? null;
          }
        }
      }
    }

    // rating general como fallback
    const generalRating =
      (typeof t === 'object' && (t.rating || t.calificacion || t.score)) ||
      product?.tiendaRating ||
      product?.ratingTienda ||
      null;
    const generalCount =
      (typeof t === 'object' && (t.ratingCount || t.reviews || t.numReviews)) ||
      product?.tiendaReviews ||
      product?.numReviewsTienda ||
      null;

    return {
      storeRating: ratingFromCat ?? generalRating ?? 0,
      storeRatingCount: countFromCat ?? generalCount ?? 0,
    };
  }, [product, categoryKey]);

  // ======= especificaciones técnicas robustas =======
  const especificacionesLista = useMemo(() => {
    if (!product) return [];

    const src =
      product.especificaciones ||
      product.specs ||
      product.especificacionesTecnicas ||
      null;

    if (Array.isArray(src)) {
      return src.map((s) => String(s)).filter(Boolean);
    }
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
      ['Modelo', product.modelo],
      ['Procesador', product.procesador || product.cpu],
      ['RAM', product.ram || product.memoria],
      ['Almacenamiento', product.almacenamiento || product.storage],
      ['Pantalla', product.pantalla || product.display],
      ['Gráficos', product.graficos || product.gpu],
      ['Batería', product.bateria],
      ['Sistema Operativo', product.so || product.sistemaOperativo],
      ['Compatibilidad', product.compatibilidad],
      ['Peso', product.peso],
      ['Dimensiones', product.dimensiones],
      ['Color', product.color],
      ['Conectividad', product.conectividad],
      ['Cámara', product.camara],
      ['Puertos', product.puertos],
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

  const publicarResena = () => {
    if (!userInfo) return navigate('/login');
    if (!myRate) return alert('Selecciona una calificación.');
    const entry = {
      stars: myRate,
      text: (coment || '').trim(),
      user: userInfo?.name || userInfo?.email || 'Usuario',
      date: new Date().toISOString(),
    };
    setReviews((prev) => [entry, ...prev]);
    setComent('');
    setMyRate(0);
  };

  const storeName = resolvedStoreName || 'La Tienda de Tecnología';
  const storeLogo = resolvedStoreLogo || '';

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

                {/* Calificación de la tienda (por categoría si existe) */}
                <div className="d-flex align-items-center text-muted mb-2">
                  <Stars value={Number(storeRating) || 0} size="1.05rem" />
                  <small className="ms-2">
                    {storeRating
                      ? `${Number(storeRating).toFixed(1)} / 5`
                      : 'Sin calificaciones'}
                    {storeRatingCount ? ` (${storeRatingCount})` : ''}
                  </small>
                </div>

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

                {/* Cantidad + 3 botones en línea */}
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
                      />
                    </Form.Group>
                  </Col>
                  <Col xs="12" sm="8">
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-secondary"
                        onClick={wishlistHandler}
                        className="flex-grow-1"
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
                        disabled={!product.stock}
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
                  {storeLogo && (
                    <Image
                      src={storeLogo}
                      alt={storeName}
                      roundedCircle
                      style={{ width: 40, height: 40, marginRight: 10 }}
                    />
                  )}
                  <span className="text-muted">Vendido por:</span>
                  <strong className="ms-2">{looksLikeObjectId(storeName) ? 'Tienda' : storeName}</strong>
                </div>
              </div>

              {/* Ficha del producto */}
              <div className="card border-0 shadow-sm p-3 mt-3">
                <h5 className="mb-3">Ficha del producto</h5>
                {product.estado && <div><strong>Estado:</strong> {product.estado}</div>}
                {typeof product.stock !== 'undefined' && (
                  <div><strong>Stock:</strong> {product.stock} uds</div>
                )}
                <div><strong>Tienda:</strong> {looksLikeObjectId(storeName) ? 'Tienda' : storeName}</div>
              </div>

              {/* Calificación + listado de reseñas publicadas */}
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
                  <Button onClick={publicarResena}>Publicar reseña</Button>
                </div>

                {reviews.length > 0 && (
                  <div className="mt-3">
                    <h6 className="mb-2">Reseñas recientes</h6>
                    <div className="d-flex flex-column gap-2">
                      {reviews.map((r, idx) => (
                        <div key={idx} className="border rounded p-2">
                          <div className="d-flex align-items-center justify-content-between">
                            <strong>{r.user}</strong>
                            <small className="text-muted">
                              {new Date(r.date).toLocaleString('es-CR')}
                            </small>
                          </div>
                          <div className="mt-1">
                            <Stars value={r.stars} size="1.1rem" />
                          </div>
                          {r.text && <div className="mt-1">{r.text}</div>}
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
            <Modal.Body className="text-muted">
              Describe brevemente el problema con este producto.
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowReportModal(false)}>
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default ProductPage;
