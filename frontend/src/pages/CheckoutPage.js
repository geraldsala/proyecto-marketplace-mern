// frontend/src/pages/CheckoutPage.js (Versión Profesional y Mejorada)

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Row, Col, ListGroup, Card, Form, Alert, Tabs, Tab, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';
import './CheckoutPage.css';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();
    const { userInfo } = useAuth();

    // Estados para la lógica del checkout
    const [addresses, setAddresses] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [paymentMethodTab, setPaymentMethodTab] = useState('Tarjeta de Crédito');
    
    // Estados para los formularios de pago
    const [selectedSavedCard, setSelectedSavedCard] = useState('');
    const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' });
    
    // Estados de UI
    const [error, setError] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        if (!userInfo) {
            navigate('/login?redirect=/checkout');
        } else {
            const fetchProfile = async () => {
                try {
                    const profile = await userService.getProfile();
                    setAddresses(profile.addresses || []);
                    setPaymentMethods(profile.paymentMethods || []);
                    if (profile.addresses?.length > 0) {
                        setSelectedAddress(profile.addresses.find(a => a.isDefault)?._id || profile.addresses[0]._id);
                    }
                } catch (error) {
                    setError('No se pudo cargar tu perfil. Intenta recargar la página.');
                }
            };
            fetchProfile();
        }
    }, [userInfo, navigate]);
    
    // Función para autocompletar el formulario al seleccionar una tarjeta guardada
    const handleSelectSavedCard = (method) => {
        setSelectedSavedCard(method._id);
        setCardDetails({
            name: method.holderName,
            expiry: `${method.expMonth}/${method.expYear}`,
            number: `**** **** **** ${method.last4}`, // Mostramos solo los últimos 4 por seguridad
            cvv: '' // El CVV nunca se guarda, debe reingresarse
        });
    };
    
    const handleCardChange = (e) => setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });

    // La lógica de cálculos y de 'placeOrderHandler' se mantiene igual
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.precio * item.qty, 0);
    const shippingPrice = itemsPrice > 50000 ? 0 : 5000;
    const taxPrice = itemsPrice * 0.13;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const placeOrderHandler = async () => {
        // ... (la lógica de esta función que ya tienes sigue siendo válida)
    };

    return (
        <Row>
            <Col md={7}>
                <h1 className="mb-4">Finalizar Compra</h1>

                <div className="checkout-section">
                    <h2><FontAwesomeIcon icon={faTruck} className="fa-icon" />1. Dirección de Envío</h2>
                    {addresses.length > 0 ? addresses.map(address => (
                        <Form.Check type="radio" key={address._id} id={`address-${address._id}`}
                            label={`${address.direccion}, ${address.provincia}, ${address.pais}`}
                            name="address" value={address._id}
                            checked={selectedAddress === address._id} onChange={(e) => setSelectedAddress(e.target.value)} />
                    )) : <p>No tienes direcciones guardadas. <Link to="/panel">Añade una dirección en tu perfil</Link>.</p>}
                </div>

                <div className="checkout-section">
                    <h2><FontAwesomeIcon icon={faCreditCard} className="fa-icon" />2. Método de Pago</h2>
                    <Tabs activeKey={paymentMethodTab} onSelect={(k) => setPaymentMethodTab(k)} className="mb-3 payment-tabs">
                        <Tab eventKey="Tarjeta de Crédito" title="💳 Tarjeta de Crédito">
                            <h5 className="mt-3 mb-3">Seleccionar una tarjeta guardada</h5>
                            <div className="saved-card-container">
                                {paymentMethods.map(method => (
                                    <div 
                                        key={method._id} 
                                        className={`saved-card ${selectedSavedCard === method._id ? 'selected' : ''}`}
                                        onClick={() => handleSelectSavedCard(method)}
                                    >
                                        <div className="card-brand">{method.brand}</div>
                                        <div className="card-last4">**** {method.last4}</div>
                                    </div>
                                ))}
                            </div>
                            <hr />
                            <h5 className="mb-3">O ingresar una nueva tarjeta</h5>
                            <Form>
                                <Form.Group className="mb-2"><Form.Label>Nombre en la Tarjeta</Form.Label><Form.Control type="text" name="name" value={cardDetails.name} onChange={handleCardChange} /></Form.Group>
                                <Form.Group className="mb-2"><Form.Label>Número de Tarjeta</Form.Label><Form.Control type="text" name="number" value={cardDetails.number} onChange={handleCardChange} /></Form.Group>
                                <Row>
                                    <Col><Form.Group><Form.Label>Vence (MM/AA)</Form.Label><Form.Control type="text" name="expiry" value={cardDetails.expiry} onChange={handleCardChange} /></Form.Group></Col>
                                    <Col><Form.Group><Form.Label>CVV</Form.Label><Form.Control type="text" name="cvv" value={cardDetails.cvv} onChange={handleCardChange} /></Form.Group></Col>
                                </Row>
                            </Form>
                        </Tab>
                        <Tab eventKey="SINPE Ficticio" title="📱 SINPE Ficticio">
                            <div className="mt-3"><p>Realiza el pago al número <strong>8888-8888</strong> (simulado) y luego confirma tu compra.</p></div>
                        </Tab>
                    </Tabs>
                </div>
            </Col>
            
            <Col md={5}>
                <Card className="summary-card">
                    <Card.Header as="h5">Resumen del Pedido</Card.Header>
                    <ListGroup variant="flush">
                        {/* El resumen de precios que ya tenías es perfecto */}
                        <ListGroup.Item><Row><Col>Artículos:</Col><Col className="text-end">₡{itemsPrice.toLocaleString('es-CR')}</Col></Row></ListGroup.Item>
                        <ListGroup.Item><Row><Col>Envío:</Col><Col className="text-end">₡{shippingPrice.toLocaleString('es-CR')}</Col></Row></ListGroup.Item>
                        <ListGroup.Item><Row><Col>Impuestos (13%):</Col><Col className="text-end">₡{taxPrice.toLocaleString('es-CR')}</Col></Row></ListGroup.Item>
                        <ListGroup.Item><Row><Col><strong>Total:</strong></Col><Col className="text-end"><strong>₡{totalPrice.toLocaleString('es-CR')}</strong></Col></Row></ListGroup.Item>
                        <ListGroup.Item>
                            <div className="d-grid">
                                <Button type="button" disabled={cartItems.length === 0 || processingPayment} onClick={placeOrderHandler} size="lg">
                                    {processingPayment ? <><Spinner as="span" size="sm" /> Procesando Pago...</> : 'Pagar y Confirmar Orden'}
                                </Button>
                            </div>
                        </ListGroup.Item>
                        {error && <ListGroup.Item><Alert variant="danger">{error}</Alert></ListGroup.Item>}
                    </ListGroup>
                </Card>
            </Col>
        </Row>
    );
};

export default CheckoutPage;