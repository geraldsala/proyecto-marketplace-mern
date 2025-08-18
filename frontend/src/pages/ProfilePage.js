// frontend/src/pages/ProfilePage.js
import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Row, Col, Alert, ListGroup, Card } from 'react-bootstrap';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCreditCard, faTruck, faHistory, faStore } from '@fortawesome/free-solid-svg-icons';

const ProfilePage = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { userInfo, login } = useContext(AuthContext);

  useEffect(() => {
    if (userInfo) {
      setNombre(userInfo.nombre);
      setEmail(userInfo.email);
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
    } else {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.put(
          'http://localhost:5000/api/users/profile',
          { nombre, email, password },
          config
        );

        login(data);
        setSuccess('Perfil actualizado correctamente');
      } catch (err) {
        setError(err.response?.data?.message || 'Ocurrió un error inesperado');
      }
    }
  };

  return (
    <Container className='mt-5'>
      <Row>
        <Col md={3}>
          <Card className='shadow-sm'>
            <Card.Header className='bg-primary text-white'>
              <h4>Panel de {userInfo?.tipoUsuario}</h4>
            </Card.Header>
            <ListGroup variant='flush'>
              <LinkContainer to='/profile'>
                <ListGroup.Item action active>
                  <Button variant='link' className='w-100 text-start'>
                    <FontAwesomeIcon icon={faUser} className='me-1' /> Información Personal
                  </Button>
                </ListGroup.Item>
              </LinkContainer>
              {userInfo?.tipoUsuario === 'comprador' && (
                <>
                  <ListGroup.Item action>
                    <Button variant='link' className='w-100 text-start'>
                      <FontAwesomeIcon icon={faTruck} className='me-1' /> Direcciones de Envío
                    </Button>
                  </ListGroup.Item>
                  <ListGroup.Item action>
                    <Button variant='link' className='w-100 text-start'>
                      <FontAwesomeIcon icon={faCreditCard} className='me-1' /> Formas de Pago
                    </Button>
                  </ListGroup.Item>
                  <LinkContainer to='/purchase-history'>
                    <ListGroup.Item action>
                      <Button variant='link' className='w-100 text-start'>
                        <FontAwesomeIcon icon={faHistory} className='me-1' /> Historial de Compras
                      </Button>
                    </ListGroup.Item>
                  </LinkContainer>
                </>
              )}
              {userInfo?.tipoUsuario === 'tienda' && (
                <LinkContainer to='/store-panel'>
                  <ListGroup.Item action>
                    <Button variant='link' className='w-100 text-start'>
                      <FontAwesomeIcon icon={faStore} className='me-1' /> Panel de Productos
                    </Button>
                  </ListGroup.Item>
                </LinkContainer>
              )}
            </ListGroup>
          </Card>
        </Col>
        <Col md={9}>
          <Card className='p-4 shadow-sm'>
            <h2 className='mb-4 text-center'>Mi Perfil</h2>
            {error && <Alert variant='danger'>{error}</Alert>}
            {success && <Alert variant='success'>{success}</Alert>}
            <Form onSubmit={submitHandler}>
              <Form.Group controlId='nombre' className='mb-3'>
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Ingresa tu nombre'
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId='email' className='mb-3'>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type='email'
                  placeholder='Ingresa tu email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId='password' className='mb-3'>
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type='password'
                  placeholder='Ingresa tu nueva contraseña'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId='confirmPassword' className='mb-3'>
                <Form.Label>Confirmar Contraseña</Form.Label>
                <Form.Control
                  type='password'
                  placeholder='Confirma la nueva contraseña'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Form.Group>
              <Button type='submit' variant='primary' className='w-100'>
                Actualizar
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;