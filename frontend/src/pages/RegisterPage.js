// frontend/src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Container } from 'react-bootstrap';

const RegisterPage = () => {
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pais, setPais] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setSuccess('');
    } else {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
          },
        };

        const userData = {
          cedula,
          nombre,
          email,
          password,
          tipoUsuario: 'comprador',
          pais,
          direccion,
          telefono,
        };

        const { data } = await axios.post('http://localhost:5000/api/auth/register', userData, config);

        setSuccess('¡Registro exitoso! Serás redirigido para iniciar sesión.');
        setError('');
        
        setTimeout(() => {
          navigate('/login', { state: { message: '¡Registro exitoso! Por favor, inicia sesión.' } });
        }, 2000);

      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
            setError(err.response.data.message);
        } else {
            setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
        }
        setSuccess('');
      }
    }
  };

  return (
    <Container>
      <Row className='justify-content-center mt-5'>
        <Col md={6}>
          <div className='register-container p-4 border rounded'>
            <h1 className='text-center mb-4'>Crear Cuenta</h1>
            {error && <Alert variant='danger'>{error}</Alert>}
            {success && <Alert variant='success'>{success}</Alert>}
            <Form onSubmit={submitHandler}>
              <Form.Group controlId='cedula' className='mb-3'>
                <Form.Label>Cédula</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Ingresa tu cédula'
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId='nombre' className='mb-3'>
                <Form.Label>Nombre Completo</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Ingresa tu nombre'
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </Form.Group>
              
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

              <Form.Group controlId='confirmPassword' className='mb-3'>
                <Form.Label>Confirmar Contraseña</Form.Label>
                <Form.Control
                  type='password'
                  placeholder='Confirma tu contraseña'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId='pais' className='mb-3'>
                <Form.Label>País</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Ingresa tu país'
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId='direccion' className='mb-3'>
                <Form.Label>Dirección</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Ingresa tu dirección'
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId='telefono' className='mb-3'>
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Ingresa tu teléfono'
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  required
                />
              </Form.Group>

              <Button type='submit' variant='primary' className='w-100 mt-3'>
                Registrarse
              </Button>
            </Form>

            <Row className='py-3'>
              <Col>
                ¿Ya tienes una cuenta?{' '}
                <Link to='/login'>
                  Inicia Sesión
                </Link>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;