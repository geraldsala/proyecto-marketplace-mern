// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faBoxOpen,
  faCreditCard,
  faMapMarkerAlt,
  faHistory,
  faStore,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

// Paneles
import PersonalInfoPanel from '../components/profile/PersonalInfoPanel';
import ProductPanel from '../components/profile/ProductPanel';
import ShippingAddressesPanel from '../components/profile/ShippingAddressesPanel';
import PaymentMethodsPanel from '../components/profile/PaymentMethodsPanel';
import MySubscriptionsPanel from '../components/profile/MySubscriptionsPanel';
import MySubscribersPanel from '../components/profile/MySubscribersPanel';
import PurchaseHistoryPanel from '../components/profile/PurchaseHistoryPanel';

const ProfilePage = () => {
  const { userInfo } = useAuth();
  const [activePanel, setActivePanel] = useState('info');

  useEffect(() => {
    if (userInfo) {
      setActivePanel(userInfo.tipoUsuario === 'tienda' ? 'products' : 'info');
    }
  }, [userInfo]);

  if (!userInfo) {
    return (
      <Container className="my-4">
        <Alert variant="warning">Debes iniciar sesión para ver tu panel.</Alert>
      </Container>
    );
  }

  const renderPanel = () => {
    switch (activePanel) {
      case 'info':
        return <PersonalInfoPanel />;
      case 'products':
        return <ProductPanel />;
      case 'addresses':
        return <ShippingAddressesPanel />;
      case 'payments':
        return <PaymentMethodsPanel />;
      case 'subscriptions':
        return <MySubscriptionsPanel />;
      case 'subscribers':
        return <MySubscribersPanel />;
      case 'history':
        return <PurchaseHistoryPanel />;
      default:
        return <PersonalInfoPanel />;
    }
  };

  return (
    <Container fluid className="profile-page-container my-4">
      <Row>
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
                <>
                  <Nav.Link
                    className={`profile-nav-link ${activePanel === 'products' ? 'active' : ''}`}
                    onClick={() => setActivePanel('products')}
                  >
                    <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
                    Panel de Productos
                  </Nav.Link>
                  <Nav.Link
                    className={`profile-nav-link ${activePanel === 'subscribers' ? 'active' : ''}`}
                    onClick={() => setActivePanel('subscribers')}
                  >
                    <FontAwesomeIcon icon={faStore} className="me-2" />
                    Mis Suscriptores
                  </Nav.Link>
                </>
              )}

              {userInfo.tipoUsuario === 'comprador' && (
                <>
                  <Nav.Link
                    className={`profile-nav-link ${activePanel === 'addresses' ? 'active' : ''}`}
                    onClick={() => setActivePanel('addresses')}
                  >
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                    Direcciones
                  </Nav.Link>
                  <Nav.Link
                    className={`profile-nav-link ${activePanel === 'payments' ? 'active' : ''}`}
                    onClick={() => setActivePanel('payments')}
                  >
                    <FontAwesomeIcon icon={faCreditCard} className="me-2" />
                    Métodos de Pago
                  </Nav.Link>
                  <Nav.Link
                    className={`profile-nav-link ${activePanel === 'subscriptions' ? 'active' : ''}`}
                    onClick={() => setActivePanel('subscriptions')}
                  >
                    <FontAwesomeIcon icon={faStore} className="me-2" />
                    Mis Suscripciones
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

        <Col md={9}>
          <div className="profile-content">{renderPanel()}</div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;
