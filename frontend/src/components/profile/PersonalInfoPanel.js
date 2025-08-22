// frontend/src/components/profile/PersonalInfoPanel.js

import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext'; // Ajustamos la ruta del import

const PersonalInfoPanel = () => {
  const { userInfo, login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ nombreCompleto: '', email: '' });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userInfo) {
      setFormData({ nombreCompleto: userInfo.nombre, email: userInfo.email });
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setError('');
    setSuccess('');
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.put('/api/users/profile', { nombre: formData.nombreCompleto, email: formData.email, password }, config);
      login(data);
      setSuccess('Perfil actualizado correctamente');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Ocurrió un error inesperado');
    }
  };

  return (
    <Card className="p-4 border-0">
      <h2 className='mb-4'>Mi Perfil</h2>
      {error && <Alert variant='danger'>{error}</Alert>}
      {success && <Alert variant='success'>{success}</Alert>}
      <Form onSubmit={submitHandler}>
        <Form.Group controlId='nombreCompleto' className='mb-3'>
          <Form.Label>Nombre</Form.Label>
          <Form.Control type='text' placeholder='Ingresa tu nombre' value={formData.nombreCompleto} onChange={(e) => setFormData({...formData, nombreCompleto: e.target.value})} />
        </Form.Group>
        <Form.Group controlId='email' className='mb-3'>
          <Form.Label>Email</Form.Label>
          <Form.Control type='email' placeholder='Ingresa tu email' value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
        </Form.Group>
        <Form.Group controlId='password' className='mb-3'>
          <Form.Label>Nueva Contraseña (opcional)</Form.Label>
          <Form.Control type='password' placeholder='Ingresa tu nueva contraseña' value={password} onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>
        <Form.Group controlId='confirmPassword' className='mb-3'>
          <Form.Label>Confirmar Nueva Contraseña</Form.Label>
          <Form.Control type='password' placeholder='Confirma la nueva contraseña' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </Form.Group>
        <Button type='submit' variant='primary' className='w-100'>Actualizar</Button>
      </Form>
    </Card>
  );
};

export default PersonalInfoPanel;