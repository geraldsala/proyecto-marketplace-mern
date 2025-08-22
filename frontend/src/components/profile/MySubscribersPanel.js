// frontend/src/components/profile/MySubscribersPanel.js

import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Spinner, Alert, Image } from 'react-bootstrap';
import productService from '../../services/productService';

const MySubscribersPanel = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const data = await productService.getMySubscribers();
        setSubscribers(data);
      } catch (err) {
        setError('No se pudieron cargar tus suscriptores.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubscribers();
  }, []);

  return (
    <Card className="p-4 border-0">
      <h2 className='mb-4'>Mis Suscriptores</h2>
      {loading ? <Spinner animation="border" /> : error ? <Alert variant="danger">{error}</Alert> : (
        <ListGroup>
          {subscribers.length === 0 ? (
            <ListGroup.Item>Aún no tienes suscriptores.</ListGroup.Item>
          ) : (
            subscribers.map(user => (
              <ListGroup.Item key={user._id} className="d-flex align-items-center">
                <Image src={user.fotoLogo} alt={user.nombre} roundedCircle style={{ width: '50px', height: '50px', marginRight: '15px' }} />
                <strong>{user.nombre}</strong>
              </ListGroup.Item>
            ))
          )}
        </ListGroup>
      )}
    </Card>
  );
};

export default MySubscribersPanel;