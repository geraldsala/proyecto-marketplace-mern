import React, { useState } from "react";
import "./ContactMenu.css";

const ContactMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setShowSupportForm(false);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const openWhatsApp = () => {
    window.open("https://wa.me/000000000", "_blank");
  };

  const toggleSupportForm = () => {
    setShowSupportForm(!showSupportForm);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const data = { name, email, message };

    try {
      const response = await fetch("http://localhost:5000/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccessMessage(result.msg);
        setName(""); setEmail(""); setMessage("");
        setTimeout(() => {
          setSuccessMessage("");
          setShowSupportForm(false);
        }, 3000);
      } else {
        setErrorMessage(result.msg || "❌ Ocurrió un error.");
      }
    } catch (error) {
      setErrorMessage("❌ Hubo un problema con el servidor.");
    }
  };

  return (
    <div className="contact-menu-container">
      {isOpen && (
        <div className="contact-options">
          <button className="contact-button whatsapp" onClick={openWhatsApp}>📞</button>
          <button className="contact-button support" onClick={toggleSupportForm}>📩</button>
        </div>
      )}

      <button className="main-button" onClick={toggleMenu}>☰</button>

      {showSupportForm && (
        <form className="support-form" onSubmit={handleSubmit}>
          <h4>Soporte</h4>
          {successMessage && <p className="success-message">{successMessage}</p>}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <input type="text" placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="email" placeholder="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <textarea placeholder="Mensaje" value={message} onChange={(e) => setMessage(e.target.value)} required />
          <button type="submit">Enviar</button>
        </form>
      )}
    </div>
  );
};

export default ContactMenu;