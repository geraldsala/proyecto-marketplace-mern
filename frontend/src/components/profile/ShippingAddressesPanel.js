// frontend/src/components/profile/ShippingAddressesPanel.js

import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, Spinner, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const ShippingAddressesPanel = () => {
    const { userInfo } = useContext(AuthContext);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newAddress, setNewAddress] = useState({ pais: '', provincia: '', casillero: '', codigoPostal: '', observaciones: '' });

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/users/profile', config);
            setAddresses(data.direccionesEnvio || []);
        } catch (err) {
            setError('No se pudieron cargar las direcciones.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userInfo) {
            fetchAddresses();
        }
    }, [userInfo]);

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.post('/api/users/addresses', newAddress, config);
            setAddresses(data);
            setNewAddress({ pais: '', provincia: '', casillero: '', codigoPostal: '', observaciones: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo añadir la dirección.');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.delete(`/api/users/addresses/${addressId}`, config);
                setAddresses(data);
            } catch (err) {
                setError('No se pudo eliminar la dirección.');
            }
        }
    };

    const handleFormChange = (e) => {
        setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
    };

    return (
        <Card className="p-4 border-0">
            <h2 className='mb-4'>Direcciones de Envío</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <h5 className="mb-3">Añadir Nueva Dirección</h5>
            <Form onSubmit={handleAddAddress} className="mb-5">
                <Row>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label>País</Form.Label><Form.Control type="text" name="pais" value={newAddress.pais} onChange={handleFormChange} required /></Form.Group></Col>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Provincia</Form.Label><Form.Control type="text" name="provincia" value={newAddress.provincia} onChange={handleFormChange} required /></Form.Group></Col>
                </Row>
                <Form.Group className="mb-3"><Form.Label>Dirección o Casillero</Form.Label><Form.Control type="text" name="casillero" value={newAddress.casillero} onChange={handleFormChange} required /></Form.Group>
                <Row>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Código Postal</Form.Label><Form.Control type="text" name="codigoPostal" value={newAddress.codigoPostal} onChange={handleFormChange} /></Form.Group></Col>
                </Row>
                <Form.Group className="mb-3"><Form.Label>Observaciones</Form.Label><Form.Control as="textarea" rows={2} name="observaciones" value={newAddress.observaciones} onChange={handleFormChange} /></Form.Group>
                <Button type="submit" variant="primary">Añadir Dirección</Button>
            </Form>
            <h5 className="mb-3 mt-5">Mis Direcciones Guardadas</h5>
            {loading ? <Spinner animation="border" /> : (
                <ListGroup>
                    {addresses.length === 0 ? <ListGroup.Item>No tienes direcciones guardadas.</ListGroup.Item> : (
                        addresses.map(addr => (
                            <ListGroup.Item key={addr._id} className="d-flex justify-content-between align-items-start">
                                <div>
                                    <strong>{addr.provincia}, {addr.pais}</strong><br />
                                    <small className="text-muted">{addr.casillero}</small><br/>
                                    <small>{addr.observaciones}</small>
                                </div>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteAddress(addr._id)}><FontAwesomeIcon icon={faTrash} /></Button>
                            </ListGroup.Item>
                        ))
                    )}
                </ListGroup>
            )}
        </Card>
    );
};

export default ShippingAddressesPanel;