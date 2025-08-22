import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faBars, faThLarge, faTruckFast } from '@fortawesome/free-solid-svg-icons';
import { LinkContainer } from 'react-router-bootstrap';
import productService from '../services/productService';
import './audio.css';

const BRANDS = ['JBL', 'Razer', 'Sony', 'Logitech', 'Bose'];
const CATEGORIES = ['Bocinas', 'Audífonos'];
const AUDIO_CATEGORY_ID = '68a803fa72eae1ed4d979941';

const AudioPage = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [priceMax, setPriceMax] = useState(60000);
    const [brandChecks, setBrandChecks] = useState({});
    const [catChecks, setCatChecks] = useState({});
    const [sortBy, setSortBy] = useState('relevance');
    const [perPage, setPerPage] = useState(24);
    const [gridMode, setGridMode] = useState('grid');

    const minPrice = 20000;
    const maxPrice = 60000;

  useEffect(() => {
    const fetchProducts = async () => {
        try {
            const productsFromAPI = await productService.getProducts();
            
            // Lógica de filtrado corregida y mejorada
            const audioProducts = productsFromAPI.filter(product => {
                if (!product.categoria) return false; // Ignora productos sin categoría

                // Si la categoría es un objeto, usa su _id
                if (typeof product.categoria === 'object' && product.categoria._id) {
                    return product.categoria._id === AUDIO_CATEGORY_ID;
                }
                
                // Si la categoría es un string, compárala directamente
                if (typeof product.categoria === 'string') {
                    return product.categoria === AUDIO_CATEGORY_ID;
                }

                return false;
            });
            
            setAllProducts(audioProducts);
        } catch (err) {
            setError('No se pudieron cargar los productos de audio.');
            console.error(err); // Es buena práctica mostrar el error en consola
        }
    };
    fetchProducts();
  }, []); // El array vacío asegura que se ejecute solo una vez

    const getBrandFromProductName = (productName) => {
        const lowerCaseName = productName.toLowerCase();
        for (const brand of BRANDS) {
            if (lowerCaseName.includes(brand.toLowerCase())) {
                return brand;
            }
        }
        return 'Otra';
    };

    const filtered = useMemo(() => {
        let data = [...allProducts];
        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(p =>
                (p.nombre + ' ' + (p.especificacionesTecnicas?.modelo || '')).toLowerCase().includes(q)
            );
        }
        data = data.filter(p => p.precio <= priceMax);
        const activeBrands = Object.entries(brandChecks).filter(([, v]) => v).map(([k]) => k);
        if (activeBrands.length) {
            data = data.filter(p => activeBrands.includes(getBrandFromProductName(p.nombre)));
        }
        const activeCats = Object.entries(catChecks).filter(([, v]) => v).map(([k]) => k);
        if (activeCats.length) {
            data = data.filter(p => {
                const productName = p.nombre.toLowerCase();
                if (activeCats.includes('Audífonos') && (productName.includes('headset') || productName.includes('audífonos'))) return true;
                if (activeCats.includes('Bocinas') && (productName.includes('parlante') || productName.includes('bocina') || productName.includes('speaker'))) return true;
                return false;
            });
        }
        if (sortBy === 'price-asc') data.sort((a, b) => a.precio - b.precio);
        if (sortBy === 'price-desc') data.sort((a, b) => b.precio - a.precio);
        if (sortBy === 'brand') data.sort((a, b) => getBrandFromProductName(a.nombre).localeCompare(getBrandFromProductName(b.nombre)));
        return data;
    }, [search, priceMax, brandChecks, catChecks, sortBy, allProducts]);

    const toggleBrand = (b) => setBrandChecks(s => ({ ...s, [b]: !s[b] }));
    const toggleCat = (c) => setCatChecks(s => ({ ...s, [c]: !s[c] }));

    return (
        <div className="audio-page">
            <Container fluid className="pt-3">
                {/* Barra superior */}
                <Row className="align-items-center g-3 px-2">
                    <Col xs="12" className="breadcrumbs">
                        <small><span className="crumb">Inicio</span> / <span className="crumb">Tecnología</span> / <strong>Audio</strong></small>
                    </Col>
                    <Col md="3" className="d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faFilter} /><h5 className="m-0">Filtrar por:</h5>
                    </Col>
                    <Col md="3" className="text-md-start text-muted">
                        <small>Mostrando <strong>1–{Math.min(perPage, filtered.length)}</strong> de <strong>{filtered.length}</strong> resultados</small>
                    </Col>
                    <Col md="3" className="d-flex justify-content-md-end">
                        <Form.Select size="sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-auto">
                            <option value="relevance">Ordenar por…</option>
                            <option value="price-asc">Precio: menor a mayor</option>
                            <option value="price-desc">Precio: mayor a menor</option>
                            <option value="brand">Marca (A-Z)</option>
                        </Form.Select>
                    </Col>
                    <Col md="3" className="d-flex justify-content-md-end align-items-center gap-2">
                        <small className="text-muted">Mostrar:</small>
                        <Form.Select size="sm" value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="w-auto">
                            <option value={12}>12</option><option value={24}>24</option><option value={48}>48</option>
                        </Form.Select>
                        <Button variant={gridMode === 'grid' ? 'dark' : 'outline-dark'} size="sm" onClick={() => setGridMode('grid')}><FontAwesomeIcon icon={faThLarge} /></Button>
                        <Button variant={gridMode === 'list' ? 'dark' : 'outline-dark'} size="sm" onClick={() => setGridMode('list')}><FontAwesomeIcon icon={faBars} /></Button>
                    </Col>
                </Row>
                {/* Contenido */}
                <Row className="mt-3 gx-4">
                    {/* Filtros */}
                    <Col lg="3" className="mb-4">
                        <aside className="filters card border-0 shadow-sm p-3">
                            <h6 className="mb-3">CATEGORÍAS</h6>
                            {CATEGORIES.map(c => (<Form.Check key={c} type="checkbox" label={c} checked={!!catChecks[c]} onChange={() => toggleCat(c)} />))}
                            <hr />
                            <h6 className="mb-2">PRECIO</h6>
                            <input type="range" min={minPrice} max={maxPrice} step="1000" value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value))} className="w-100" />
                            <div className="d-flex justify-content-between mt-1">
                                <small>₡{minPrice.toLocaleString('es-CR')}</small><small>₡{maxPrice.toLocaleString('es-CR')}</small>
                            </div>
                            <div className="d-flex gap-2 mt-2">
                                <Form.Control size="sm" type="text" placeholder="Buscar…" value={search} onChange={(e) => setSearch(e.target.value)} />
                                <Button size="sm" variant="dark">FILTRAR</Button>
                            </div>
                            <hr />
                            <h6 className="mb-2">MARCAS</h6>
                            <div className="checklist">
                                {BRANDS.map(b => (<Form.Check key={b} type="checkbox" label={b} checked={!!brandChecks[b]} onChange={() => toggleBrand(b)} className="mb-1" />))}
                            </div>
                        </aside>
                    </Col>
                    {/* Listado */}
                    <Col lg="9">
                        {error && <Alert variant='danger'>{error}</Alert>}
                        {filtered.length === 0 && !error && (
                            <Alert variant="info">
                                No hay productos para mostrar.
                            </Alert>
                        )}
                        <div className={gridMode === 'grid' ? 'grid-products' : 'list-products'}>
                            {filtered.slice(0, perPage).map(product => (
                                <article key={product._id} className="product-card">
                                    <div className="thumb">
                                        {product.stock === 0 && <span className="badge-out">SIN STOCK</span>}
                                        <img src={product.imagenes[0]} alt={product.nombre} />
                                    </div>
                                    <div className="p-body">
                                        <div className="badges">
                                            <span className="badge-ship"><FontAwesomeIcon icon={faTruckFast} className="me-1" />{product.tiempoEnvio}</span>
                                        </div>
                                        <h6 className="title">{product.nombre}</h6>
                                        <div className="meta">
                                            <span className="brand">{getBrandFromProductName(product.nombre)}</span>
                                        </div>
                                        <div className="price">₡{product.precio.toLocaleString('es-CR')}</div>
                                        <div className="actions">
                                            <LinkContainer to={`/producto/audio/${product._id}`}>
                                                <Button size="sm" variant="dark">Ver detalle</Button>
                                            </LinkContainer>
                                            <Button size="sm" variant="outline-dark">Agregar</Button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AudioPage;