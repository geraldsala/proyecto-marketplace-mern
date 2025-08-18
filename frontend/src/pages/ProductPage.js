// frontend/src/pages/ProductPage.js
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Row, Col, Image, ListGroup, Button, Card, Alert } from 'react-bootstrap';
import productService from '../services/productService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { Container } from 'react-bootstrap';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productFromAPI = await productService.getProductById(id);
        setProduct(productFromAPI);
      } catch (err) {
        setError('Producto no encontrado. Revisa la URL.');
      }
    };
    fetchProduct();
  }, [id]);

  if (error) {
    return (
      <Container className='mt-5 text-center'>
        <Alert variant='danger'>{error}</Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className='mt-5 text-center'>
        <h3>Cargando producto...</h3>
      </Container>
    );
  }

  return (
    <Container className='py-3'>
      <Link className='btn btn-light my-3' to='/'>
        Volver
      </Link>
      <Row>
        <Col md={6}>
          <Image src={product.imagenes[0]} alt={product.nombre} fluid />
        </Col>
        <Col md={3}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h3>{product.nombre}</h3>
            </ListGroup.Item>
            <ListGroup.Item>
              <div className='my-3'>
                {product.calificacionPromedio} <FontAwesomeIcon icon={faStar} className='text-warning' />
                {' '}de {product.numCalificaciones} opiniones
              </div>
            </ListGroup.Item>
            <ListGroup.Item>Precio: ${product.precio}</ListGroup.Item>
            <ListGroup.Item>Descripción: {product.descripcion}</ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={3}>
          <Card>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <Row>
                  <Col>Precio:</Col>
                  <Col><strong>${product.precio}</strong></Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Stock:</Col>
                  <Col>{product.stock > 0 ? 'En Stock' : 'Agotado'}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item className='text-center'>
                <Button className='btn-block' type='button' disabled={product.stock === 0}>
                  Agregar al Carrito
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
      <Row className='mt-5'>
        <Col md={12}>
          <h3>Especificaciones Técnicas</h3>
          <ListGroup variant='flush'>
            <ListGroup.Item><strong>Modelo:</strong> {product.especificacionesTecnicas.modelo}</ListGroup.Item>
            <ListGroup.Item><strong>RAM:</strong> {product.especificacionesTecnicas.ram}</ListGroup.Item>
            <ListGroup.Item><strong>Compatibilidad:</strong> {product.especificacionesTecnicas.compatibilidad}</ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductPage;