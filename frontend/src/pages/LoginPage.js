// frontend/src/pages/LoginPage.js
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import AuthContext from '../context/AuthContext'; // Importamos el contexto
import { Container } from 'react-bootstrap';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo, login } = useContext(AuthContext); // Accedemos al estado y a la función de login

  useEffect(() => {
    // Si ya está logueado, redirigir a inicio
    if (userInfo) {
      navigate('/');
    }
    // Si hay un mensaje de registro exitoso, mostrarlo
    if (location.state && location.state.message) {
      setSuccessMessage(location.state.message);
    }
  }, [userInfo, navigate, location]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        'http://localhost:5000/api/auth/login',
        { email, password },
        config
      );

      login(data); // Usamos la función del contexto para guardar el usuario globalmente
    } catch (err) {
      setError(err.response?.data?.message || 'Ocurrió un error inesperado');
      setSuccessMessage('');
    }
  };

  return (
    <Container>
      <Row className='justify-content-center mt-5'>
        <Col md={6}>
          <div className='login-container p-4 border rounded'>
            <h1 className='text-center mb-4'>Iniciar Sesión</h1>
            {successMessage && <Alert variant='success'>{successMessage}</Alert>}
            {error && <Alert variant='danger'>{error}</Alert>}
            <Form onSubmit={submitHandler}>
              <Form.Group controlId='email' className='mb-3'>
                <Form.Label>Correo Electrónico</Form.Label>
                <Form.Control
                  type='email'
                  placeholder='Ingresa tu correo'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId='password' className='mb-3'>
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type='password'
                  placeholder='Ingresa tu contraseña'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button type='submit' variant='primary' className='w-100'>
                Iniciar Sesión
              </Button>
            </Form>

            <Row className='py-3'>
              <Col>
                ¿Eres nuevo?{' '}
                <Link to='/register'>
                  Regístrate
                </Link>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;