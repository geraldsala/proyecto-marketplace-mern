import React, { useState, useEffect } from 'react'; 
import { Container, Row, Col, Alert, Carousel, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLaptop, faHeadphones, faMobileAlt, faHome } from '@fortawesome/free-solid-svg-icons';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';
import ProductCardSkeleton from '../components/ProductCardSkeleton';
import SubscribeModal from "./SubscribeModal";  // 👈 Se importa el modal
import './HomePage.css';

// --- Imágenes locales ---
import laptopImg from '../assets/images/category-laptops.jpg';
import audioImg from '../assets/images/category-audio.jpg';
import celularesImg from '../assets/images/category-celulares.jpg';
import smarthomeImg from '../assets/images/category-smarthome.jpg';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSubscribe, setShowSubscribe] = useState(false); // Estado del modal

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsFromAPI = await productService.getProducts();
        setProducts(productsFromAPI.slice(0, 8));
      } catch (err) {
        setError('No se pudieron cargar los productos.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 👇 Mostrar modal SOLO si el usuario está logueado y NO está suscrito
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo"); // viene de authService
    const alreadySubscribed = localStorage.getItem("isSubscribed");

    if (userInfo && !alreadySubscribed) {
      const timer = setTimeout(() => {
        setShowSubscribe(true);
      }, 5000); // ⏳ 5 segundos

      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubscribe = (email) => {
    localStorage.setItem("isSubscribed", "true"); // Guardar que ya está suscrito
    setShowSubscribe(false);
  };

  const categories = [
    { name: 'Laptops', icon: faLaptop, link: '/laptops', img: laptopImg },
    { name: 'Audio', icon: faHeadphones, link: '/audio', img: audioImg },
    { name: 'Celulares', icon: faMobileAlt, link: '/celulares', img: celularesImg },
    { name: 'Smart Home', icon: faHome, link: '/smarthome', img: smarthomeImg },
  ];

  return (
    <>
      {/* HERO SECTION */}
      <Container fluid className="hero-container p-0">
        <Carousel fade interval={5000}>
          <Carousel.Item>
            <img
              className="d-block w-100 carousel-image"
              src="https://www.yoytec.com/web/image/383054-98fe2215/BANNERS%20JUNIO_Mesa%20de%20trabajo%201%20copia%2012.jpg"
              alt="Promoción de tecnología"
            />
            <Carousel.Caption className="hero-caption">
              <Button as={Link} to="/laptops" variant="primary" size="lg" className="hero-button">
                Explorar Novedades
              </Button>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100 carousel-image"
              src="https://i.postimg.cc/J4F380pc/BANNERS-JUNIO-Mesa%20de%20trabajo%201%20copia%205.jpg"
              alt="Ofertas en audio"
            />
            <Carousel.Caption className="hero-caption">
              <Button as={Link} to="/audio" variant="primary" size="lg" className="hero-button">
                Ver Audio
              </Button>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item>
            <img
              className="d-block w-100 carousel-image"
              src="https://compulago.sirv.com/Banners/Banners-Agosto/Banner-Agosto-MSI.jpg"
              alt="Laptops de alto rendimiento"
            />
            <Carousel.Caption className="hero-caption">
              <Button as={Link} to="/laptops" variant="primary" size="lg" className="hero-button">
                Ver Laptops
              </Button>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      </Container>

      {/* SECCIÓN DE CATEGORÍAS */}
      <Container className="my-5">
        <div className="section-title-container">
          <h2 className='section-title'>Explora por Categoría</h2>
          <p className="section-subtitle">Encuentra exactamente lo que buscas en nuestras secciones especializadas.</p>
        </div>
        <Row>
          {categories.map((cat) => (
            <Col key={cat.name} md={6} lg={3} className="mb-4">
              <Link to={cat.link} className="text-decoration-none">
                <Card className="category-card">
                  <div className="category-card-img-container">
                    <Card.Img variant="top" src={cat.img} className="category-card-img" />
                  </div>
                  <div className="category-card-overlay"></div>
                  <Card.Body className="category-card-body">
                    <FontAwesomeIcon icon={cat.icon} size="2x" className="mb-2" />
                    <Card.Title className="category-card-title">{cat.name}</Card.Title>
                  </Card.Body>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>

      {/* SECCIÓN DE ÚLTIMOS PRODUCTOS */}
      <Container className="my-5">
        <div className="section-title-container">
          <h2 className='section-title'>Últimos Productos</h2>
          <p className="section-subtitle">Descubre las novedades que acaban de llegar a nuestro marketplace.</p>
        </div>
        {error && <Alert variant='danger'>{error}</Alert>}
        <Row>
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <Col key={index} sm={12} md={6} lg={4} xl={3} className="mb-4">
                <ProductCardSkeleton />
              </Col>
            ))
          ) : (
            products.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
                <ProductCard product={product} />
              </Col>
            ))
          )}
        </Row>
      </Container>

      {/* MODAL DE SUSCRIPCIÓN */}
      {showSubscribe && (
        <SubscribeModal 
          onClose={() => setShowSubscribe(false)} 
          onSubscribe={handleSubscribe} 
        />
      )}
    </>
  );
};

export default HomePage;