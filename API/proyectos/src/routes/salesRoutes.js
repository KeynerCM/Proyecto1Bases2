const express = require('express');

const router = express.Router();

const validateApiKey = require('../middleware/apiKey');

const {
    getSalesGeneralData,
    getSalesSpecificData
} = require('../controllers/salesController');

router.get(
    '/',
    validateApiKey,
    getSalesGeneralData,
);

router.get(
    '/specific',
    validateApiKey,
    getSalesSpecificData,
);

module.exports = router
