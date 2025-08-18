import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Nav, Form, Button, Alert, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBoxOpen, faCreditCard, faMapMarkerAlt, faHistory } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './ProfilePage.css';

// Componente para el panel de Información Personal
const PersonalInfoPanel = () => {
  const { userInfo, login } = useContext(AuthContext);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userInfo) {
      setNombre(userInfo.nombre);
      setEmail(userInfo.email);
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
      const { data } = await axios.put(
        'http://localhost:5000/api/users/profile',
        { nombre, email, password },
        config
      );
      login(data); // Actualiza el contexto y localStorage
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
          <Form.Label>Nueva Contraseña (opcional)</Form.Label>
          <Form.Control
            type='password'
            placeholder='Ingresa tu nueva contraseña'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId='confirmPassword' className='mb-3'>
          <Form.Label>Confirmar Nueva Contraseña</Form.Label>
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
  );
};

// Paneles simulados para las otras secciones
const ProductPanel = () => <Card className="p-4 border-0"><h2>Panel de Productos</h2><p>Aquí podrás ver, crear, editar y eliminar tus productos.</p></Card>;
const PaymentMethodsPanel = () => <Card className="p-4 border-0"><h2>Métodos de Pago</h2><p>Aquí podrás gestionar tus tarjetas.</p></Card>;
const ShippingAddressesPanel = () => <Card className="p-4 border-0"><h2>Direcciones de Envío</h2><p>Aquí podrás gestionar tus direcciones.</p></Card>;
const PurchaseHistoryPanel = () => <Card className="p-4 border-0"><h2>Historial de Compras</h2><p>Aquí verás tus compras anteriores.</p></Card>;


const ProfilePage = () => {
  const { userInfo } = useContext(AuthContext);
  const [activePanel, setActivePanel] = useState('info');

  if (!userInfo) {
    return <Container className="my-4"><Alert variant="warning">Debes iniciar sesión para ver tu perfil.</Alert></Container>;
  }

  const renderPanel = () => {
    switch (activePanel) {
      case 'info':
        return <PersonalInfoPanel />;
      case 'products':
        return <ProductPanel />;
      case 'payments':
        return <PaymentMethodsPanel />;
      case 'addresses':
        return <ShippingAddressesPanel />;
      case 'history':
        return <PurchaseHistoryPanel />;
      default:
        return <PersonalInfoPanel />;
    }
  };

  return (
    <Container fluid className="profile-page-container my-4">
      <Row>
        {/* Columna del Menú de Navegación (Sidebar) */}
        <Col md={3}>
          <div className="profile-sidebar">
            <h4 className="sidebar-title">
              {userInfo.tipoUsuario === 'tienda' ? 'Panel de Tienda' : 'Mi Cuenta'}
            </h4>
            <Nav className="flex-column profile-nav">
              <Nav.Link 
                className={`profile-nav-link ${activePanel === 'info' ? 'active' : ''}`}
                onClick={() => setActivePanel('info')}
              >
                <FontAwesomeIcon icon={faUser} className="me-2" />
                Información Personal
              </Nav.Link>

              {userInfo.tipoUsuario === 'tienda' && (
                <Nav.Link 
                  className={`profile-nav-link ${activePanel === 'products' ? 'active' : ''}`}
                  onClick={() => setActivePanel('products')}
                >
                  <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
                  Panel de Productos
                </Nav.Link>
              )}

              {userInfo.tipoUsuario === 'comprador' && (
                <>
                  <Nav.Link 
                    className={`profile-nav-link ${activePanel === 'addresses' ? 'active' : ''}`}
                    onClick={() => setActivePanel('addresses')}
                  >
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                    Direcciones de Envío
                  </Nav.Link>
                  <Nav.Link 
                    className={`profile-nav-link ${activePanel === 'payments' ? 'active' : ''}`}
                    onClick={() => setActivePanel('payments')}
                  >
                    <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                    Métodos de Pago
                  </Nav.Link>
                   <Nav.Link 
                    className={`profile-nav-link ${activePanel === 'history' ? 'active' : ''}`}
                    onClick={() => setActivePanel('history')}
                  >
                    <FontAwesomeIcon icon={faHistory} className="me-2" />
                    Historial de Compras
                  </Nav.Link>
                </>
              )}
            </Nav>
          </div>
        </Col>

        {/* Columna del Contenido Principal */}
        <Col md={9}>
          <div className="profile-content">
            {renderPanel()}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;