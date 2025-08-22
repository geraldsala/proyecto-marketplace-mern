import React, { useState } from "react";
import "./ContactMenu.css";

const ContactMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSupportForm, setShowSupportForm] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setShowSupportForm(false);
  };

  const openWhatsApp = () => {
    window.open("https://wa.me/000000000", "_blank"); //aqui vemos si se añade el numero de uno de nosotros o el link de whatsApp Web
  };

  const toggleSupportForm = () => {
    setShowSupportForm(!showSupportForm);
  };

  return (
    <div className="contact-menu-container">
      {isOpen && (
        <div className="contact-options">
          <button className="contact-button whatsapp" onClick={openWhatsApp}>
            🟢
          </button>
          <button className="contact-button support" onClick={toggleSupportForm}>
            📩
          </button>
        </div>
      )}

      <button className="main-button" onClick={toggleMenu}>
        ☰
      </button>

      {showSupportForm && (
        <div className="support-form">
          <h4>Soporte</h4>
          <input type="text" placeholder="Nombre" />
          <input type="email" placeholder="Correo" />
          <textarea placeholder="Mensaje"></textarea>
          <button>Enviar</button>
        </div>
      )}
    </div>
  );
};

export default ContactMenu;