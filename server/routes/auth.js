const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegisterInput, validateLoginInput } = require('../validators/validators');

router.post('/register', validateRegisterInput, authController.register);
router.post('/login', validateLoginInput, authController.login);

module.exports = router;
