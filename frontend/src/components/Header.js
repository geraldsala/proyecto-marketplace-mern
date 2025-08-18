// frontend/src/components/Header.js
import React, { useContext } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav, Container, NavDropdown, Form, FormControl, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip, faShoppingCart, faUser, faUserCog, faStore, faHistory, faSearch, faLaptop, faHeadphones, faMobileAlt, faHome } from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../context/AuthContext';

const Header = () => {
  const { userInfo, logout } = useContext(AuthContext);

  const logoutHandler = () => {
    logout();
  };

  return (
    <header>
      <Navbar bg='light' expand='lg' collapseOnSelect className='py-3 header'>
        <Container>
          <LinkContainer to='/'>
            <Navbar.Brand>
              <FontAwesomeIcon icon={faMicrochip} className='me-2' />
              Marketplace Tech
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='mx-auto'>
              <NavDropdown title='Categorías' id='categories-dropdown'>
                <LinkContainer to='/laptops'>
                  <NavDropdown.Item><FontAwesomeIcon icon={faLaptop} className='me-2' /> Laptops</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to='/audio'>
                  <NavDropdown.Item><FontAwesomeIcon icon={faHeadphones} className='me-2' /> Audio</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to='/celulares'>
                  <NavDropdown.Item><FontAwesomeIcon icon={faMobileAlt} className='me-2' /> Celulares</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to='/smarthome'>
                  <NavDropdown.Item><FontAwesomeIcon icon={faHome} className='me-2' /> Smart Home</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
            </Nav>

            <Form className='d-flex mx-auto'>
              <FormControl
                type='search'
                placeholder='Buscar productos...'
                className='me-2'
                aria-label='Search'
              />
              <Button variant='outline-primary'>
                <FontAwesomeIcon icon={faSearch} />
              </Button>
            </Form>
            
            <Nav>
              <LinkContainer to='/cart'>
                <Nav.Link className='mx-2 d-flex align-items-center'>
                  <FontAwesomeIcon icon={faShoppingCart} className='me-1' /> Carrito
                </Nav.Link>
              </LinkContainer>
              {userInfo ? (
                <NavDropdown title={userInfo.nombre} id='username'>
                  <LinkContainer to='/profile'>
                    <NavDropdown.Item>
                      <FontAwesomeIcon icon={faUser} className='me-1' /> Perfil
                    </NavDropdown.Item>
                  </LinkContainer>
                  {userInfo.tipoUsuario === 'comprador' && (
                    <LinkContainer to='/purchase-history'>
                      <NavDropdown.Item>
                        <FontAwesomeIcon icon={faHistory} className='me-1' /> Mis Compras
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}
                  {userInfo.tipoUsuario === 'tienda' && (
                    <LinkContainer to='/store-panel'>
                      <NavDropdown.Item>
                        <FontAwesomeIcon icon={faStore} className='me-1' /> Panel Tienda
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}
                  {userInfo.tipoUsuario === 'admin' && (
                    <LinkContainer to='/admin'>
                      <NavDropdown.Item>
                        <FontAwesomeIcon icon={faUserCog} className='me-1' /> Panel Admin
                      </NavDropdown.Item>
                    </LinkContainer>
                  )}
                  <NavDropdown.Item onClick={logoutHandler}>
                    Cerrar Sesión
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to='/login'>
                  <Nav.Link className='mx-2 d-flex align-items-center'>
                    <FontAwesomeIcon icon={faUser} className='me-1' /> Iniciar Sesión
                  </Nav.Link>
                </LinkContainer>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;