const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  validateRegister,
  validateLogin
} = require('../controllers/authController');
const { handleValidationErrors } = require('../middleware/validation');

router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/logout', logout);

module.exports = router;
