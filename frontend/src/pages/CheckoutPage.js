// frontend/src/pages/CheckoutPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Row, Col, ListGroup, Image, Card, Form, Alert } from 'react-bootstrap';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import orderService from '../services/orderService';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart(); // Asumimos que añadirás 'clearCart' al contexto
    const { userInfo } = useAuth();

    const [addresses, setAddresses] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [selectedPayment, setSelectedPayment] = useState('');
    const [cvv, setCvv] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userInfo) {
            navigate('/login?redirect=/checkout');
        } else {
            const fetchProfile = async () => {
                const profile = await userService.getProfile();
                setAddresses(profile.addresses || []);
                setPaymentMethods(profile.paymentMethods || []);
                // Seleccionar por defecto si existen
                if (profile.addresses?.length > 0) setSelectedAddress(profile.addresses.find(a => a.isDefault)?._id || profile.addresses[0]._id);
                if (profile.paymentMethods?.length > 0) setSelectedPayment(profile.paymentMethods.find(p => p.isDefault)?._id || profile.paymentMethods[0]._id);
            };
            fetchProfile();
        }
    }, [userInfo, navigate]);
    
    // --- Cálculos --- (Puedes moverlos a tu CartContext si prefieres)
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.precio * item.qty, 0);
    const shippingPrice = itemsPrice > 50000 ? 0 : 5000; // Envío gratis sobre ₡50,000
    const taxPrice = itemsPrice * 0.13; // 13% de impuestos
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    const placeOrderHandler = async () => {
        setError('');
        if (!selectedAddress || !selectedPayment || !cvv) {
            setError('Por favor, selecciona una dirección, un método de pago e ingresa el CVV.');
            return;
        }

        try {
            const fullAddress = addresses.find(a => a._id === selectedAddress);
            const orderData = {
                orderItems: cartItems.map(item => ({
                    nombre: item.nombre,
                    qty: item.qty,
                    imagen: item.imagenes[0],
                    precio: item.precio,
                    product: item._id,
                })),
                shippingAddress: {
                    direccion: fullAddress.direccion,
                    ciudad: fullAddress.provincia,
                    codigoPostal: fullAddress.zip,
                    pais: fullAddress.pais,
                },
                paymentMethod: 'Tarjeta de Crédito', // O el `brand` de la tarjeta seleccionada
                itemsPrice: itemsPrice,
                taxPrice: taxPrice,
                shippingPrice: shippingPrice,
                totalPrice: totalPrice,
            };

            const createdOrder = await orderService.createOrder(orderData);
            // clearCart(); // Limpiamos el carrito después de la compra
            navigate(`/order/${createdOrder._id}`); // Redirigimos a la página de la orden
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo crear la orden.');
        }
    };

    return (
        <Row>
            <h1>Checkout</h1>
            <Col md={8}>
                <ListGroup variant="flush">
                    <ListGroup.Item>
                        <h2>Dirección de Envío</h2>
                        {addresses.map(address => (
                            <Form.Check 
                                type="radio"
                                key={address._id}
                                id={`address-${address._id}`}
                                label={`${address.direccion}, ${address.provincia}, ${address.pais}`}
                                name="address"
                                value={address._id}
                                checked={selectedAddress === address._id}
                                onChange={(e) => setSelectedAddress(e.target.value)}
                            />
                        ))}
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <h2>Método de Pago</h2>
                         {paymentMethods.map(method => (
                            <Form.Check 
                                type="radio"
                                key={method._id}
                                id={`payment-${method._id}`}
                                label={`${method.brand} terminada en ${method.last4}`}
                                name="payment"
                                value={method._id}
                                checked={selectedPayment === method._id}
                                onChange={(e) => setSelectedPayment(e.target.value)}
                            />
                        ))}
                        <Form.Group as={Row} className="mt-3">
                            <Form.Label column sm="3">CVV</Form.Label>
                            <Col sm="4">
                                <Form.Control type="text" value={cvv} onChange={(e) => setCvv(e.target.value)} maxLength="3" required />
                            </Col>
                        </Form.Group>
                    </ListGroup.Item>
                </ListGroup>
            </Col>
            <Col md={4}>
                <Card>
                    <ListGroup variant="flush">
                        <ListGroup.Item><h2>Resumen del Pedido</h2></ListGroup.Item>
                        <ListGroup.Item><Row><Col>Artículos:</Col><Col>₡{itemsPrice.toLocaleString('es-CR')}</Col></Row></ListGroup.Item>
                        <ListGroup.Item><Row><Col>Envío:</Col><Col>₡{shippingPrice.toLocaleString('es-CR')}</Col></Row></ListGroup.Item>
                        <ListGroup.Item><Row><Col>Impuestos (13%):</Col><Col>₡{taxPrice.toLocaleString('es-CR')}</Col></Row></ListGroup.Item>
                        <ListGroup.Item><Row><Col><strong>Total:</strong></Col><Col><strong>₡{totalPrice.toLocaleString('es-CR')}</strong></Col></Row></ListGroup.Item>
                        {error && <ListGroup.Item><Alert variant="danger">{error}</Alert></ListGroup.Item>}
                        <ListGroup.Item>
                            <div className="d-grid">
                                <Button type="button" disabled={cartItems.length === 0} onClick={placeOrderHandler}>
                                    Confirmar Compra
                                </Button>
                            </div>
                        </ListGroup.Item>
                    </ListGroup>
                </Card>
            </Col>
        </Row>
    );
};

export default CheckoutPage;