// frontend/src/pages/OrderSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Container, Card, Button, Spinner } from 'react-bootstrap';
import { jsPDF } from 'jspdf';
import orderService from '../services/orderService';

const OrderSuccess = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const orderNumberFromNav = location.state?.orderNumber;

  useEffect(() => {
    (async () => {
      try {
        const data = await orderService.getOrderById(id);
        setOrder(data);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const downloadReceipt = () => {
    if (!order) return;
    const doc = new jsPDF();
    let y = 14;

    doc.setFontSize(16);
    doc.text('Recibo de compra', 14, y); y += 8;

    doc.setFontSize(12);
    doc.text(`Pedido: ${order.orderNumber || orderNumberFromNav || id}`, 14, y); y += 6;
    doc.text(`Fecha: ${new Date(order.createdAt).toLocaleString()}`, 14, y); y += 6;
    doc.text(`Cliente: ${order.user?.nombre || order.user?.email}`, 14, y); y += 10;

    doc.text('Productos:', 14, y); y += 6;
    (order.orderItems || []).forEach((it) => {
      const line = `- ${it.nombre} x${it.qty}  ₡${Number(it.precio).toLocaleString('es-CR')}`;
      doc.text(line, 16, y); y += 6;
    });
    y += 4;
    doc.text(`Subtotal: ₡${Number(order.itemsPrice || 0).toLocaleString('es-CR')}`, 14, y); y += 6;
    doc.text(`Impuestos: ₡${Number(order.taxPrice || 0).toLocaleString('es-CR')}`, 14, y); y += 6;
    doc.text(`Envío: ₡${Number(order.shippingPrice || 0).toLocaleString('es-CR')}`, 14, y); y += 6;
    doc.text(`Total: ₡${Number(order.totalPrice || 0).toLocaleString('es-CR')}`, 14, y);

    doc.save(`Recibo-${order.orderNumber || id}.pdf`);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5 text-center">
        No se encontró la orden.
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="p-4 text-center">
        <h2 className="mb-2">¡Compra exitosa! 🎉</h2>
        <div className="text-muted mb-3">
          Pedido <code>{order.orderNumber || orderNumberFromNav || id}</code>
        </div>
        <div className="mb-4">Recibirás un correo con el detalle de tu compra.</div>
        <div className="d-flex gap-2 justify-content-center">
          <Button variant="success" onClick={downloadReceipt}>Descargar recibo (PDF)</Button>
          <Link to="/" className="btn btn-outline-primary">Volver al Home</Link>
        </div>
      </Card>
    </Container>
  );
};

export default OrderSuccess;
