import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className='footer text-center py-4 mt-auto' style={{ backgroundColor: '#1f2937', color: '#fff' }}>
      <Container>
        <Row className="justify-content-center align-items-center">
          <Col xs="auto">
            <p className='m-0'>
              Copyright &copy; 2025 Marketplace Tech.
            </p>
          </Col>
          <Col xs="auto">
            <p className='m-0'>
              <Link to="/terminos" style={{ color: '#4f46e5', textDecoration: 'underline' }}>
                Términos y Condiciones
              </Link>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;