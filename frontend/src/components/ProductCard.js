import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruckFast } from '@fortawesome/free-solid-svg-icons';

// Asumimos que la estructura de tu ProductCard es similar a esta.
// Si es diferente, solo necesitas aplicar el cambio en la línea del precio.
const ProductCard = ({ product }) => {
  // Función para determinar la ruta correcta según la categoría
  const getProductLink = (category) => {
    switch (category.toLowerCase()) {
      case 'laptops':
        return `/producto/laptop/${product._id}`;
      case 'audio':
        return `/producto/audio/${product._id}`;
      case 'celulares':
        return `/producto/celular/${product._id}`;
      case 'smart home':
        return `/producto/smart/${product._id}`;
      default:
        return `/product/${product._id}`;
    }
  };

  return (
    <Card className="my-3 rounded shadow-sm h-100 product-card-hover">
      <Link to={getProductLink(product.categoria)}>
        <Card.Img src={product.imagenes[0]} variant="top" className="product-card-img" />
      </Link>
      <Card.Body className="d-flex flex-column">
        <Link to={getProductLink(product.categoria)} className="text-decoration-none">
          <Card.Title as="div" className="product-title">
            <strong>{product.nombre}</strong>
          </Card.Title>
        </Link>
        
        {/* --- LÍNEA AÑADIDA --- */}
        <div className="product-brand text-muted mb-2">{product.brand}</div>
        {/* -------------------- */}

        <Card.Text as="div" className="mt-auto">
          <div className="mb-2">
            <FontAwesomeIcon icon={faTruckFast} className="me-2" color="var(--accent-primary)" />
            <small className="text-muted">{product.tiempoEnvio}</small>
          </div>
          
          <h3 className="product-price">
            ₡{product.precio.toLocaleString('es-CR')}
          </h3>
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;