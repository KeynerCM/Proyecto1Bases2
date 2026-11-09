const express = require('express');

const router = express.Router();

const validateApiKey = require('../middleware/apiKey');

const { getCatalog } = require('../controllers/catalogController');


// GET /api/catalogs/:name?search=...&id=...
router.get(
    '/:name',
    validateApiKey,
    getCatalog
);


module.exports = router;
