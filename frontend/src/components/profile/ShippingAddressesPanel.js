// frontend/src/components/profile/ShippingAddressesPanel.js (Versión Corregida y Robusta)

import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Alert, Card, Spinner, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';

// Helper a prueba de balas que tenías en tu versión original. ¡Es una excelente idea, lo conservamos!
const asArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

const ShippingAddressesPanel = () => {
  const { userInfo } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Asegúrate de que los campos del estado coincidan con los del formulario
  const [newAddress, setNewAddress] = useState({ pais: '', provincia: '', direccion: '', zip: '', observaciones: '' });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 1. Usamos el servicio para obtener el perfil
        const profile = await userService.getProfile();
        
        // 2. APLICAMOS LA LÓGICA ROBUSTA ORIGINAL
        // Buscamos en múltiples posibles nombres de campo, igual que hacías antes.
        const list = profile?.direccionesEnvio ?? profile?.addresses ?? profile?.shippingAddresses ?? [];
        
        // 3. Usamos el helper para asegurar que siempre sea un array
        setAddresses(asArray(list));

      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar las direcciones.');
        setAddresses([]);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo) {
      fetchAddresses();
    }
  }, [userInfo]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const updatedAddresses = await userService.addShippingAddress(newAddress);
      setAddresses(updatedAddresses.addresses || []); // El backend devuelve { addresses: [...] }
      setNewAddress({ pais: '', provincia: '', direccion: '', zip: '', observaciones: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo añadir la dirección.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta dirección?')) return;
    try {
      const updatedData = await userService.deleteShippingAddress(addressId);
      // El backend puede devolver la lista completa o solo un mensaje
      setAddresses(updatedData.addresses || addresses.filter(a => a._id !== addressId));
    } catch (err) {
      setError('No se pudo eliminar la dirección.');
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
          <Form.Control type="text" name="direccion" value={newAddress.direccion} onChange={handleFormChange} required />
        </Form.Group>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Código Postal</Form.Label>
              <Form.Control type="text" name="zip" value={newAddress.zip} onChange={handleFormChange} />
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
          {addresses.length === 0 ? (
            <ListGroup.Item>No tienes direcciones guardadas.</ListGroup.Item>
          ) : (
            addresses.map((addr) => (
              <ListGroup.Item key={addr._id} className="d-flex justify-content-between align-items-start">
                <div>
                  <strong>{addr.provincia}, {addr.pais}</strong><br />
                  <small className="text-muted">{addr.direccion}</small><br />
                  {addr.observaciones && <small>{addr.observaciones}</small>}
                </div>
                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteAddress(addr._id)}>
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
