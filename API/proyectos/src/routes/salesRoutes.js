const express = require('express');

const router = express.Router();

const validateApiKey = require('../middleware/apiKey');

const {
    getSalesGeneralData,
    getSalesSpecificData,
    createSale,
    updateSale,
    deleteSale
} = require('../controllers/salesController');


// GET /api/sales?pageNumber=1&customer=...&startDate=...&endDate=...&minAmount=...&maxAmount=...
router.get(
    '/',
    validateApiKey,
    getSalesGeneralData
);


// GET /api/sales/specific?id=...
router.get(
    '/specific',
    validateApiKey,
    getSalesSpecificData
);


// POST /api/sales
router.post(
    '/',
    validateApiKey,
    createSale
);


// PUT /api/sales/:id
router.put(
    '/:id',
    validateApiKey,
    updateSale
);


// DELETE /api/sales/:id
router.delete(
    '/:id',
    validateApiKey,
    deleteSale
);


module.exports = router;