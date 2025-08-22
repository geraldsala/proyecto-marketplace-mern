// frontend/src/components/profile/MySubscriptionsPanel.js

import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Spinner, Alert, Image } from 'react-bootstrap';
import productService from '../../services/productService';

const MySubscriptionsPanel = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const data = await productService.getMySubscriptions();
        setStores(data);
      } catch (err) {
        setError('No se pudieron cargar tus suscripciones.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  return (
    <Card className="p-4 border-0">
      <h2 className='mb-4'>Tiendas que Sigues</h2>
      {loading ? <Spinner animation="border" /> : error ? <Alert variant="danger">{error}</Alert> : (
        <ListGroup>
          {stores.length === 0 ? (
            <ListGroup.Item>No sigues a ninguna tienda.</ListGroup.Item>
          ) : (
            stores.map(store => (
              <ListGroup.Item key={store._id} className="d-flex align-items-center">
                <Image src={store.fotoLogo} alt={store.nombreTienda} roundedCircle style={{ width: '50px', height: '50px', marginRight: '15px' }} />
                <strong>{store.nombreTienda}</strong>
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      )}
    </Card>
  );
};

export default MySubscriptionsPanel;