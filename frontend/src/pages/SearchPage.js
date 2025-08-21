import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import productService from '../services/productService';
import ProductCard from '../components/ProductCard';

const SearchPage = () => {
  const { keyword } = useParams(); // Lee la palabra clave de la URL
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsFromAPI = await productService.getProducts(keyword);
        setProducts(productsFromAPI);
      } catch (err) {
        setError('No se pudieron cargar los resultados de la búsqueda.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword]); // Se ejecuta cada vez que la palabra clave en la URL cambia

  return (
    <Container className="my-4">
      <h1>Resultados para: "{keyword}"</h1>
      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          {products.length === 0 && <Alert variant="info">No se encontraron productos que coincidan con tu búsqueda.</Alert>}
          <Row>
            {products.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3} className="mb-4">
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
};

export default SearchPage;