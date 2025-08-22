// frontend/src/pages/ScrollToTopButton.js
import React, { useEffect, useState } from 'react';
import './ScrollToTopButton.css';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const scrollStep = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > 0) {
        // Cambia el número 10 para ajustar la velocidad (menor = más lento)
        window.scrollTo(0, currentScroll - 10);
        requestAnimationFrame(scrollStep);
      }
    };
    requestAnimationFrame(scrollStep);
  };

  return (
    isVisible && (
      <div className="scroll-to-top" onClick={scrollToTop}>
        <span role="img" aria-label="Subir">⬆️</span>
      </div>
    )
  );
};

export default ScrollToTopButton;