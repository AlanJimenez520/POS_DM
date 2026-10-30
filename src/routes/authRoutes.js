const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Endpoints de registro y login
router.post('/register', authController.registrarUsuario);
router.post('/login', authController.login);

module.exports = router;