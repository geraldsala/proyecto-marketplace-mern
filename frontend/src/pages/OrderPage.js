// frontend/src/pages/OrderPage.js (Versión con import corregido)

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Alert, Spinner, Container } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';

const OrderPage = () => {
    const { id: orderId } = useParams();
    const navigate = useNavigate();

    const { userInfo } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!orderId) {
            return;
        }

        const fetchOrder = async () => {
            if (!userInfo) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                const fetchedOrder = await orderService.getOrderDetails(orderId);
                setOrder(fetchedOrder);
            } catch (err) {
                setError(err.response?.data?.message || 'Orden no encontrada.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId, userInfo, navigate]);

    if (loading) {
        return <Container className="text-center py-5"><Spinner animation="border" /></Container>;
    }

    if (error) {
        return <Container className="py-4"><Alert variant="danger">{error}</Alert></Container>;
    }

    if (!order) {
        return null; 
    }

    return (
        <Container className="py-4">
            <h1>Orden #{order._id}</h1>
            <Row>
                <Col md={8}>
                    <ListGroup variant="flush">
                        <ListGroup.Item>
                            <h2>Envío</h2>
                            <p><strong>Nombre: </strong> {order.user.nombre}</p>
                            <p><strong>Email: </strong> <a href={`mailto:${order.user.email}`}>{order.user.email}</a></p>
                            <p>
                                <strong>Dirección: </strong>
                                {order.shippingAddress.direccion}, {order.shippingAddress.ciudad},{' '}
                                {order.shippingAddress.codigoPostal}, {order.shippingAddress.pais}
                            </p>
                            {order.isDelivered ? (
                                <Alert variant="success">Entregado el {new Date(order.deliveredAt).toLocaleDateString()}</Alert>
                            ) : (
                                <Alert variant="warning">No Entregado</Alert>
                            )}
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <h2>Método de Pago</h2>
                            <p><strong>Método: </strong> {order.paymentMethod}</p>
                            {order.isPaid ? (
                                <Alert variant="success">Pagado el {new Date(order.paidAt).toLocaleDateString()}</Alert>
                            ) : (
                                <Alert variant="danger">No Pagado</Alert>
                            )}
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <h2>Artículos de la Orden</h2>
                            {order.orderItems.length === 0 ? (
                                <Alert>La orden no tiene artículos.</Alert>
                            ) : (
                                <ListGroup variant="flush">
                                    {order.orderItems.map((item, index) => (
                                        <ListGroup.Item key={index}>
                                            <Row className="align-items-center">
                                                <Col xs={2} md={1}>
                                                    <Image src={item.imagen} alt={item.nombre} fluid rounded />
                                                </Col>
                                                <Col>
                                                    <Link to={`/producto/${item.product}`}>{item.nombre}</Link>
                                                </Col>
                                                <Col md={4} className="text-md-end">
                                                    {item.qty} x ₡{item.precio.toLocaleString('es-CR')} = <strong>₡{(item.qty * item.precio).toLocaleString('es-CR')}</strong>
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            )}
                        </ListGroup.Item>
                    </ListGroup>
                </Col>

                <Col md={4}>
                    <Card>
                        <ListGroup variant="flush">
                            <ListGroup.Item><h2>Resumen de la Orden</h2></ListGroup.Item>
                            <ListGroup.Item><Row><Col>Artículos</Col><Col className="text-end">₡{order.itemsPrice.toLocaleString('es-CR')}</Col></Row></ListGroup.Item>
                            <ListGroup.Item><Row><Col>Envío</Col><Col className="text-end">₡{order.shippingPrice.toLocaleString('es-CR')}</Col></Row></ListGroup.Item>
                            <ListGroup.Item><Row><Col>Impuestos</Col><Col className="text-end">₡{order.taxPrice.toLocaleString('es-CR')}</Col></Row></ListGroup.Item>
                            <ListGroup.Item><Row><Col><strong>Total</strong></Col><Col className="text-end"><strong>₡{order.totalPrice.toLocaleString('es-CR')}</strong></Col></Row></ListGroup.Item>
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default OrderPage;