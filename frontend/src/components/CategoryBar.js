// frontend/src/components/CategoryBar.js
import React from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const CategoryBar = () => {
  return (
    <Nav className='justify-content-center category-bar'>
      <LinkContainer to='/laptops'>
        <Nav.Link>Laptops</Nav.Link>
      </LinkContainer>
      <LinkContainer to='/audio'>
        <Nav.Link>Audio</Nav.Link>
      </LinkContainer>
      <LinkContainer to='/celulares'>
        <Nav.Link>Celulares</Nav.Link>
      </LinkContainer>
      <LinkContainer to='/smarthome'>
        <Nav.Link>Smart Home</Nav.Link>
      </LinkContainer>
    </Nav>
  );
};

export default CategoryBar;