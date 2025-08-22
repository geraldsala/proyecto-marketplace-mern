const mongoose = require('mongoose');

const storeSubscriptionSchema = mongoose.Schema(
  {
    subscriber: { // Quién se suscribe (un 'comprador')
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    store: { // A qué tienda se suscribe (una 'tienda')
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const StoreSubscription = mongoose.model('StoreSubscription', storeSubscriptionSchema);

module.exports = StoreSubscription;
