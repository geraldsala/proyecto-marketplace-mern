// frontend/src/components/profile/PersonalInfoPanel.js (Versión Mejorada)

import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService'; // Usamos el servicio

const PersonalInfoPanel = () => {
  const { userInfo, setUserInfo } = useAuth(); // Obtenemos la función para actualizar el estado
  const [formData, setFormData] = useState({ nombre: '', email: '' });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userInfo) {
      setFormData({ nombre: userInfo.nombre, email: userInfo.email });
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
      // Usamos la función del servicio para actualizar el perfil
      const updatedUser = await userService.updateProfile({ 
          nombre: formData.nombre, 
          email: formData.email, 
          password 
      });

      // Actualizamos el estado global y el localStorage
      setUserInfo(updatedUser); 
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));

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
        <Form.Group controlId='nombre' className='mb-3'>
          <Form.Label>Nombre</Form.Label>
          <Form.Control type='text' value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
        </Form.Group>
        <Form.Group controlId='email' className='mb-3'>
          <Form.Label>Email</Form.Label>
          <Form.Control type='email' value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
        </Form.Group>
        <Form.Group controlId='password' className='mb-3'>
          <Form.Label>Nueva Contraseña (opcional)</Form.Label>
          <Form.Control type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>
        <Form.Group controlId='confirmPassword' className='mb-3'>
          <Form.Label>Confirmar Nueva Contraseña</Form.Label>
          <Form.Control type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </Form.Group>
        <Button type='submit' variant='primary' className='w-100'>Actualizar</Button>
      </Form>
    </Card>
  );
};

export default PersonalInfoPanel;