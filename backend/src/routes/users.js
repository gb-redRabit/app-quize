const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/history', authMiddleware.verifyToken, usersController.getUserHistory);
router.put('/update', authMiddleware.verifyToken, usersController.updateUserHistory);

module.exports = router;