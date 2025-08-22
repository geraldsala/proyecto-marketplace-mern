const express = require('express');
const router = express.Router();
const SupportMessage = require('../models/SupportMessage');

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, msg: 'Todos los campos son obligatorios.' });
  }

  try {
    const newMsg = new SupportMessage({ name, email, message });
    await newMsg.save();
   return res.status(200).json({ success: true, msg: '✅ Mensaje enviado con éxito.' });
  } catch (err) {
    console.error('❌ Error en el backend:', err);
    return res.status(500).json({ success: false, msg: '❌ Error interno del servidor.' });
  }
});

module.exports = router;