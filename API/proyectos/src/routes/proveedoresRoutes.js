const express = require('express');

const {
    getProveedores,
    getProveedorSpecific
} = require('../controllers/proveedoresController');

const router = express.Router();


// GET /api/proveedores
router.get('/', getProveedores);


// GET /api/proveedores/specific?name=...
router.get('/specific', getProveedorSpecific);


module.exports = router;