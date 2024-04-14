const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authMiddleware');

router.post('/update',authenticate, userController.updateUser);

module.exports = router;
