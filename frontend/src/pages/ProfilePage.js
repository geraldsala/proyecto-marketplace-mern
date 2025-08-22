import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Nav, Form, Button, Alert, Card, Table, Spinner, ListGroup } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBoxOpen, faCreditCard, faMapMarkerAlt, faHistory, faEdit, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './ProfilePage.css';

// ... (Los paneles PersonalInfoPanel y ProductPanel se mantienen igual)
const PersonalInfoPanel = () => {
  const { userInfo, login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ nombreCompleto: '', email: '' });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (userInfo) {
      setFormData({ nombreCompleto: userInfo.nombre, email: userInfo.email });
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setError('');
    setSuccess('');
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.put('/api/users/profile', { nombre: formData.nombreCompleto, email: formData.email, password }, config);
      login(data);
      setSuccess('Perfil actualizado correctamente');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Ocurrió un error inesperado');
    }
  };

  return (
    <Card className="p-4 border-0">
      <h2 className='mb-4'>Mi Perfil</h2>
      {error && <Alert variant='danger'>{error}</Alert>}
      {success && <Alert variant='success'>{success}</Alert>}
      <Form onSubmit={submitHandler}>
        <Form.Group controlId='nombreCompleto' className='mb-3'>
          <Form.Label>Nombre</Form.Label>
          <Form.Control type='text' placeholder='Ingresa tu nombre' value={formData.nombreCompleto} onChange={(e) => setFormData({...formData, nombreCompleto: e.target.value})} />
        </Form.Group>
        <Form.Group controlId='email' className='mb-3'>
          <Form.Label>Email</Form.Label>
          <Form.Control type='email' placeholder='Ingresa tu email' value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
        </Form.Group>
        <Form.Group controlId='password' className='mb-3'>
          <Form.Label>Nueva Contraseña (opcional)</Form.Label>
          <Form.Control type='password' placeholder='Ingresa tu nueva contraseña' value={password} onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>
        <Form.Group controlId='confirmPassword' className='mb-3'>
          <Form.Label>Confirmar Nueva Contraseña</Form.Label>
          <Form.Control type='password' placeholder='Confirma la nueva contraseña' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </Form.Group>
        <Button type='submit' variant='primary' className='w-100'>Actualizar</Button>
      </Form>
    </Card>
  );
};
const ProductPanel = () => {
  const { userInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);

  const loadMyProducts = async () => {
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/products/myproducts', config);
      setProducts(data);
    } catch (err) {
      setError('No se pudieron cargar tus productos.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (userInfo?.tipoUsuario === 'tienda') {
      loadMyProducts();
    }
  }, [userInfo]);

  const createProductHandler = async () => {
    setLoadingCreate(true);
    try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.post('/api/products', {}, config);
        navigate(`/tienda/producto/${data._id}/edit`);
    } catch (err) {
        setError('No se pudo crear el producto.');
        setLoadingCreate(false);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/products/${id}`, config);
        loadMyProducts();
      } catch (err) {
        setError('No se pudo eliminar el producto.');
      }
    }
  };

  return (
    <Card className="p-4 border-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Panel de Productos</h2>
        <Button variant="primary" onClick={createProductHandler} disabled={loadingCreate}>
          {loadingCreate ? <Spinner as="span" animation="border" size="sm" /> : <><FontAwesomeIcon icon={faPlus} className="me-2" /> Crear Producto</>}
        </Button>
      </div>
      {loading ? <div className="text-center"><Spinner animation="border" /></div> : error ? <Alert variant="danger">{error}</Alert> : (
        <Table striped bordered hover responsive>
          <thead><tr><th>ID</th><th>NOMBRE</th><th>PRECIO</th><th>STOCK</th><th>ACCIONES</th></tr></thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product._id}</td><td>{product.nombre}</td><td>${product.precio.toLocaleString('en-US')}</td><td>{product.stock}</td>
                <td>
                  <Button as={Link} to={`/tienda/producto/${product._id}/edit`} variant="light" size="sm" className="me-2"><FontAwesomeIcon icon={faEdit} /></Button>
                  <Button variant="danger" size="sm" onClick={() => deleteHandler(product._id)}><FontAwesomeIcon icon={faTrash} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
};


// Panel #3: Direcciones de Envío (para Compradores)
const ShippingAddressesPanel = () => {
    const { userInfo } = useContext(AuthContext);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newAddress, setNewAddress] = useState({ pais: '', provincia: '', casillero: '', codigoPostal: '', observaciones: '' });

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/users/profile', config);
            setAddresses(data.direccionesEnvio || []);
        } catch (err) {
            setError('No se pudieron cargar las direcciones.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userInfo) {
            fetchAddresses();
        }
    }, [userInfo]);

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setError('');
        
        // --- LÍNEA DE DEPURACIÓN ---
        console.log("Enviando esta dirección al backend:", newAddress);

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.post('/api/users/addresses', newAddress, config);
            setAddresses(data);
            setNewAddress({ pais: '', provincia: '', casillero: '', codigoPostal: '', observaciones: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo añadir la dirección.');
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.delete(`/api/users/addresses/${addressId}`, config);
                setAddresses(data);
            } catch (err) {
                setError('No se pudo eliminar la dirección.');
            }
        }
    };

    const handleFormChange = (e) => {
        setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
    };

    return (
        <Card className="p-4 border-0">
            <h2 className='mb-4'>Direcciones de Envío</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <h5 className="mb-3">Añadir Nueva Dirección</h5>
            <Form onSubmit={handleAddAddress} className="mb-5">
                <Row>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label>País</Form.Label><Form.Control type="text" name="pais" value={newAddress.pais} onChange={handleFormChange} required /></Form.Group></Col>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Provincia</Form.Label><Form.Control type="text" name="provincia" value={newAddress.provincia} onChange={handleFormChange} required /></Form.Group></Col>
                </Row>
                <Form.Group className="mb-3"><Form.Label>Dirección o Casillero</Form.Label><Form.Control type="text" name="casillero" value={newAddress.casillero} onChange={handleFormChange} required /></Form.Group>
                <Row>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Código Postal</Form.Label><Form.Control type="text" name="codigoPostal" value={newAddress.codigoPostal} onChange={handleFormChange} /></Form.Group></Col>
                </Row>
                <Form.Group className="mb-3"><Form.Label>Observaciones</Form.Label><Form.Control as="textarea" rows={2} name="observaciones" value={newAddress.observaciones} onChange={handleFormChange} /></Form.Group>
                <Button type="submit" variant="primary">Añadir Dirección</Button>
            </Form>
            <h5 className="mb-3 mt-5">Mis Direcciones Guardadas</h5>
            {loading ? <Spinner animation="border" /> : (
                <ListGroup>
                    {addresses.length === 0 ? <ListGroup.Item>No tienes direcciones guardadas.</ListGroup.Item> : (
                        addresses.map(addr => (
                            <ListGroup.Item key={addr._id} className="d-flex justify-content-between align-items-start">
                                <div>
                                    <strong>{addr.provincia}, {addr.pais}</strong><br />
                                    <small className="text-muted">{addr.casillero}</small><br/>
                                    <small>{addr.observaciones}</small>
                                </div>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteAddress(addr._id)}><FontAwesomeIcon icon={faTrash} /></Button>
                            </ListGroup.Item>
                        ))
                    )}
                </ListGroup>
            )}
        </Card>
    );
};

// Panel #4: Métodos de Pago (para Compradores)
const PaymentMethodsPanel = () => {
    const { userInfo } = useContext(AuthContext);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newMethod, setNewMethod] = useState({ nombreTitular: '', numeroTarjeta: '', cvv: '', vencimiento: '' });

     const fetchPaymentMethods = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/users/profile', config);
            setPaymentMethods(data.formasPago || []);
        } catch (err) {
            setError('No se pudieron cargar los métodos de pago.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userInfo) {
            fetchPaymentMethods();
        }
    }, [userInfo]);

    const handleAddMethod = async (e) => {
        e.preventDefault();
        setError('');
        
        // --- LÍNEA DE DEPURACIÓN ---
        console.log("Enviando este método de pago al backend:", newMethod);

        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.post('/api/users/paymentmethods', newMethod, config);
            setPaymentMethods(data);
            setNewMethod({ nombreTitular: '', numeroTarjeta: '', cvv: '', vencimiento: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'No se pudo añadir el método de pago.');
        }
    };

    const handleDeleteMethod = async (methodId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este método de pago?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.delete(`/api/users/paymentmethods/${methodId}`, config);
                setPaymentMethods(data);
            } catch (err) {
                setError('No se pudo eliminar el método de pago.');
            }
        }
    };

    const handleFormChange = (e) => {
        setNewMethod({ ...newMethod, [e.target.name]: e.target.value });
    };

    const maskCardNumber = (number) => {
        if (!number) return '';
        return `**** **** **** ${number.slice(-4)}`;
    };

    return (
        <Card className="p-4 border-0">
            <h2 className='mb-4'>Métodos de Pago</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <h5 className="mb-3">Añadir Nueva Tarjeta</h5>
            <Form onSubmit={handleAddMethod} className="mb-5">
                <Form.Group className="mb-3"><Form.Label>Nombre del Titular</Form.Label><Form.Control type="text" name="nombreTitular" value={newMethod.nombreTitular} onChange={handleFormChange} required /></Form.Group>
                <Row>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label>Número de Tarjeta</Form.Label><Form.Control type="text" name="numeroTarjeta" value={newMethod.numeroTarjeta} onChange={handleFormChange} required /></Form.Group></Col>
                    <Col md={3}><Form.Group className="mb-3"><Form.Label>Vencimiento (MM/AA)</Form.Label><Form.Control type="text" name="vencimiento" value={newMethod.vencimiento} onChange={handleFormChange} required /></Form.Group></Col>
                    <Col md={3}><Form.Group className="mb-3"><Form.Label>CVV</Form.Label><Form.Control type="text" name="cvv" value={newMethod.cvv} onChange={handleFormChange} required /></Form.Group></Col>
                </Row>
                <Button type="submit" variant="primary">Añadir Tarjeta</Button>
            </Form>
            <h5 className="mb-3">Mis Tarjetas Guardadas</h5>
            {loading ? <Spinner animation="border" /> : (
                <ListGroup>
                    {paymentMethods.length === 0 ? <ListGroup.Item>No tienes métodos de pago guardados.</ListGroup.Item> : (
                        paymentMethods.map(method => (
                            <ListGroup.Item key={method._id} className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{method.nombreTitular}</strong><br />
                                    <span className="text-muted font-monospace">{maskCardNumber(method.numeroTarjeta)}</span>
                                    <span className="ms-3 text-muted">Vence: {method.vencimiento}</span>
                                </div>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteMethod(method._id)}><FontAwesomeIcon icon={faTrash} /></Button>
                            </ListGroup.Item>
                        ))
                    )}
                </ListGroup>
            )}
        </Card>
    );
};

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
const ProfilePage = () => {
  const { userInfo } = useContext(AuthContext);
  const [activePanel, setActivePanel] = useState('info');

  useEffect(() => {
    if (userInfo) {
        setActivePanel(userInfo.tipoUsuario === 'tienda' ? 'products' : 'info');
    }
  }, [userInfo]);

  if (!userInfo) {
    return (
      <Container className="my-4">
        <Alert variant="warning">Debes iniciar sesión para ver tu panel.</Alert>
      </Container>
    );
  }

  const renderPanel = () => {
    switch (activePanel) {
      case 'info': return <PersonalInfoPanel />;
      case 'products': return <ProductPanel />;
      case 'addresses': return <ShippingAddressesPanel />;
      case 'payments': return <PaymentMethodsPanel />;
      // case 'history': return <PurchaseHistoryPanel />; // Aún por implementar
      default: return <PersonalInfoPanel />;
    }
  };

  return (
    <Container fluid className="profile-page-container my-4">
      <Row>
        <Col md={3}>
          <div className="profile-sidebar">
            <h4 className="sidebar-title">{userInfo.tipoUsuario === 'tienda' ? 'Panel de Tienda' : 'Mi Cuenta'}</h4>
            <Nav className="flex-column profile-nav">
              <Nav.Link className={`profile-nav-link ${activePanel === 'info' ? 'active' : ''}`} onClick={() => setActivePanel('info')}>
                <FontAwesomeIcon icon={faUser} className="me-2" />Información Personal
              </Nav.Link>
              
              {userInfo.tipoUsuario === 'tienda' && (
                <Nav.Link className={`profile-nav-link ${activePanel === 'products' ? 'active' : ''}`} onClick={() => setActivePanel('products')}>
                  <FontAwesomeIcon icon={faBoxOpen} className="me-2" />Panel de Productos
                </Nav.Link>
              )}

              {userInfo.tipoUsuario === 'comprador' && (
                <>
                  <Nav.Link className={`profile-nav-link ${activePanel === 'addresses' ? 'active' : ''}`} onClick={() => setActivePanel('addresses')}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />Direcciones
                  </Nav.Link>
                  <Nav.Link className={`profile-nav-link ${activePanel === 'payments' ? 'active' : ''}`} onClick={() => setActivePanel('payments')}>
                    <FontAwesomeIcon icon={faCreditCard} className="me-2" />Métodos de Pago
                  </Nav.Link>
                  <Nav.Link className={`profile-nav-link ${activePanel === 'history' ? 'active' : ''}`} onClick={() => setActivePanel('history')}>
                    <FontAwesomeIcon icon={faHistory} className="me-2" />Historial de Compras
                  </Nav.Link>
                </>
              )}
            </Nav>
          </div>
        </Col>
        <Col md={9}>
          <div className="profile-content">{renderPanel()}</div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage;