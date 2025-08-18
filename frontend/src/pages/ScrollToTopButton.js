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
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
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