import User from "../models/User.js";
import Product from "../models/Product.js";

export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener wishlist" });
  }
};

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Verify that the product ID is valid and the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    const user = await User.findById(req.user._id);

    // 2. Check if the product is already in the wishlist to prevent duplicates
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    // You can send back the updated wishlist or a success message
    res.json(user.wishlist);

  } catch (err) {
    console.error(err); // Log the actual error for debugging
    res.status(500).json({ message: "Error al agregar a wishlist" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { productId } = req.params;

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId
    );
    await user.save();

    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar de wishlist" });
  }
};
