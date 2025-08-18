// frontend/src/pages/AdminPage.js
import React, { useState, useEffect, useContext } from 'react';
import { Table, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Container } from 'react-bootstrap';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      if (userInfo && userInfo.tipoUsuario === 'admin') {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          };
          const { data } = await axios.get('http://localhost:5000/api/users', config);
          setUsers(data);
          setError('');
        } catch (err) {
          setError('No se pudieron cargar los usuarios. Verifica que eres un administrador.');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUsers();
  }, [userInfo]);

  const updateRoleHandler = async (id, newRole, nombreTienda) => {
    if (window.confirm(`¿Estás seguro de cambiar el rol del usuario ${id} a ${newRole}?`)) {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const body = { tipoUsuario: newRole };
        if (newRole === 'tienda') {
            body.nombreTienda = nombreTienda;
        }

        await axios.put(`http://localhost:5000/api/users/update-role/${id}`, body, config);
        
        // Actualizar la lista de usuarios después del cambio
        const { data } = await axios.get('http://localhost:5000/api/users', config);
        setUsers(data);
        setError('');

      } catch (err) {
        setError('No se pudo actualizar el rol. ' + err.response?.data?.message);
      }
    }
  };

  if (!userInfo || userInfo.tipoUsuario !== 'admin') {
    return (
      <Container className='mt-5 text-center'>
        <Alert variant='danger'>Acceso denegado. Solo para administradores.</Alert>
      </Container>
    );
  }

  return (
    <Container className='mt-5'>
      <h1>Panel de Administración</h1>
      {error && <Alert variant='danger'>{error}</Alert>}
      {loading ? (
        <p>Cargando usuarios...</p>
      ) : (
        <Table striped bordered hover responsive className='table-sm mt-3'>
          <thead>
            <tr>
              <th>ID</th>
              <th>NOMBRE</th>
              <th>EMAIL</th>
              <th>ROL</th>
              <th>ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.nombre}</td>
                <td>{user.email}</td>
                <td>{user.tipoUsuario}</td>
                <td>
                  {user.tipoUsuario !== 'admin' && (
                    <Button
                      variant='success'
                      className='btn-sm'
                      onClick={() => updateRoleHandler(user._id, user.tipoUsuario === 'tienda' ? 'comprador' : 'tienda', 'Nombre de Tienda')}
                    >
                      {user.tipoUsuario === 'tienda' ? 'Convertir a Comprador' : 'Convertir a Tienda'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table> 
      )}
    </Container>
  );
};

export default AdminPage;