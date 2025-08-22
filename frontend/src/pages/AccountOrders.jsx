import React, { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import orderService from '../services/orderService';

const AccountOrders = () => {
  const [orders, setOrders] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await orderService.getMyOrders();
        setOrders(data);
      } catch (e) {
        setErr(e?.response?.data?.message || 'No se pudo cargar tu historial.');
      }
    })();
  }, []);

  if (err) return <Alert variant="danger" className="mt-3">{err}</Alert>;
  if (!orders) return <div className="mt-3"><Spinner size="sm" /> Cargando historial…</div>;
  if (!orders.length) return <Alert className="mt-3">Aún no tienes compras.</Alert>;

  return (
    <div className="mt-3">
      <h3>Historial de Compras</h3>
      <Table hover responsive className="mt-3">
        <thead>
          <tr>
            <th># Pedido</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id}>
              <td><code>{o.orderNumber || o._id.slice(-6).toUpperCase()}</code></td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
              <td>₡{Number(o.totalPrice || o.total).toLocaleString('es-CR')}</td>
              <td>{o.isPaid ? 'Pagado' : 'Pendiente'}</td>
              <td className="text-end">
                <Link to={`/order/${o._id}`} className="btn btn-sm btn-outline-primary">Ver</Link>{' '}
                <Link to={`/orden/${o._id}/exito`} className="btn btn-sm btn-outline-secondary">
                  Recibo
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default AccountOrders;
