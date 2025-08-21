import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Alert, Container, Spinner } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext'; // Importamos el contexto

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Obtenemos la función login del contexto

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Llamamos directamente a la función login del contexto.
      // ¡Ella ya se encarga de la llamada a la API y de guardar los datos!
      await login(email, password);
      navigate('/'); // Redirigimos al usuario a la página de inicio
    } catch (err) {
      // Si el login falla, el contexto lanzará un error que podemos atrapar aquí.
      const message =
        (err.response && err.response.data && err.response.data.message) ||
        err.message ||
        err.toString();
      setError(message);
      setLoading(false); // Detenemos el spinner solo si hay un error
    }
    // No necesitamos un 'finally' porque la navegación nos saca de la página
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <h1>Iniciar Sesión</h1>
          {error && <Alert variant='danger'>{error}</Alert>}
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                placeholder="Ingresa tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="mt-3" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Ingresar'}
            </Button>
          </Form>
          <Row className="py-3">
            <Col>
              ¿Eres nuevo?{' '}
              <Link to="/register">Regístrate aquí</Link>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;