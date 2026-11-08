const express = require('express');

const router = express.Router();

const validateApiKey = require('../middleware/apiKey');

const {
    getInventoryGeneralData,
    getInventorySpecificData,
    getStockGroups,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
} = require('../controllers/inventoryController');


// GET /api/inventory?pageNumber=1&name=...&groupId=...&minQuantity=...&maxQuantity=...
router.get(
    '/',
    validateApiKey,
    getInventoryGeneralData
);


// GET /api/inventory/specific?id=...
router.get(
    '/specific',
    validateApiKey,
    getInventorySpecificData
);


// GET /api/inventory/groups
router.get(
    '/groups',
    validateApiKey,
    getStockGroups
);


// POST /api/inventory
router.post(
    '/',
    validateApiKey,
    createInventoryItem
);


// PUT /api/inventory/:id
router.put(
    '/:id',
    validateApiKey,
    updateInventoryItem
);


// DELETE /api/inventory/:id
router.delete(
    '/:id',
    validateApiKey,
    deleteInventoryItem
);


module.exports = router;