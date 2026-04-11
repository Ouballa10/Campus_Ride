const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');

router.get('/', evaluationController.getEvaluations);

module.exports = router;
