// Importa React y el hook useState para manejar estados dentro del componente
import React, { useState } from "react";
import "./SubscribeModal.css";

// Componente funcional SubscribeModal con dos props: onClose y onSubscribe
const SubscribeModal = ({ onClose, onSubscribe }) => {
  // Estado para almacenar el email ingresado por el usuario
  const [email, setEmail] = useState("");

  // Estado para saber si el usuario aceptó los términos
  const [agree, setAgree] = useState(false);

  // Función que maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario

    // Si no aceptó los términos, muestra una alerta y cancela el envío
    if (!agree) {
      alert("Debes aceptar los términos para suscribirte.");
      return;
    }

    // Intenta hacer una petición POST al backend con el email
    try {
      const response = await fetch("http://localhost:5000/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }), // Se envía el email como JSON
      });

      const data = await response.json(); // Respuesta del servidor

      if (response.ok) {
        // Si la respuesta fue exitosa
        alert("✅ " + data.message);
        onSubscribe(email); // Llama la función pasada por props para manejar la suscripción
        onClose(); // Cierra el modal
      } else {
        // Si hubo un error en la respuesta del backend
        alert("⚠️ " + data.error);
      }
    } catch (error) {
      // Si ocurre un error al intentar conectarse con el servidor
      console.error(error);
      alert("❌ Error al conectar con el servidor");
    }
  };

  // JSX que define la estructura visual del modal
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Botón para cerrar el modal */}
        <button className="close-btn" onClick={onClose}>×</button>

        {/* Título y subtítulo del modal */}
        <h2 className="title">¡No te pierdas de nada!</h2>
        <p className="subtitle">
          Escribe tu correo y recibe todas las novedades de Marketplace Tech.
        </p>

        {/* Formulario de suscripción */}
        <form onSubmit={handleSubmit}>
          {/* Campo de entrada para el email */}
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Botón para enviar el formulario */}
          <button type="submit" className="subscribe-btn">¡Suscribirme!</button>

          {/* Casilla de verificación para aceptar los términos */}
          <div className="terms">
            <input
              type="checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
            />
            <label>Acepto los términos y políticas de privacidad</label>
          </div>
        </form>
      </div>
    </div>
  );
};

// Exporta el componente para usarlo en otras partes de la aplicación
export default SubscribeModal;