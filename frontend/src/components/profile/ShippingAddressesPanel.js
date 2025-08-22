// frontend/src/components/profile/ShippingAddressesPanel.js (Versión Mejorada)

import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Alert, Card, Spinner, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService'; // Usamos el servicio

const ShippingAddressesPanel = () => {
  const { userInfo } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newAddress, setNewAddress] = useState({ pais: '', provincia: '', direccion: '', zip: '', observaciones: '' });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        // Usamos el servicio para obtener el perfil completo
        const profile = await userService.getProfile(); 
        setAddresses(profile.addresses || []);
      } catch (err) {
        setError('No se pudieron cargar las direcciones.');
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
      setAddresses(updatedAddresses);
      setNewAddress({ pais: '', provincia: '', direccion: '', zip: '', observaciones: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo añadir la dirección.');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta dirección?')) return;
    try {
      const updatedAddresses = await userService.deleteShippingAddress(addressId);
      setAddresses(updatedAddresses);
    } catch (err) {
      setError('No se pudo eliminar la dirección.');
    }
  };

  const handleFormChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  // Tu formulario y la lista de direcciones se quedan igual.

  return (
    // Pega aquí todo tu JSX de <Card> a </Card> sin cambios.
    // Solo la lógica de arriba es la que se modifica.
    <Card className="p-4 border-0">
        {/* Tu JSX existente */}
    </Card>
  );
};

export default ShippingAddressesPanel;
