const express = require('express');
const router = express.Router();
const trajetController = require('../controllers/trajetController');

router.get('/', trajetController.getTrajets);

module.exports = router;
