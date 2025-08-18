// frontend/src/components/ProductCard.js
import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const ProductCard = ({ product }) => {
  return (
    <Card className='my-3 p-3 rounded h-100 d-flex flex-column'>
      <Link to={`/product/${product._id}`}>
        <Card.Img src={product.imagenes[0]} variant='top' />
      </Link>
      <Card.Body className='d-flex flex-column'>
        <Link to={`/product/${product._id}`}>
          <Card.Title as='div'>
            <strong>{product.nombre}</strong>
          </Card.Title>
        </Link>

        <Card.Text as='div'>
          <div className='my-3'>
            {product.calificacionPromedio} <FontAwesomeIcon icon={faStar} className='text-warning' />
            {' '}de {product.numCalificaciones} opiniones
          </div>
        </Card.Text>

        <Card.Text as='h3' className='mt-auto'>${product.precio}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
   