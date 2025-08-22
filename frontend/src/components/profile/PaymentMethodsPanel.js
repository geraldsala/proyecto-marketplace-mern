import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import userService from '../../services/userService';

const PaymentMethodsPanel = () => {
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // El formulario ahora necesita el número de tarjeta completo
    const [formState, setFormState] = useState({
        holderName: '',
        brand: 'Visa',
        numeroTarjeta: '', // <-- CAMPO NUEVO PARA EL NÚMERO COMPLETO
        expMonth: '',
        expYear: '',
    });

    useEffect(() => {
        const fetchMethods = async () => {
            setLoading(true);
            try {
                const profile = await userService.getProfile();
                setPaymentMethods(profile.paymentMethods || []);
            } catch (err) {
                setError('No se pudieron cargar los métodos de pago.');
            } finally {
                setLoading(false);
            }
        };
        fetchMethods();
    }, []);

    const handleFormChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleAddMethod = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // El backend ahora devuelve la lista completa y actualizada.
            const updatedMethods = await userService.addPaymentMethod(formState);
            setPaymentMethods(updatedMethods);
            setFormState({ holderName: '', brand: 'Visa', numeroTarjeta: '', expMonth: '', expYear: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Error al añadir la tarjeta.');
        }
    };

    const handleDeleteMethod = async (methodId) => {
        if (window.confirm('¿Seguro que quieres eliminar esta tarjeta?')) {
            try {
                // El backend ahora devuelve la lista completa y actualizada.
                const updatedMethods = await userService.deletePaymentMethod(methodId);
                setPaymentMethods(updatedMethods);
            } catch (err) {
                setError('No se pudo eliminar la tarjeta.');
            }
        }
    };

    return (
        <Card className="p-4">
            <h2 className='mb-4'>Métodos de Pago Guardados</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            <h5 className="mb-3">Añadir Nueva Tarjeta</h5>
            <Form onSubmit={handleAddMethod} className="mb-5">
                 <Form.Group className="mb-3">
                    <Form.Label>Nombre del Titular</Form.Label>
                    <Form.Control type="text" name="holderName" value={formState.holderName} onChange={handleFormChange} required />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Número de Tarjeta</Form.Label>
                    <Form.Control type="text" name="numeroTarjeta" value={formState.numeroTarjeta} onChange={handleFormChange} placeholder="Usa un número de prueba válido" required />
                </Form.Group>
                <Row>
                     <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>Marca</Form.Label>
                            <Form.Select name="brand" value={formState.brand} onChange={handleFormChange}>
                                <option value="Visa">Visa</option>
                                <option value="Mastercard">Mastercard</option>
                                <option value="Amex">American Express</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Mes Venc. (MM)</Form.Label>
                            <Form.Control type="number" name="expMonth" value={formState.expMonth} onChange={handleFormChange} placeholder="MM" required />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                         <Form.Group>
                            <Form.Label>Año Venc. (AAAA)</Form.Label>
                            <Form.Control type="number" name="expYear" value={formState.expYear} onChange={handleFormChange} placeholder="AAAA" required />
                        </Form.Group>
                    </Col>
                </Row>
                <Button type="submit" variant="primary" className="mt-3">Guardar Tarjeta</Button>
            </Form>

            <h5 className="mb-3">Mis Tarjetas</h5>
            {loading ? <Spinner animation="border" /> : (
                <ListGroup>
                    {paymentMethods.length === 0 ? <ListGroup.Item>No tienes tarjetas guardadas.</ListGroup.Item> : (
                        paymentMethods.map(method => (
                            <ListGroup.Item key={method._id} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{method.brand}</strong> que termina en <strong>{method.last4}</strong>
                                    <br />
                                    <span className="text-muted">{method.holderName} - Vence: {method.expMonth}/{method.expYear}</span>
                                </div>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteMethod(method._id)}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            </ListGroup.Item>
                        ))
                    )}
                </ListGroup>
            )}
        </Card>
    );
};

export default PaymentMethodsPanel;