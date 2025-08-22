import React, { useEffect, useState } from 'react';
import { Alert, Table, Spinner } from 'react-bootstrap';
import orderService from '../../services/orderService';

const PurchaseHistoryPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await orderService.getMyOrders(); // <-- AQUÍ
        setOrders(data);
      } catch (e) {
        setErr(e?.response?.data?.message || 'No se pudo cargar el historial.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (err) return <Alert variant="danger">{err}</Alert>;

  return (
    <>
      <h4>Historial de Compras</h4>
      <Table striped hover responsive className="mt-3">
        <thead>
          <tr>
            <th>Orden</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Pagada</th>
            <th>Entregada</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id}>
              <td>{o._id}</td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
              <td>₡{o.totalPrice?.toLocaleString('es-CR')}</td>
              <td>{o.isPaid ? 'Sí' : 'No'}</td>
              <td>{o.isDelivered ? 'Sí' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default PurchaseHistoryPanel;
