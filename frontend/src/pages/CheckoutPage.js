// frontend/src/pages/CheckoutPage.js (Versión Mejorada)
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Row, Col, ListGroup, Card, Form, Alert, Tabs, Tab, Spinner } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import './CheckoutPage.css'; // <-- Importar el CSS

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems } = useCart();
    const { userInfo } = useAuth();

    const [selectedAddress, setSelectedAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Tarjeta de Crédito');
    const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });

    // --- LÍNEAS FALTANTES AÑADIDAS AQUÍ ---
    const [sinpeNumber, setSinpeNumber] = useState('');
    
    const handleCardChange = (e) => {
        setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
    };
    // --- FIN DE LAS LÍNEAS FALTANTES ---

    const [error, setError] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);
    const [addresses, setAddresses] = useState([]);

    useEffect(() => {
        if (!userInfo) navigate('/login?redirect=/checkout');
        else {
            const fetchProfile = async () => {
                const profile = await userService.getProfile();
                setAddresses(profile.addresses || []);
                if (profile.addresses?.length > 0) {
                    setSelectedAddress(profile.addresses.find(a => a.isDefault)?._id || profile.addresses[0]._id);
                }
            };
            fetchProfile();
        }
    }, [userInfo, navigate]);

    const itemsPrice = cartItems.reduce((acc, item) => acc + item.precio * item.qty, 0);
    const shippingPrice = itemsPrice > 50000 ? 0 : 5000;
    const taxPrice = itemsPrice * 0.13;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const placeOrderHandler = async () => {
        // ... (La lógica de esta función se mantiene igual a la anterior)
    };

    return (
        <Row>
            <Col md={8}>
                <h1>Finalizar Compra</h1>
                <div className="checkout-step">
                    <h2>1. Dirección de Envío</h2>
                    {/* ... Tu lógica para mostrar y seleccionar direcciones ... */}
                </div>
                <div className="checkout-step">
                    <h2>2. Método de Pago</h2>
                    <Tabs activeKey={paymentMethod} onSelect={(k) => setPaymentMethod(k)} className="mb-3 payment-tabs">
                        <Tab eventKey="Tarjeta de Crédito" title="💳 Tarjeta de Crédito">
                            {/* ... Tu formulario de tarjeta ... */}
                        </Tab>
                        <Tab eventKey="SINPE Ficticio" title="📱 SINPE Ficticio">
                            {/* ... Tu formulario de SINPE ... */}
                        </Tab>
                    </Tabs>
                </div>
            </Col>
            <Col md={4}>
                <Card className="summary-card">
                    <Card.Header as="h5">Resumen del Pedido</Card.Header>
                    <ListGroup variant="flush">
                        {/* ... Tu resumen de precios ... */}
<ListGroup.Item>
                        <h2>2. Método de Pago</h2>
                        <Tabs activeKey={paymentMethod} onSelect={(k) => setPaymentMethod(k)} className="mb-3 payment-tabs">
                            <Tab eventKey="Tarjeta de Crédito" title="💳 Tarjeta de Crédito">
                                <Form className="mt-3">
                                    <Form.Group className="mb-3">
                                        <Form.Label>Nombre en la Tarjeta</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            name="name" 
                                            value={cardDetails.name} 
                                            onChange={handleCardChange} 
                                            placeholder="JUAN PEREZ" 
                                        />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Número de Tarjeta</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            name="number" 
                                            value={cardDetails.number} 
                                            onChange={handleCardChange} 
                                            placeholder="Usa un número de prueba válido" 
                                        />
                                    </Form.Group>
                                    <Row>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>Vencimiento</Form.Label>
                                                <Form.Control 
                                                    type="text" 
                                                    name="expiry" 
                                                    value={cardDetails.expiry} 
                                                    onChange={handleCardChange} 
                                                    placeholder="MM/AA" 
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group>
                                                <Form.Label>CVV</Form.Label>
                                                <Form.Control 
                                                    type="text" 
                                                    name="cvv" 
                                                    value={cardDetails.cvv} 
                                                    onChange={handleCardChange} 
                                                    placeholder="123" 
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Form>
                            </Tab>
                            <Tab eventKey="SINPE Ficticio" title="📱 SINPE Ficticio">
                                <div className="mt-3">
                                    <p>Realiza el pago al número <strong>8888-8888</strong> (simulado) y luego confirma tu compra.</p>
                                    <Form.Group>
                                        <Form.Label>Tu número para la confirmación</Form.Label>
                                        <Form.Control 
                                            type="text" 
                                            value={sinpeNumber} 
                                            onChange={(e) => setSinpeNumber(e.target.value)} 
                                            placeholder="Ej: 8765-4321"
                                        />
                                    </Form.Group>
                                </div>
                            </Tab>
                        </Tabs>
                    </ListGroup.Item>
                        {error && <ListGroup.Item><Alert variant="danger">{error}</Alert></ListGroup.Item>}
                    </ListGroup>
                </Card>
            </Col>
        </Row>
    );
};

export default CheckoutPage;