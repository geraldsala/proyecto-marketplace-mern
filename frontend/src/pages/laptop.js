import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter, faBars, faThLarge, faTruckFast } from '@fortawesome/free-solid-svg-icons';
import { LinkContainer } from 'react-router-bootstrap';
import productService from '../services/productService';
import './laptop.css';

const BRANDS = ['Asus', 'Lenovo', 'MSI'];
const PROCESSORS = ['Intel N305', 'AMD 3050U', 'Intel Core i3', 'Intel Core i5'];
const LAPTOP_CATEGORY_ID = '68a7b7b872eae1ed4d977b24';

const LaptopPage = () => {
    const [allProducts, setAllProducts] = useState([]);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [priceMax, setPriceMax] = useState(600000);
    const [brandChecks, setBrandChecks] = useState({});
    const [procChecks, setProcChecks] = useState({});
    const [sortBy, setSortBy] = useState('relevance');
    const [perPage, setPerPage] = useState(24);
    const [gridMode, setGridMode] = useState('grid');

    const minPrice = 140000;
    const maxPrice = 600000;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productsFromAPI = await productService.getProducts();
                
                const laptopProducts = productsFromAPI.filter(product => {
                    if (!product.categoria) return false;

                    if (typeof product.categoria === 'object' && product.categoria._id) {
                        return product.categoria._id === LAPTOP_CATEGORY_ID;
                    }
                    if (typeof product.categoria === 'string') {
                        return product.categoria === LAPTOP_CATEGORY_ID;
                    }
                    return false;
                });
                
                setAllProducts(laptopProducts);
            } catch (err) {
                setError('No se pudieron cargar los productos.');
                console.error(err);
            }
        };
        fetchProducts();
    }, []);

    const getBrandFromProductName = (productName) => {
        const lowerCaseName = (productName || '').toLowerCase();
        for (const brand of BRANDS) {
            if (lowerCaseName.includes(brand.toLowerCase())) return brand;
        }
        return 'Otra';
    };

    const filtered = useMemo(() => {
        let data = [...allProducts];
        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter((p) =>
                (p.nombre + ' ' + (p.especificacionesTecnicas?.modelo || '')).toLowerCase().includes(q)
            );
        }
        data = data.filter((p) => p.precio <= priceMax);
        const activeBrands = Object.entries(brandChecks).filter(([, v]) => v).map(([k]) => k);
        if (activeBrands.length) {
            data = data.filter((p) => activeBrands.includes(getBrandFromProductName(p.nombre)));
        }
        const activeProcs = Object.entries(procChecks).filter(([, v]) => v).map(([k]) => k);
        if (activeProcs.length) {
            data = data.filter((p) => {
                const productNameLower = (p.nombre || '').toLowerCase();
                return activeProcs.some(proc => productNameLower.includes(proc.toLowerCase()));
            });
        }
        if (sortBy === 'price-asc') data.sort((a, b) => a.precio - b.precio);
        if (sortBy === 'price-desc') data.sort((a, b) => b.precio - a.precio);
        if (sortBy === 'brand')
            data.sort((a, b) => getBrandFromProductName(a.nombre).localeCompare(getBrandFromProductName(b.nombre)));
        return data;
    }, [search, priceMax, brandChecks, procChecks, sortBy, allProducts]);

    const toggleBrand = (b) => setBrandChecks((s) => ({ ...s, [b]: !s[b] }));
    const toggleProc = (p) => setProcChecks((s) => ({ ...s, [p]: !s[p] }));

    return (
        <div className="laptops-page">
            <Container fluid className="pt-3">
                {/* Aquí va todo tu JSX para renderizar la página, no lo modifico */}
                 <Row className="align-items-center g-3 px-2">
                    <Col xs="12" className="breadcrumbs">
                        <small><span className="crumb">Inicio</span> / <span className="crumb">Tecnología</span> / <strong>Portátiles</strong></small>
                    </Col>
                    {/* ...el resto del JSX de la barra superior... */}
                </Row>
                <Row className="mt-3 gx-4">
                    <Col lg="3" className="mb-4">
                        {/* ...el resto del JSX de los filtros... */}
                    </Col>
                    <Col lg="9">
                         {error && <Alert variant="danger">{error}</Alert>}
                         {filtered.length === 0 && !error && (
                             <Alert variant="info">No hay productos para mostrar.</Alert>
                         )}
                         <div className={gridMode === 'grid' ? 'grid-products' : 'list-products'}>
                            {filtered.slice(0, perPage).map((product) => (
                                 <article key={product._id} className="product-card">
                                     {/* ...el resto del JSX de la tarjeta de producto... */}
                                     <div className="p-body">
                                        <h6 className="title">{product.nombre}</h6>
                                        <div className="price">₡{product.precio.toLocaleString('es-CR')}</div>
                                         <div className="actions">
                                             <LinkContainer to={`/producto/laptop/${product._id}`}>
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

export default LaptopPage;