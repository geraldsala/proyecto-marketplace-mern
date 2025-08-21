import React from 'react';
// Remove BrowserRouter as Router from this import
import { Route, Routes } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import ProductPage from './pages/ProductPage';
import ProfilePage from './pages/ProfilePage';
import PurchaseHistoryPage from './pages/PurchaseHistoryPage';
import Wishlist from './pages/wishlist';

import ContactMenu from './pages/ContactMenu';
import Laptop from './pages/laptop';
import Audio from './pages/audio';
import Celulares from './pages/celulares';
import ScrollToTopButton from './pages/ScrollToTopButton';
import TermsPage from './pages/TermsPage';
import Smart from './pages/smart';
import DetallesLap from './pages/detalleslap';
import DetallesAudio from './pages/detallesaudio';
import DetallesCel from './pages/detallescel'; 
import DetalleSmart from './pages/detallesmart';
import ProductEditPage from './pages/ProductEditPage';

function App() {
  // Remove the <Router> component that was wrapping everything
  return (
    <>
      <Header />
      <main className='py-3'>
        <Container>
          <Routes>
            <Route path='/' element={<HomePage />} exact />
            <Route path='/login' element={<LoginPage />} />
            <Route path='/register' element={<RegisterPage />} />
            <Route path='/admin' element={<AdminPage />} />
            <Route path='/product/:id' element={<ProductPage />} />
            <Route path='/profile' element={<ProfilePage />} />
            <Route path='/purchase-history' element={<PurchaseHistoryPage />} />
             <Route path="/wishlist" element={<Wishlist />} />
            
            {/* Rutas de categorías y otros componentes que ya tenías */}
            <Route path="/soporte" element={<ContactMenu />} />
            <Route path="/laptops" element={<Laptop />} />
            <Route path="/audio" element={<Audio />} />
            <Route path="/celulares" element={<Celulares />} />
            <Route path="/terminos" element={<TermsPage />} />
            <Route path="/smarthome" element={<Smart />} />
            <Route path="/producto/laptop/:id" element={<DetallesLap />} />
            <Route path="/producto/audio/:id" element={<DetallesAudio />} />
            <Route path="/producto/celular/:id" element={<DetallesCel />} />
            <Route path="/producto/smart/:id" element={<DetalleSmart />} />
            <Route path="/tienda/producto/:id/edit" element={<ProductEditPage />} /> 
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