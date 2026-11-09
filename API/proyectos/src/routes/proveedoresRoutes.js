const express = require('express');

const router = express.Router();

const validateApiKey = require('../middleware/apiKey');

const {
    getProveedores,
    getProveedorSpecific,
    createProveedor,
    updateProveedor,
    deleteProveedor
} = require('../controllers/proveedoresController');


// GET /api/proveedores?nombre=...&categoria=...
router.get(
    '/',
    validateApiKey,
    getProveedores
);


// GET /api/proveedores/specific?name=...
router.get(
    '/specific',
    validateApiKey,
    getProveedorSpecific
);


// POST /api/proveedores
router.post(
    '/',
    validateApiKey,
    createProveedor
);


// PUT /api/proveedores/:id
router.put(
    '/:id',
    validateApiKey,
    updateProveedor
);


// DELETE /api/proveedores/:id
router.delete(
    '/:id',
    validateApiKey,
    deleteProveedor
);


module.exports = router;