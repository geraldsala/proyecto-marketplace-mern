// frontend/src/App.js

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import ProductPage from './pages/ProductPage'; // El único componente para detalles
import ProfilePage from './pages/ProfilePage';
import Wishlist from './pages/wishlist';
import ProductEditPage from './pages/ProductEditPage';
import ContactMenu from './pages/ContactMenu';
import ScrollToTopButton from './pages/ScrollToTopButton';
import TermsPage from './pages/TermsPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage'; // Necesitamos una página para el carrito

// Importando sus páginas de categoría
import Laptop from './pages/laptop';
import Audio from './pages/audio';
import Celulares from './pages/celulares';
import Smart from './pages/smart';

function App() {
  return (
    <>
      <Header />
      <main className='py-3'>
        <Container>
          <Routes>
            {/* --- RUTA DE DETALLE DE PRODUCTO UNIFICADA --- */}
            {/* Esta única ruta es la que arregla la página en blanco */}
            <Route path="/producto/:id" element={<ProductPage />} />
            
            {/* Rutas de Categorías */}
            <Route path="/laptops" element={<Laptop />} />
            <Route path="/audio" element={<Audio />} />
            <Route path="/celulares" element={<Celulares />} />
            <Route path="/smarthome" element={<Smart />} />

            {/* Rutas Principales */}
            <Route path='/' element={<HomePage />} exact />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/panel' element={<ProfilePage />} />
            <Route path="/tienda/producto/:id/edit" element={<ProductEditPage />} />
            <Route path='/admin' element={<AdminPage />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/soporte" element={<ContactMenu />} />
            <Route path="/terminos" element={<TermsPage />} />
            <Route path='/search/:keyword' element={<SearchPage />} />
            <Route path='/cart' element={<CartPage />} />
          </Routes>
        </Container>
      </main>

      <ContactMenu />
      <ScrollToTopButton />
      <Footer />
    </>
  );
}

export default App;