import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Image, ListGroup, Card, Button, Spinner, Alert, Form, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import productService from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductPage = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const { id: productId } = useParams();
  const { addToCart } = useCart();
  const { userInfo } = useAuth();
  const navigate = useNavigate();

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

  // --- CORRECCIÓN 1: useEffect para verificar la wishlist de forma más eficiente ---
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (userInfo && product) {
        try {
          // Usamos la función específica para esto, si existe en tu servicio
          const status = await productService.isInWishlist(product._id);
          setIsInWishlist(status);
        } catch (wishlistError) {
          console.error("Error al verificar la wishlist", wishlistError);
        }
      }
    };
    checkWishlistStatus();
  }, [product, userInfo]);

  const addToCartHandler = () => {
    addToCart(product, Number(qty));
    navigate('/cart');
  };

  // --- CORRECCIÓN 2: Lógica correcta para agregar o quitar de la wishlist ---
  const wishlistHandler = async () => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    try {
      if (isInWishlist) {
        await productService.removeFromWishlist(product._id);
      } else {
        await productService.addToWishlist(product._id);
      }
      setIsInWishlist(!isInWishlist); // Actualizamos el estado visualmente
    } catch (err) {
      alert('No se pudo actualizar la wishlist.');
      console.error(err);
    }
  };

  const reportHandler = () => {
    console.log("Reporte enviado");
    setShowReportModal(false);
  };

  if (loading) return <Container className="text-center py-5"><Spinner animation="border" /></Container>;
  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="py-4">
      <Link className="btn btn-light my-3" to={-1}>
        Volver
      </Link>
      {product && (
        <>
          <Row>
            {/* Columna de Imagen */}
            <Col md={6} className="mb-3">
              <Image src={product.imagenes?.[0]} alt={product.nombre} fluid />
            </Col>

            {/* Columna de Info Principal */}
            <Col md={3} className="mb-3">
              <ListGroup variant="flush">
                <ListGroup.Item><h3>{product.nombre}</h3></ListGroup.Item>
                <ListGroup.Item>Precio: ₡{product.precio?.toLocaleString('es-CR')}</ListGroup.Item>
                <ListGroup.Item>Descripción: {product.descripcion}</ListGroup.Item>
              </ListGroup>
            </Col>

            {/* Columna de Acciones (Carrito, etc.) */}
            <Col md={3} className="mb-3">
              <Card>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Row><Col>Precio:</Col><Col><strong>₡{product.precio?.toLocaleString('es-CR')}</strong></Col></Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row><Col>Estado:</Col><Col>{product.stock > 0 ? 'En Stock' : 'Agotado'}</Col></Row>
                  </ListGroup.Item>
                  {product.stock > 0 && (
                    <ListGroup.Item>
                      <Row>
                        <Col>Cantidad:</Col>
                        <Col>
                          <Form.Control as="select" value={qty} onChange={(e) => setQty(e.target.value)}>
                            {[...Array(product.stock).keys()].map((x) => (
                              <option key={x + 1} value={x + 1}>{x + 1}</option>
                            ))}
                          </Form.Control>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  )}
                  <ListGroup.Item className="d-grid">
                    <Button onClick={addToCartHandler} variant="dark" type="button" disabled={product.stock === 0}>
                      Agregar al Carrito
                    </Button>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-center align-items-center">
                    <Button variant="link" onClick={wishlistHandler} className="text-danger">
                      <FontAwesomeIcon icon={isInWishlist ? faHeartSolid : faHeartRegular} className="me-2" />
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

          <Modal show={showReportModal} onHide={() => setShowReportModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Reportar Producto</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3" controlId="reportReason">
                  <Form.Label>Motivo del reporte</Form.Label>
                  <Form.Select>
                    <option>Información incorrecta</option>
                    <option>Producto fraudulento</option>
                    <option>Contenido inapropiado</option>
                    <option>Otro</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="reportComment">
                  <Form.Label>Comentarios adicionales</Form.Label>
                  <Form.Control as="textarea" rows={3} placeholder="Describa el problema..." />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowReportModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={reportHandler}>
                Enviar Reporte
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default ProductPage;