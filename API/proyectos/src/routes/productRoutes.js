const express = require('express');

const router = express.Router();

const validateApiKey = require('../middleware/apiKey');

const {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');


// GET
router.get(
    '/',
    validateApiKey,
    getProducts
);


// POST
router.post(
    '/',
    validateApiKey,
    createProduct
);


// PUT
router.put(
    '/:id',
    validateApiKey,
    updateProduct
);


// DELETE
router.delete(
    '/:id',
    validateApiKey,
    deleteProduct
);


module.exports = router;