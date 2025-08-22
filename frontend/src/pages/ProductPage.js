import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Image, ListGroup, Card, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid, faStore } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import productService from '../services/productService'; // Se mantiene para getProductById
import userService from '../services/userService';       // ¡NUEVO! Para wishlist y suscripciones
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductPage = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false); // Mantienes tu lógica de modal
  const [isSubscribed, setIsSubscribed] = useState(false);

  const { id: productId } = useParams();
  const { addToCart } = useCart();
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  // Carga del producto (sin cambios)
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await productService.getProductById(productId);
        setProduct(data);
      } catch (err) {
        setError('No se pudo encontrar el producto.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // Verifica wishlist y suscripción (usando userService)
  useEffect(() => {
    const checkStatus = async () => {
      if (userInfo && product) {
        try {
          const [wishlistStatus, subscriptions] = await Promise.all([
            userService.isInWishlist(product._id),      // <-- CAMBIO
            userService.getMySubscriptions(),         // <-- CAMBIO
          ]);

          setIsInWishlist(wishlistStatus);

          if (product.tienda) {
            const productStoreId = typeof product.tienda === 'string' ? product.tienda : product.tienda?._id;
            const isAlreadySubscribed = subscriptions.some(
              (store) => String(store._id) === String(productStoreId)
            );
            setIsSubscribed(isAlreadySubscribed);
          }
        } catch (err) {
          console.error('Error al verificar estados (wishlist/suscripción)', err);
        }
      }
    };
    checkStatus();
  }, [product, userInfo]);

  const addToCartHandler = () => {
    addToCart(product, Number(qty));
    navigate('/cart');
  };

  const wishlistHandler = async () => {
    if (!userInfo) return navigate('/login');
    try {
      if (isInWishlist) {
        await userService.removeFromWishlist(product._id); // <-- CAMBIO
      } else {
        await userService.addToWishlist(product._id);      // <-- CAMBIO
      }
      setIsInWishlist(!isInWishlist);
    } catch (err) {
      alert('No se pudo actualizar la wishlist.');
      console.error(err);
    }
  };

  const handleSubscribeToggle = async () => {
    if (!userInfo) return navigate('/login');
    try {
      const storeId = typeof product.tienda === 'string' ? product.tienda : product.tienda?._id;
      if (!storeId) {
        throw new Error('No se encontró el ID de la tienda en el producto.');
      }
      await userService.toggleSubscription(storeId); // <-- CAMBIO
      setIsSubscribed(!isSubscribed);
    } catch (err) {
      alert(err?.response?.data?.message || 'No se pudo actualizar la suscripción.');
      console.error(err);
    }
  };
  
  const reportHandler = () => {
    console.log('Reporte enviado');
    setShowReportModal(false);
  };

  if (loading) {
    return <Container className="text-center py-5"><Spinner animation="border" /></Container>;
  }

  if (error) {
    return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
  }

  const storeName = product && product.tienda && typeof product.tienda !== 'string' ? product.tienda?.nombreTienda || 'Tienda' : 'Tienda';
  const storeLogo = product && product.tienda && typeof product.tienda !== 'string' ? product.tienda?.fotoLogo : null;

  return (
    <Container className="py-4">
      <Link className="btn btn-light my-3" to={-1}>
        Volver
      </Link>

      {product && (
        <>
          <Row>
            <Col md={6} className="mb-3">
              <Image src={product.imagenes?.[0]} alt={product.nombre} fluid />
            </Col>

            <Col md={3} className="mb-3">
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h3>{product.nombre}</h3>
                </ListGroup.Item>
                <ListGroup.Item>
                  Precio: ₡{product.precio?.toLocaleString('es-CR')}
                </ListGroup.Item>
                <ListGroup.Item>Descripción: {product.descripcion}</ListGroup.Item>

                {product.tienda && (
                  <ListGroup.Item>
                    <strong>Vendido por:</strong>
                    <div className="d-flex align-items-center mt-2 mb-2">
                      {storeLogo && (
                        <Image
                          src={storeLogo}
                          alt={storeName}
                          roundedCircle
                          style={{ width: '40px', height: '40px', marginRight: '10px' }}
                        />
                      )}
                      <span>{storeName}</span>
                    </div>
                    {userInfo && userInfo.tipoUsuario === 'comprador' && (
                      <Button
                        variant={isSubscribed ? 'outline-secondary' : 'outline-primary'}
                        size="sm"
                        className="w-100"
                        onClick={handleSubscribeToggle}
                      >
                        <FontAwesomeIcon icon={faStore} className="me-2" />
                        {isSubscribed ? 'Dejar de Seguir' : 'Seguir Tienda'}
                      </Button>
                    )}
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Col>

            <Col md={3} className="mb-3">
              <Card>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Row>
                      <Col>Precio:</Col>
                      <Col>
                        <strong>₡{product.precio?.toLocaleString('es-CR')}</strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Estado:</Col>
                      <Col>{product.stock > 0 ? 'En Stock' : 'Agotado'}</Col>
                    </Row>
                  </ListGroup.Item>
                  {product.stock > 0 && (
                    <ListGroup.Item>
                      <Row>
                        <Col>Cantidad:</Col>
                        <Col>
                          <Form.Control
                            as="select"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                          >
                            {[...Array(product.stock).keys()].map((x) => (
                              <option key={x + 1} value={x + 1}>
                                {x + 1}
                              </option>
                            ))}
                          </Form.Control>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  )}
                  <ListGroup.Item className="d-grid">
                    <Button
                      onClick={addToCartHandler}
                      variant="dark"
                      type="button"
                      disabled={product.stock === 0}
                    >
                      Agregar al Carrito
                    </Button>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-center align-items-center">
                    <Button variant="link" onClick={wishlistHandler} className="text-danger">
                      <FontAwesomeIcon
                        icon={isInWishlist ? faHeartSolid : faHeartRegular}
                        className="me-2"
                      />
                      {isInWishlist ? 'En mi Wishlist' : 'Añadir a Wishlist'}
                    </Button>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
              <div className="text-center mt-3">
                <Button variant="link" size="sm" onClick={() => setShowReportModal(true)}>
                  Reportar producto
                </Button>
              </div>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default ProductPage;