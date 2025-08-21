import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Alert, Container, Spinner } from 'react-bootstrap';
import userService from '../services/userService'; // <-- CORRECCIÓN: Importamos el servicio unificado
import AuthContext from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    nombreUsuario: '',
    email: '',
    password: '',
    confirmPassword: '',
    tipoUsuario: 'comprador',
    pais: '',
    direccion: '',
    telefono: '',
    nombreTienda: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: contextLogin } = useContext(AuthContext); // Renombramos para evitar conflictos

  const { cedula, nombre, nombreUsuario, email, password, confirmPassword, tipoUsuario, pais, direccion, telefono, nombreTienda } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const userData = { ...formData };
      if (tipoUsuario !== 'tienda') {
        delete userData.nombreTienda;
      }

      const newUser = await userService.register(userData); // <-- CORRECCIÓN: Usamos userService
      contextLogin(newUser); // Actualizamos el contexto global
      navigate('/'); 
      window.location.reload();
    } catch (err) {
      const message =
        (err.response && err.response.data && err.response.data.message) ||
        err.message ||
        err.toString();
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-md-center">
        <Col xs={12} md={6}>
          <h1 className='text-center mb-4'>Crear Cuenta</h1>
          {error && <Alert variant='danger'>{error}</Alert>}
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="tipoUsuario">
              <Form.Label>Tipo de Usuario</Form.Label>
              <Form.Select name="tipoUsuario" value={tipoUsuario} onChange={onChange} required>
                <option value="comprador">Comprador</option>
                <option value="tienda">Tienda</option>
              </Form.Select>
            </Form.Group>
            {tipoUsuario === 'tienda' && (
              <Form.Group className="mb-3" controlId="nombreTienda">
                <Form.Label>Nombre Comercial de la Tienda</Form.Label>
                <Form.Control type="text" name="nombreTienda" placeholder="Ej: Tienda de Tecnología CR" value={nombreTienda} onChange={onChange} required />
              </Form.Group>
            )}
            <Form.Group className="mb-3" controlId="nombre">
              <Form.Label>Nombre Completo o Razón Social</Form.Label>
              <Form.Control type="text" name="nombre" placeholder="Ej: Juan Pérez S.A." value={nombre} onChange={onChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="nombreUsuario">
              <Form.Label>Nombre de Usuario</Form.Label>
              <Form.Control type="text" name="nombreUsuario" placeholder="Ej: juanperez99" value={nombreUsuario} onChange={onChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="cedula">
              <Form.Label>Cédula o Cédula Jurídica</Form.Label>
              <Form.Control type="text" name="cedula" placeholder="Ingresa tu identificación" value={cedula} onChange={onChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control type="email" name="email" placeholder="Ingresa tu email" value={email} onChange={onChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" name="password" placeholder="Ingresa tu contraseña" value={password} onChange={onChange} required />
            </Form.Group>
             <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Confirmar Contraseña</Form.Label>
              <Form.Control type="password" name="confirmPassword" placeholder="Confirma tu contraseña" value={confirmPassword} onChange={onChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="pais">
              <Form.Label>País</Form.Label>
              <Form.Control type="text" name="pais" placeholder="Ej: Costa Rica" value={pais} onChange={onChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="direccion">
              <Form.Label>Dirección</Form.Label>
              <Form.Control type="text" name="direccion" placeholder="Ej: San José, Calle 5, Ave 2" value={direccion} onChange={onChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="telefono">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control type="text" name="telefono" placeholder="Ej: 8888-8888" value={telefono} onChange={onChange} required />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100 mt-3" disabled={loading}>
              {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Registrarse'}
            </Button>
          </Form>
          <Row className="py-3">
            <Col>¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión</Link></Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default RegisterPage;