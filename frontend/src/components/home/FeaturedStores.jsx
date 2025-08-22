import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './FeaturedStores.css';

const defaultStores = [
  {
    id: 'tienda-1',
    nombre: 'Tech & Gadgets',
    descripcion: 'Electrónica y accesorios',
    img: 'https://tse1.mm.bing.net/th/id/OIP.uFbKNC59InbHZxS3BZpoIQHaE7?pid=Api',
  },
  {
    id: 'tienda-2',
    nombre: 'Moda Urbana',
    descripcion: 'Ropa y estilo de calle',
    img: 'https://tse4.mm.bing.net/th/id/OIP.sSwh3lc47c6tnKuKu65NAgHaE7?pid=Api',
  },
  {
    id: 'tienda-3',
    nombre: 'Casa & Deco',
    descripcion: 'Muebles y decoración',
    img: 'https://tse4.mm.bing.net/th/id/OIP.se-fBouGM5G0WNzF4R43eAHaF_?pid=Api',
  },
  {
    id: 'tienda-4',
    nombre: 'Arte & Diseño',
    descripcion: 'Ilustraciones y posters',
    img: 'https://tse1.mm.bing.net/th/id/OIP.Sw9InbdVOx5kZ0GCkFHqLQHaHa?pid=Api',
  },
];

const fallbackImg = '/images/store-placeholder.jpg'; // coloca un placeholder local si quieres

const FeaturedStores = ({ stores = defaultStores, title = 'Tiendas destacadas' }) => {
  return (
    <section className="featured-stores my-4">
      <div className="d-flex justify-content-between align-items-end mb-3">
        <div>
          <h3 className="mb-1">{title}</h3>
          <p className="text-muted mb-0">Conoce a los vendedores del marketplace y visita sus vitrinas.</p>
        </div>
        {/* Opcional: un link a ver todas las tiendas */}
        {/* <Link to="/tiendas" className="small">Ver todas</Link> */}
      </div>

      <Row xs={1} sm={2} md={3} lg={4} className="g-3">
        {stores.map((store) => (
          <Col key={store.id}>
            <Card className="store-card h-100">
              <div className="store-cover">
                <Card.Img
                  variant="top"
                  src={store.img}
                  alt={store.nombre}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackImg;
                  }}
                />
              </div>
              <Card.Body>
                <Card.Title className="mb-1">{store.nombre}</Card.Title>
                <Card.Text className="text-muted small">{store.descripcion}</Card.Text>
                <Button
                  as={Link}
                  to={`/tienda/${store.id}`}
                  variant="primary"
                  className="w-100 mt-2"
                >
                  Visitar tienda
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
};

export default FeaturedStores;
