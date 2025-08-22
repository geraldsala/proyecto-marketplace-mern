// frontend/src/screens/admin/AdminStoresPage.jsx
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Table,
  Modal,
  Form,
  InputGroup,
  Spinner,
  Alert,
  Pagination,
  Badge,
} from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import adminStoreService from '../../services/adminStoreService';
import adminUserService from '../../services/adminUserService';

const emptyForm = { name: '', slug: '', logoUrl: '', isActive: true, ownerUser: '' };

const AdminStoresPage = () => {
  const { userInfo } = useContext(AuthContext);
  const token = userInfo?.token;

  // Tabla/listado
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Modal & formulario
  const [show, setShow] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const isEditing = useMemo(() => Boolean(editingId), [editingId]);
  const [saving, setSaving] = useState(false);

  // Búsqueda de usuarios (ownerUser)
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErr('');
      const data = await adminStoreService.list({ token, search, page, limit });
      // TIP: asegúrate en el backend de incluir ownerUser en el select si quieres precargarlo en editar
      setItems(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (e) {
      setErr(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setUserQuery('');
    setUserResults([]);
    setShow(true);
  };

  const openEdit = (row) => {
    setEditingId(row._id);
    setForm({
      name: row.name,
      slug: row.slug,
      logoUrl: row.logoUrl || '',
      isActive: row.isActive,
      ownerUser: row.ownerUser || '', // dependerá de que lo devuelvas en el list admin
    });
    setUserQuery('');
    setUserResults([]);
    setShow(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug.trim().toLowerCase(),
      };

      if (!payload.name?.trim() || !payload.slug?.trim()) {
        alert('Nombre y slug son requeridos.');
        return;
      }

      if (!payload.ownerUser) {
        alert('Selecciona un ownerUser (dueño de la tienda).');
        return;
      }

      if (isEditing) {
        await adminStoreService.update({ token, id: editingId, payload });
      } else {
        await adminStoreService.create({ token, payload }); // incluye ownerUser
      }

      setShow(false);
      await fetchData();
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDisableToggle = async (row) => {
    try {
      await adminStoreService.disable({ token, id: row._id, isActive: !row.isActive });
      await fetchData();
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  };

  const handleRemove = async (row) => {
    if (!window.confirm(`¿Eliminar tienda "${row.name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await adminStoreService.remove({ token, id: row._id });
      await fetchData();
    } catch (e) {
      alert(e?.response?.data?.message || e.message);
    }
  };

  // Buscar usuarios para ownerUser (simple)
  const searchUsers = async (q) => {
    if (!q || q.trim().length < 2) {
      setUserResults([]);
      return;
    }
    setLoadingUsers(true);
    try {
      const data = await adminUserService.list({ token, search: q.trim(), page: 1, limit: 10 });
      setUserResults(data.items || []);
    } catch (_e) {
      setUserResults([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  return (
    <div className="p-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">Tiendas</h3>
        <div className="d-flex gap-2">
          <InputGroup>
            <Form.Control
              placeholder="Buscar por nombre o slug..."
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            />
          </InputGroup>
          <Button onClick={openCreate}>Nueva tienda</Button>
        </div>
      </div>

      {loading ? (
        <Spinner animation="border" />
      ) : err ? (
        <Alert variant="danger">{err}</Alert>
      ) : (
        <>
          <Table bordered hover responsive size="sm">
            <thead>
              <tr>
                <th style={{ width: 80 }}>Logo</th>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Estado</th>
                <th style={{ width: 280 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row._id}>
                  <td>
                    {row.logoUrl ? (
                      <img src={row.logoUrl} alt={row.name} style={{ height: 40 }} />
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>{row.name}</td>
                  <td><code>{row.slug}</code></td>
                  <td>{row.isActive ? <Badge bg="success">Activa</Badge> : <Badge bg="secondary">Inactiva</Badge>}</td>
                  <td className="d-flex gap-2">
                    <Button size="sm" variant="outline-primary" onClick={() => openEdit(row)}>Editar</Button>
                    <Button
                      size="sm"
                      variant={row.isActive ? 'outline-warning' : 'outline-success'}
                      onClick={() => handleDisableToggle(row)}
                    >
                      {row.isActive ? 'Deshabilitar' : 'Habilitar'}
                    </Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleRemove(row)}>Eliminar</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center">
            <div className="text-muted">Total: {total}</div>
            <Pagination className="mb-0">
              {[...Array(pages)].map((_, i) => (
                <Pagination.Item key={i} active={i + 1 === page} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          </div>
        </>
      )}

      {/* Modal Crear/Editar */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>{isEditing ? 'Editar tienda' : 'Nueva tienda'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Slug (URL)</Form.Label>
              <Form.Control
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.replace(/\s+/g, '-').toLowerCase() })}
                required
              />
              <Form.Text>Ej: <code>mi-tienda</code> → /tienda/mi-tienda</Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Logo URL</Form.Label>
              <Form.Control
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                placeholder="https://..."
              />
            </Form.Group>

            <Form.Check
              type="switch"
              id="isActive"
              label="Tienda activa"
              className="mb-3"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />

            {/* Selector de ownerUser */}
            <Form.Group className="mb-3">
              <Form.Label>Dueño de la tienda (ownerUser)</Form.Label>
              <InputGroup>
                <Form.Control
                  placeholder="Buscar por nombre o email..."
                  value={userQuery}
                  onChange={(e) => {
                    const q = e.target.value;
                    setUserQuery(q);
                    if (q.length >= 2) searchUsers(q);
                    else setUserResults([]);
                  }}
                />
              </InputGroup>

              {loadingUsers ? (
                <div className="small text-muted mt-1">Buscando...</div>
              ) : (
                userResults.length > 0 && (
                  <div className="border rounded mt-2" style={{ maxHeight: 160, overflowY: 'auto' }}>
                    {userResults.map((u) => (
                      <div
                        key={u._id}
                        className={`p-2 ${form.ownerUser === u._id ? 'bg-light' : ''}`}
                        role="button"
                        onClick={() => { setForm({ ...form, ownerUser: u._id }); }}
                      >
                        <div className="fw-semibold">{u.nombre || u.email}</div>
                        <div className="small text-muted">
                          {u.email} · {u.tipoUsuario}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              <Form.Text className="d-block mt-1">
                Seleccionado: <code>{form.ownerUser || '—'}</code>
              </Form.Text>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminStoresPage;
