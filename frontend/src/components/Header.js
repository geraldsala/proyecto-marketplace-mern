import React, { useContext } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav, Container, NavDropdown, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Importamos solo los iconos que necesitamos
import { 
  faMicrochip, faShoppingCart, faUser, faStore, faSearch, 
  faLaptop, faHeadphones, faMobileAlt, faHome, faSignOutAlt, 
  faUserCog, faHistory 
} from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { userInfo, logout } = useContext(AuthContext);

  const logoutHandler = () => {
    logout();
  };

  return (
    <header className="header-container">
      <Navbar expand="lg" collapseOnSelect className="main-navbar">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand className="d-flex align-items-center">
              <FontAwesomeIcon icon={faMicrochip} className="me-2" size="lg" />
              <span className="brand-text">Marketplace Tech</span>
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto main-nav-links">
              <LinkContainer to="/laptops"><Nav.Link><FontAwesomeIcon icon={faLaptop} className="me-1" /> Laptops</Nav.Link></LinkContainer>
              <LinkContainer to="/audio"><Nav.Link><FontAwesomeIcon icon={faHeadphones} className="me-1" /> Audio</Nav.Link></LinkContainer>
              <LinkContainer to="/celulares"><Nav.Link><FontAwesomeIcon icon={faMobileAlt} className="me-1" /> Celulares</Nav.Link></LinkContainer>
              <LinkContainer to="/smarthome"><Nav.Link><FontAwesomeIcon icon={faHome} className="me-1" /> Smart Home</Nav.Link></LinkContainer>
            </Nav>

            <Nav className="nav-icons">
              <LinkContainer to="/cart">
                <Nav.Link className="position-relative">
                  <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                </Nav.Link>
              </LinkContainer>

              {userInfo ? (
                <NavDropdown title={<FontAwesomeIcon icon={faUser} size="lg" />} id="username-dropdown" align="end">
                  <NavDropdown.Header>Hola, {userInfo.nombre}</NavDropdown.Header>
                  <LinkContainer to="/profile">
                    <NavDropdown.Item><FontAwesomeIcon icon={faUser} className='me-2' />Mi Perfil</NavDropdown.Item>
                  </LinkContainer>
                  
                  {userInfo.tipoUsuario === 'comprador' && (
                    <LinkContainer to='/purchase-history'>
                      <NavDropdown.Item><FontAwesomeIcon icon={faHistory} className='me-2' /> Mis Compras</NavDropdown.Item>
                    </LinkContainer>
                  )}
                  {userInfo.tipoUsuario === 'tienda' && (
                    <LinkContainer to="/store-panel">
                      <NavDropdown.Item><FontAwesomeIcon icon={faStore} className="me-2" /> Panel de Tienda</NavDropdown.Item>
                    </LinkContainer>
                  )}
                  {userInfo.tipoUsuario === 'admin' && (
                     <LinkContainer to='/admin'>
                       <NavDropdown.Item><FontAwesomeIcon icon={faUserCog} className='me-2' /> Panel Admin</NavDropdown.Item>
                    </LinkContainer>
                  )}
                  
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logoutHandler}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />Cerrar Sesión
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link>
                    <FontAwesomeIcon icon={faUser} size="lg" />
                  </Nav.Link>
                </LinkContainer>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <div className="search-bar-container py-2">
        <Container>
            <Form className="d-flex">
                <Form.Control type="search" placeholder="Buscar productos, marcas y más..." className="me-2 search-input" aria-label="Search" />
                <Button variant="primary" className="search-button"><FontAwesomeIcon icon={faSearch} /></Button>
            </Form>
        </Container>
      </div>
    </header>
  );
};

export default Header;