const express = require('express');

const router = express.Router();

const validateApiKey = require('../middleware/apiKey');

const {
    getCustomerGeneralData,
    getCustomerSpecificData,
    createCustomer,
    updateCustomer,
    deleteCustomer
} = require('../controllers/customerController');


// GET /api/customers?pageNumber=1&name=...
router.get(
    '/',
    validateApiKey,
    getCustomerGeneralData
);


// GET /api/customers/specific?name=...
router.get(
    '/specific',
    validateApiKey,
    getCustomerSpecificData
);


// POST /api/customers
router.post(
    '/',
    validateApiKey,
    createCustomer
);


// PUT /api/customers/:id
router.put(
    '/:id',
    validateApiKey,
    updateCustomer
);


// DELETE /api/customers/:id
router.delete(
    '/:id',
    validateApiKey,
    deleteCustomer
);


module.exports = router;