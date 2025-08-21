import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Button, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faEdit } from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../context/AuthContext';
import userService from '../services/userService';

const AdminPage = () => {
  const { userInfo } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers(userInfo.token);
      setUsers(data);
    } catch (err) {
      setError('No se pudieron cargar los usuarios. Verifica que eres un administrador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo && userInfo.tipoUsuario === 'admin') {
      loadUsers();
    } else {
      setError('Acceso denegado. Esta página es solo para administradores.');
      setLoading(false);
    }
  }, [userInfo]);

  const handleShowModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.tipoUsuario);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleRoleUpdate = async () => {
    try {
        await userService.updateUserRole(selectedUser._id, { tipoUsuario: newRole }, userInfo.token);
        handleCloseModal();
        loadUsers();
    } catch (err) {
        setError('No se pudo actualizar el rol del usuario.');
    }
  };

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>;
  }

  return (
    <Container className="my-4">
      <div className="d-flex align-items-center mb-4">
        <FontAwesomeIcon icon={faUsers} size="2x" className="me-3" />
        <h1>Panel de Administración de Usuarios</h1>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      
      {!error && (
        <Table striped bordered hover responsive>
          <thead>
            <tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user._id}</td>
                <td>{user.nombre}</td>
                <td>{user.email}</td>
                <td>{user.tipoUsuario}</td>
                <td>
                  <Button variant="light" size="sm" onClick={() => handleShowModal(user)}>
                    <FontAwesomeIcon icon={faEdit} /> Editar Rol
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Rol de {selectedUser?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Nuevo Rol</Form.Label>
            <Form.Select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
              <option value="comprador">Comprador</option>
              <option value="tienda">Tienda</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
          <Button variant="primary" onClick={handleRoleUpdate}>Guardar Cambios</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPage;