// frontend/src/pages/RegisterPage.js (Versión Completa y Final)

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Row, Col, Alert, Container, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        nombreUsuario: '',
        email: '',
        password: '',
        confirmPassword: '',
        tipoUsuario: 'comprador',
        cedula: '',
        pais: '',
        direccion: '',
        telefono: '',
        fotoLogo: '',
        redesSociales: '',
        nombreTienda: '',
    });

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { register } = useAuth();

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };
    
    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);
        setUploading(true);

        try {
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };
            const { data } = await axios.post('/api/upload', uploadFormData, config);
            
            // La API devuelve un objeto { message, image }
            setFormData((prevState) => ({ ...prevState, fotoLogo: data.image })); 
            setUploading(false);
        } catch (error) {
            console.error(error);
            setError('Error al subir la imagen.');
            setUploading(false);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const userData = { 
                ...formData,
                redesSociales: formData.redesSociales.split(',').map(s => s.trim()).filter(s => s)
            };

            if (formData.tipoUsuario !== 'tienda') {
                delete userData.nombreTienda;
            }
            
            await register(userData);
            navigate('/');
        } catch (err) {
            const message = (err.response?.data?.message) || err.message || err.toString();
            setError(message);
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
                        <Form.Group className="mb-3">
                            <Form.Label>Tipo de Usuario</Form.Label>
                            <Form.Select name="tipoUsuario" value={formData.tipoUsuario} onChange={onChange} required>
                                <option value="comprador">Comprador</option>
                                <option value="tienda">Tienda</option>
                            </Form.Select>
                        </Form.Group>
                        
                        {formData.tipoUsuario === 'tienda' && (
                            <Form.Group className="mb-3">
                                <Form.Label>Nombre Comercial de la Tienda</Form.Label>
                                <Form.Control type="text" name="nombreTienda" value={formData.nombreTienda} onChange={onChange} required />
                            </Form.Group>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Nombre Completo o Razón Social</Form.Label>
                            <Form.Control type="text" name="nombre" value={formData.nombre} onChange={onChange} required />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre de Usuario</Form.Label>
                            <Form.Control type="text" name="nombreUsuario" value={formData.nombreUsuario} onChange={onChange} required />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Cédula (Física o Jurídica)</Form.Label>
                            <Form.Control type="text" name="cedula" value={formData.cedula} onChange={onChange} required />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Correo Electrónico</Form.Label>
                            <Form.Control type="email" name="email" value={formData.email} onChange={onChange} required />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control type="password" name="password" value={formData.password} onChange={onChange} required />
                        </Form.Group>

                         <Form.Group className="mb-3">
                            <Form.Label>Confirmar Contraseña</Form.Label>
                            <Form.Control type="password" name="confirmPassword" value={formData.confirmPassword} onChange={onChange} required />
                        </Form.Group>

                        <hr />
                        <h5>Información Adicional (Opcional)</h5>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>País</Form.Label>
                            <Form.Control type="text" name="pais" value={formData.pais} onChange={onChange} />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Dirección Principal</Form.Label>
                            <Form.Control type="text" name="direccion" value={formData.direccion} onChange={onChange} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Teléfono</Form.Label>
                            <Form.Control type="text" name="telefono" value={formData.telefono} onChange={onChange} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Fotografía o Logo</Form.Label>
                            <Form.Control type="file" onChange={uploadFileHandler} />
                            {uploading && <Spinner className="ms-2" size="sm" />}
                            {formData.fotoLogo && <p className="text-success mt-2">Imagen cargada: {formData.fotoLogo}</p>}
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Redes Sociales (separadas por coma)</Form.Label>
                            <Form.Control type="text" name="redesSociales" value={formData.redesSociales} onChange={onChange} placeholder="https://facebook.com/..., https://instagram.com/..."/>
                        </Form.Group>
                        
                        <Button type="submit" variant="primary" className="w-100 mt-3" disabled={loading}>
                            {loading ? <Spinner as="span" size="sm" /> : 'Registrarse'}
                        </Button>
                    </Form>
                     <Row className="py-3">
                        <Col>
                            ¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión</Link>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default RegisterPage;