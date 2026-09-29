const express = require('express');

const router = express.Router();

const validateApiKey = require('../middleware/apiKey');

const {
    getCustomerGeneralData,
    getCustomerSpecificData
} = require('../controllers/customerController');

router.get(
    '/',
    validateApiKey,
    getCustomerGeneralData,
);

router.get(
    '/specific',
    validateApiKey,
    getCustomerSpecificData,
);

module.exports = router