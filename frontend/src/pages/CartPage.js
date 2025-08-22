// frontend/src/pages/CartPage.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Form, Button, Card, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';

const CartPage = () => {
    const navigate = useNavigate();
    const { cartItems, addToCart, removeFromCart } = useCart();

    // Función para manejar el checkout
    const checkoutHandler = () => {
        // En un futuro, podría verificar si está logueado primero
        // navigate('/login?redirect=/shipping');
        navigate('/checkout'); // Lo dirigimos a la página de checkout que crearemos después
    };

    // --- Cálculos ---
    // Calcula el número total de artículos
    const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
    // Calcula el precio total
    const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.precio, 0);

    return (
        <Row>
            <Col md={8}>
                <h1>Carrito de Compras</h1>
                {cartItems.length === 0 ? (
                    <Alert variant="info">
                        Tu carrito está vacío. <Link to="/">Volver a la tienda</Link>
                    </Alert>
                ) : (
                    <ListGroup variant="flush">
                        {cartItems.map((item) => (
                            <ListGroup.Item key={item._id}>
                                <Row className="align-items-center">
                                    <Col md={2}>
                                        <Image src={item.imagenes[0]} alt={item.nombre} fluid rounded />
                                    </Col>
                                    <Col md={3}>
                                        <Link to={`/producto/${item._id}`}>{item.nombre}</Link>
                                    </Col>
                                    <Col md={2}>₡{item.precio.toLocaleString('es-CR')}</Col>
                                    <Col md={2}>
                                        <Form.Control
                                            as="select"
                                            value={item.qty}
                                            onChange={(e) => addToCart(item, Number(e.target.value))}
                                        >
                                            {[...Array(item.stock).keys()].map((x) => (
                                                <option key={x + 1} value={x + 1}>
                                                    {x + 1}
                                                </option>
                                            ))}
                                        </Form.Control>
                                    </Col>
                                    <Col md={2}>
                                        <Button
                                            type="button"
                                            variant="light"
                                            onClick={() => removeFromCart(item._id)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
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
                            <h2>
                                Subtotal ({totalItems}) {totalItems === 1 ? 'artículo' : 'artículos'}
                            </h2>
                            <strong>₡{subtotal.toLocaleString('es-CR')}</strong>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <div className="d-grid">
                                <Button
                                    type="button"
                                    variant="primary"
                                    disabled={cartItems.length === 0}
                                    onClick={checkoutHandler}
                                >
                                    Proceder al Pago
                                </Button>
                            </div>
                        </ListGroup.Item>
                    </ListGroup>
                </Card>
            </Col>
        </Row>
    );
};

export default CartPage;