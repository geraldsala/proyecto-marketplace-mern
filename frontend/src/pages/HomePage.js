// src/pages/HomePage.js
// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Carousel } from 'react-bootstrap';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsFromAPI = await productService.getProducts();
        setProducts(productsFromAPI);
      } catch (err) {
        setError('No se pudieron cargar los productos.');
      }
    };
    fetchProducts();
  }, []);

  return (
    <Container fluid className="p-0">
      {/* CARRUSEL DE IMÁGENES */}
      <Carousel className="mb-5 home-carousel" fade interval={3000}>

        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://www.yoytec.com/web/image/383054-98fe2215/BANNERS%20JUNIO_Mesa%20de%20trabajo%201%20copia%2012.jpg"
            alt="Imagen 1"
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://i.postimg.cc/J4F380pc/BANNERS-JUNIO-Mesa-de-trabajo-1-copia-5.jpg"
            alt="Imagen 2"
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://compulago.sirv.com/Banners/Banners-Agosto/Banner-Agosto-MSI.jpg"
            alt="Imagen 3"
          />
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://www.adntienda.com/web/image/183430-dda8b7e7/banner_3_Mesa%20de%20trabajo%201.jpg"
            alt="Imagen 4"
          />
        </Carousel.Item>
      </Carousel>

      {/* HERO SECTION */}
      <div className='hero-section text-center py-5'>
        <Row className='justify-content-center'>
          <Col md={8}>
            <h1 className='fw-bold mb-3 text-primary'>
              Encuentra la tecnología que necesitas.
            </h1>
            <p className='lead'>
              Explora las mejores tiendas, compara productos y lleva tu experiencia digital al siguiente nivel.
            </p>
          </Col>
        </Row>
      </div>

      {/* ÚLTIMOS PRODUCTOS */}
      <Container>
        <h2 className='mt-5 mb-4'>Últimos Productos</h2>
        {error && <Alert variant='danger'>{error}</Alert>}
        <Row>
          {products.map((product) => (
            <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      </Container>
    </Container>
  );
};

export default HomePage;
