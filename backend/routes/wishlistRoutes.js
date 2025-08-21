// routes/wishlistRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";

const router = express.Router();

// GET /api/wishlist -> devuelve wishlist del usuario logueado
router.get("/", protect, getWishlist);

// POST /api/wishlist/:productId -> agrega producto
router.post("/:productId", protect, addToWishlist);

// DELETE /api/wishlist/:productId -> elimina producto
router.delete("/:productId", protect, removeFromWishlist);

export default router;
