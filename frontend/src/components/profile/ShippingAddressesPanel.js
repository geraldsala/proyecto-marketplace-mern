// frontend/src/components/profile/ShippingAddressesPanel.js

import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card, Spinner, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

// ✅ Helper a prueba de balas: siempre devuelve un array plano
const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

const ShippingAddressesPanel = () => {
  const { userInfo } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]); // nunca null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newAddress, setNewAddress] = useState({ pais: '', provincia: '', casillero: '', codigoPostal: '', observaciones: '' });

  const authConfig = () => ({ headers: { Authorization: `Bearer ${userInfo?.token}` } });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError('');
      if (!userInfo?.token) throw new Error('No auth');
      const { data } = await axios.get('/api/users/profile', authConfig());
      // Intenta múltiples llaves posibles y normaliza a array
      const list = data?.direccionesEnvio ?? data?.addresses ?? data?.shippingAddresses ?? data?.data?.addresses ?? [];
      setAddresses(asArray(list));
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las direcciones.');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo) fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.token]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!userInfo?.token) throw new Error('No auth');
      const { data } = await axios.post('/api/users/addresses', newAddress, authConfig());
      // Backend puede devolver: A) {addresses:[...]}, B) una dirección (objeto), C) array
      setAddresses((prev) => {
        if (Array.isArray(data?.addresses)) return asArray(data.addresses);
        return [...asArray(prev), ...asArray(data)];
      });
      setNewAddress({ pais: '', provincia: '', casillero: '', codigoPostal: '', observaciones: '' });
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'No se pudo añadir la dirección.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta dirección?')) return;
    try {
      if (!userInfo?.token) throw new Error('No auth');
      const { data } = await axios.delete(`/api/users/addresses/${addressId}`, authConfig());
      // Si server devuelve {addresses:[...]}, úsalo; si no, filtramos local
      setAddresses((prev) => {
        if (Array.isArray(data?.addresses)) return asArray(data.addresses);
        return asArray(prev).filter((a) => String(a?._id ?? a?.id) !== String(addressId));
      });
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar la dirección.');
    }
  };

  const handleFormChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  // 🔒 Normalización extra antes del render por si en algún punto quedó {addresses:[...]}
  const list = asArray(addresses?.addresses ?? addresses);

  // Debug opcional
  // console.log('addresses (raw):', addresses);
  // console.log('list used to render:', list);

  return (
    <Card className="p-4 border-0">
      <h2 className='mb-4'>Direcciones de Envío</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <h5 className="mb-3">Añadir Nueva Dirección</h5>
      <Form onSubmit={handleAddAddress} className="mb-5">
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>País</Form.Label>
              <Form.Control type="text" name="pais" value={newAddress.pais} onChange={handleFormChange} required />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Provincia</Form.Label>
              <Form.Control type="text" name="provincia" value={newAddress.provincia} onChange={handleFormChange} required />
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>Dirección o Casillero</Form.Label>
          <Form.Control type="text" name="casillero" value={newAddress.casillero} onChange={handleFormChange} required />
        </Form.Group>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Código Postal</Form.Label>
              <Form.Control type="text" name="codigoPostal" value={newAddress.codigoPostal} onChange={handleFormChange} />
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label>Observaciones</Form.Label>
          <Form.Control as="textarea" rows={2} name="observaciones" value={newAddress.observaciones} onChange={handleFormChange} />
        </Form.Group>
        <Button type="submit" variant="primary">Añadir Dirección</Button>
      </Form>

      <h5 className="mb-3 mt-5">Mis Direcciones Guardadas</h5>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <ListGroup>
          {list.length === 0 ? (
            <ListGroup.Item>No tienes direcciones guardadas.</ListGroup.Item>
          ) : (
            list.map((addr) => (
              <ListGroup.Item key={String(addr?._id ?? addr?.id ?? `${addr?.provincia}-${addr?.pais}-${addr?.casillero}`)} className="d-flex justify-content-between align-items-start">
                <div>
                  <strong>{addr?.provincia}, {addr?.pais}</strong><br />
                  <small className="text-muted">{addr?.casillero}</small><br />
                  <small>{addr?.observaciones}</small>
                </div>
                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteAddress(addr?._id ?? addr?.id)}>
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

export default ShippingAddressesPanel;
