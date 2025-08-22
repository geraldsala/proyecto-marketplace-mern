// frontend/src/pages/WishlistPage.js (Versión Mejorada)

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Button, Alert, Spinner, Container } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import productService from '../services/productService';

const WishlistPage = () => {
    // 1. Obtenemos el estado de carga del AuthContext además de userInfo
    const { userInfo, loading: authLoading } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Solo intentamos cargar la wishlist si el contexto de Auth ya terminó de cargar Y hay un usuario
        if (!authLoading && userInfo) {
            const loadWishlist = async () => {
                try {
                    setLoading(true);
                    const data = await userService.getWishlist();
                    setWishlistItems(data);
                } catch (err) {
                    setError('No se pudo cargar tu wishlist.');
                } finally {
                    setLoading(false);
                }
            };
            loadWishlist();
        } else if (!authLoading && !userInfo) {
            // Si terminó de cargar y NO hay usuario, detenemos el spinner.
            setLoading(false);
        }
    }, [userInfo, authLoading]);

    const removeFromWishlistHandler = async (productId) => {
        try {
            await userService.removeFromWishlist(productId);
            // Actualizamos el estado localmente para una respuesta más rápida
            setWishlistItems((prevItems) => prevItems.filter((item) => item._id !== productId));
        } catch (error) {
            alert('No se pudo eliminar el producto de la wishlist.');
        }
    };

    // 2. Nueva lógica de renderizado para manejar todos los casos
    const renderContent = () => {
        // Caso 1: El contexto de autenticación o la wishlist están cargando
        if (authLoading || loading) {
            return <div className="text-center"><Spinner animation="border" /></div>;
        }

        // Caso 2: No hay usuario logueado
        if (!userInfo) {
            return (
                <Alert variant="warning">
                    Debes <Link to="/login">iniciar sesión</Link> para ver tu lista de deseos.
                </Alert>
            );
        }

        // Caso 3: Hubo un error al cargar la wishlist
        if (error) {
            return <Alert variant="danger">{error}</Alert>;
        }

        // Caso 4: La wishlist está vacía
        if (wishlistItems.length === 0) {
            return (
                <Alert variant="info">
                    Tu lista de deseos está vacía. <Link to="/">Explorar productos</Link>
                </Alert>
            );
        }

        // Caso 5: Todo correcto, mostramos la lista
        return (
            <ListGroup variant="flush">
                {wishlistItems.map((item) => (
                    <ListGroup.Item key={item._id}>
                        <Row className="align-items-center">
                            <Col md={2}>
                                <Image src={item.imagenes[0]} alt={item.nombre} fluid rounded />
                            </Col>
                            <Col md={4}><Link to={`/producto/${item._id}`}>{item.nombre}</Link></Col>
                            <Col md={2}>₡{item.precio.toLocaleString('es-CR')}</Col>
                            <Col md={2}><Button as={Link} to={`/producto/${item._id}`} variant="primary">Ver Producto</Button></Col>
                            <Col md={2}>
                                <Button
                                    type="button"
                                    variant="light"
                                    onClick={() => removeFromWishlistHandler(item._id)}
                                >
                                    Eliminar
                                </Button>
                            </Col>
                        </Row>
                    </ListGroup.Item>
                ))}
            </ListGroup>
        );
    };

    return (
        <Container className="py-4">
            <h1>Mi Lista de Deseos</h1>
            <div className="mt-4">
                {renderContent()}
            </div>
        </Container>
    );
};

export default WishlistPage;