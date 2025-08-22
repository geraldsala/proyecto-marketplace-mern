// frontend/src/App.js (Versión Corregida)

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// --- COMPONENTES Y PÁGINAS ---
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import ProductPage from './pages/ProductPage';
import ProfilePage from './pages/ProfilePage';
import Wishlist from './pages/wishlist';
import ProductEditPage from './pages/ProductEditPage';
import ContactMenu from './pages/ContactMenu';
import ScrollToTopButton from './pages/ScrollToTopButton';
import TermsPage from './pages/TermsPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import Laptop from './pages/laptop';
import Audio from './pages/audio';
import Celulares from './pages/celulares';
import Smart from './pages/smart';
import NewsletterPopup from './components/NewsletterPopup';

function App() {
  return (
    // No hay <Router>, <AuthProvider> ni <CartProvider> aquí.
    // Esos ya están en index.js y "envuelven" este componente.
    <>
      <Header />
      <main className='py-3'>
        <Container>
          {/* El componente <Routes> le dice al router dónde empezar a buscar coincidencias */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/producto/:id" element={<ProductPage />} />
            <Route path="/laptops" element={<Laptop />} />
            <Route path="/audio" element={<Audio />} />
            <Route path="/celulares" element={<Celulares />} />
            <Route path="/smarthome" element={<Smart />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/panel" element={<ProfilePage />} />
            <Route path="/tienda/producto/:id/edit" element={<ProductEditPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/soporte" element={<ContactMenu />} />
            <Route path="/terminos" element={<TermsPage />} />
            <Route path="/search/:keyword" element={<SearchPage />} />
            <Route path="/cart" element={<CartPage />} />
            {/* Puedes añadir una ruta "catch-all" para errores 404 si quieres */}
            {/* <Route path="*" element={<NotFoundPage />} /> */}
          </Routes>
        </Container>
      </main>
      <ContactMenu />
      <ScrollToTopButton />
      <NewsletterPopup />
      <Footer />
    </>
  );
}

export default App;