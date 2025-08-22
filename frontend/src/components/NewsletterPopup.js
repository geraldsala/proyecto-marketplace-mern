import React, { useState, useEffect } from 'react'; // <-- LA CORRECCIÓN ESTÁ AQUÍ
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import productService from '../services/productService';
import './NewsletterPopup.css';

const NewsletterPopup = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const hasBeenShown = sessionStorage.getItem('newsletterPopupShown');
    if (!hasBeenShown) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem('newsletterPopupShown', 'true');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const data = await productService.subscribeToNewsletter(email);
      setSuccess(data.message);
      setEmail('');
      setTimeout(handleClose, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Ocurrió un error inesperado.';
      setError(errorMessage);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>¡Suscríbete a nuestro boletín!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Recibe nuestras mejores ofertas y novedades directamente en tu correo.</p>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        {!success && (
          <Form onSubmit={submitHandler}>
            <Form.Group controlId="email-subscribe">
              <Form.Control
                type="email"
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mt-3">
              Suscribirme
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default NewsletterPopup;