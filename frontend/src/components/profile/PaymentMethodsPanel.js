// frontend/src/components/profile/PaymentMethodsPanel.js

import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, Spinner, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const PaymentMethodsPanel = () => {
    const { userInfo } = useContext(AuthContext);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newMethod, setNewMethod] = useState({ nombreTitular: '', numeroTarjeta: '', cvv: '', vencimiento: '' });

     const fetchPaymentMethods = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/users/profile', config);
            setPaymentMethods(data.formasPago || []);
        } catch (err) {
            setError('No se pudieron cargar los métodos de pago.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userInfo) {
            fetchPaymentMethods();
        }
    }, [userInfo]);

    const handleAddMethod = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.post('/api/users/paymentmethods', newMethod, config);
            setPaymentMethods(data);
            setNewMethod({ nombreTitular: '', numeroTarjeta: '', cvv: '', vencimiento: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo añadir el método de pago.');
        }
    };

    const handleDeleteMethod = async (methodId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este método de pago?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.delete(`/api/users/paymentmethods/${methodId}`, config);
                setPaymentMethods(data);
            } catch (err) {
                setError('No se pudo eliminar el método de pago.');
            }
        }
    };

    const handleFormChange = (e) => {
        setNewMethod({ ...newMethod, [e.target.name]: e.target.value });
    };

    const maskCardNumber = (number) => {
        if (!number) return '';
        return `**** **** **** ${number.slice(-4)}`;
    };

    return (
        <Card className="p-4 border-0">
            <h2 className='mb-4'>Métodos de Pago</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <h5 className="mb-3">Añadir Nueva Tarjeta</h5>
            <Form onSubmit={handleAddMethod} className="mb-5">
                <Form.Group className="mb-3"><Form.Label>Nombre del Titular</Form.Label><Form.Control type="text" name="nombreTitular" value={newMethod.nombreTitular} onChange={handleFormChange} required /></Form.Group>
                <Row>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Número de Tarjeta</Form.Label><Form.Control type="text" name="numeroTarjeta" value={newMethod.numeroTarjeta} onChange={handleFormChange} required /></Form.Group></Col>
                    <Col md={3}><Form.Group className="mb-3"><Form.Label>Vencimiento (MM/AA)</Form.Label><Form.Control type="text" name="vencimiento" value={newMethod.vencimiento} onChange={handleFormChange} required /></Form.Group></Col>
                    <Col md={3}><Form.Group className="mb-3"><Form.Label>CVV</Form.Label><Form.Control type="text" name="cvv" value={newMethod.cvv} onChange={handleFormChange} required /></Form.Group></Col>
                </Row>
                <Button type="submit" variant="primary">Añadir Tarjeta</Button>
            </Form>
            <h5 className="mb-3">Mis Tarjetas Guardadas</h5>
            {loading ? <Spinner animation="border" /> : (
                <ListGroup>
                    {paymentMethods.length === 0 ? <ListGroup.Item>No tienes métodos de pago guardados.</ListGroup.Item> : (
                        paymentMethods.map(method => (
                            <ListGroup.Item key={method._id} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{method.nombreTitular}</strong><br />
                                    <span className="text-muted font-monospace">{maskCardNumber(method.numeroTarjeta)}</span>
                                    <span className="ms-3 text-muted">Vence: {method.vencimiento}</span>
                                </div>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteMethod(method._id)}><FontAwesomeIcon icon={faTrash} /></Button>
                            </ListGroup.Item>
                        ))
                    )}
                </ListGroup>
            )}
        </Card>
    );
};

export default PaymentMethodsPanel;