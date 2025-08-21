const Subscriber = require("../models/Subscriber");

const subscribeUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "El correo es obligatorio" });
    }

    // Verificar si ya existe
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Este correo ya está registrado" });
    }

    // Guardar nuevo
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    res.json({ message: "¡Gracias por suscribirte!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

module.exports = { subscribeUser };