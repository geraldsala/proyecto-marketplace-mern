import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruckFast } from '@fortawesome/free-solid-svg-icons';

// Esta es una suposición de cómo se ve tu CSS, puedes necesitar ajustar las clases
import './ProductCard.css'; 

const ProductCard = ({ product }) => {
  
  // Función para obtener la ruta base de la categoría
  const getCategoryPath = (category) => {
    if (!category) return 'producto'; // Ruta genérica por si acaso
    
    // El backend nos devuelve la categoría como objeto o como string (ID)
    const categoryName = (typeof category === 'object' ? category.nombre : String(category)).toLowerCase();
    
    if (categoryName.includes('portátiles') || categoryName.includes('laptop')) return 'laptop';
    if (categoryName.includes('audio')) return 'audio';
    if (categoryName.includes('celular')) return 'celular';
    if (categoryName.includes('smart')) return 'smart';

    return 'producto'; // Fallback
  };

  const categoryPath = getCategoryPath(product.categoria);

  return (
    <article className="product-card">
      <div className="thumb">
        {product.stock === 0 && <span className="badge-out">SIN STOCK</span>}
        <img src={product.imagenes?.[0]} alt={product.nombre} />
      </div>
      <div className="p-body">
        <div className="badges">
          {product.tiempoEnvio && 
            <span className="badge-ship">
              <FontAwesomeIcon icon={faTruckFast} className="me-1" />
              {product.tiempoEnvio}
            </span>
          }
        </div>
        <h6 className="title">{product.nombre}</h6>
        <div className="price">₡{product.precio.toLocaleString('es-CR')}</div>
        <div className="actions">
          <LinkContainer to={`/producto/${categoryPath}/${product._id}`}>
            <Button size="sm" variant="dark">Ver detalle</Button>
          </LinkContainer>
          <Button size="sm" variant="outline-dark">Agregar</Button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;