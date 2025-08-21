const mongoose = require('mongoose');

const storeSubscriptionSchema = new mongoose.Schema({
  subscriber: { // El usuario que se suscribe (debe ser 'comprador')
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  store: { // La tienda a la que se suscriben (debe ser 'tienda')
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Índice para asegurar que un usuario no pueda suscribirse a la misma tienda más de una vez.
storeSubscriptionSchema.index({ subscriber: 1, store: 1 }, { unique: true });

const StoreSubscription = mongoose.model('StoreSubscription', storeSubscriptionSchema);
module.exports = StoreSubscription;
