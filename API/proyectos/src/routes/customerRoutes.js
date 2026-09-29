const express = require('express');

const router = express.Router();

const validateApiKey = require('../middleware/apiKey');

const {
    getCustomerGeneralData
} = require('../controllers/customerController');

router.get(
    '/',
    validateApiKey,
    getCustomerGeneralData
);

module.exports = router