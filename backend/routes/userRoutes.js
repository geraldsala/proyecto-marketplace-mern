const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  getUserProfile,
} = require('../controllers/userController.js');
const { protect } = require('../middlewares/authMiddleware.js');

router.post('/login', authUser);
router.route('/register').post(registerUser);
router.route('/profile').get(protect, getUserProfile);

module.exports = router;