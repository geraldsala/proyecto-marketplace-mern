// frontend/src/pages/CartPage.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// CORRECCIÓN: Agregamos 'Alert' a la lista de importaciones
import { Row, Col, ListGroup, Image, Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { useCart } from '../context/CartContext';

// El 'import Message from ...' se ha eliminado porque no lo necesitamos.

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, addToCart, removeFromCart } = useCart();

  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping');
  };

  return (
    <Container className="py-4">
      <Row>
        <Col md={8}>
          <h1>Carrito de Compras</h1>
          {cartItems.length === 0 ? (
            // CORRECCIÓN: Usamos el componente <Alert> en lugar del <Message> que no existía.
            <Alert variant="info">
              Tu carrito está vacío <Link to="/">Volver</Link>
            </Alert>
          ) : (
            <ListGroup variant="flush">
              {cartItems.map((item) => (
                <ListGroup.Item key={item._id}>
                  <Row className="align-items-center">
                    <Col md={2}><Image src={item.imagenes?.[0]} alt={item.nombre} fluid rounded /></Col>
                    <Col md={3}><Link to={`/producto/${item._id}`}>{item.nombre}</Link></Col>
                    <Col md={2}>₡{item.precio.toLocaleString('es-CR')}</Col>
                    <Col md={2}>
                      <Form.Control as="select" value={item.qty} onChange={(e) => addToCart(item, Number(e.target.value) - item.qty)}>
                        {[...Array(item.stock).keys()].map((x) => (<option key={x + 1} value={x + 1}>{x + 1}</option>))}
                      </Form.Control>
                    </Col>
                    <Col md={2}>
                      <Button type="button" variant="light" onClick={() => removeFromCart(item._id)}>
                        <i className="fas fa-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) items</h2>
                ₡{cartItems.reduce((acc, item) => acc + item.qty * item.precio, 0).toLocaleString('es-CR')}
              </ListGroup.Item>
              <ListGroup.Item className="d-grid">
                <Button type="button" variant="dark" disabled={cartItems.length === 0} onClick={checkoutHandler}>
                  Proceder al Pago
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CartPage;