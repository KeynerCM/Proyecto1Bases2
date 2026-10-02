const express = require('express');

const router = express.Router();

const validateApiKey = require('../middleware/apiKey');

const {
    getInventoryGeneralData,
    getInventorySpecificData,
    getStockGroups
} = require('../controllers/inventoryController');

router.get(
    '/',
    validateApiKey,
    getInventoryGeneralData,
);

router.get(
    '/specific',
    validateApiKey,
    getInventorySpecificData,
);

router.get(
    '/groups',
    validateApiKey,
    getStockGroups,
);

module.exports = router
