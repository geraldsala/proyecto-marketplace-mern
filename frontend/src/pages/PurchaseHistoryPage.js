// frontend/src/pages/PurchaseHistoryPage.js
import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Container } from 'react-bootstrap';

const PurchaseHistoryPage = () => {
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      setLoading(true);
      if (userInfo && userInfo.tipoUsuario === 'comprador') {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          };
          const { data } = await axios.get('http://localhost:5000/api/reports/purchase-history', config);
          setPurchaseHistory(data.compras);
          setError('');
        } catch (err) {
          setError('No se pudo cargar el historial de compras. ' + err.response?.data?.message);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchPurchaseHistory();
  }, [userInfo]);

  if (!userInfo || userInfo.tipoUsuario !== 'comprador') {
    return (
      <Container className='mt-5 text-center'>
        <Alert variant='danger'>Acceso denegado. Solo para compradores.</Alert>
      </Container>
    );
  }

  return (
    <Container className='mt-5'>
      <h2>Historial de Compras</h2>
      {error && <Alert variant='danger'>{error}</Alert>}
      {loading ? (
        <p>Cargando historial de compras...</p>
      ) : (
        <Table striped bordered hover responsive className='table-sm mt-3'>
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Fecha</th>
              <th>Total</th>
              <th>Productos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {purchaseHistory.map((order) => (
              <tr key={order.idPedido}>
                <td>{order.idPedido}</td>
                <td>{new Date(order.fecha).toLocaleDateString()}</td>
                <td>${order.total}</td>
                <td>
                  {order.productos.map((item) => (
                    <div key={item.producto}>{item.nombre} ({item.cantidad})</div>
                  ))}
                </td>
                <td>
                  <Button variant='primary' className='btn-sm'>
                    Descargar Factura
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default PurchaseHistoryPage;