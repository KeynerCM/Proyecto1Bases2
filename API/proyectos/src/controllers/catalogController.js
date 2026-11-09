const { sql, poolPromise } = require('../config/database');
const { handleSqlError, orNull, parseId } = require('../utils/Dbhelpers');


// Catálogos permitidos (deben coincidir con el SP GetCatalog)
const CATALOGS = [
    'customerCategories',
    'buyingGroups',
    'deliveryMethods',
    'supplierCategories',
    'suppliers',
    'packageTypes',
    'colors',
    'salespeople',
    'people',
    'cities',
    'customers',
    'stockItems'
];


// ==============================
// GET /api/catalogs/:name?search=...&id=...
// ==============================

const getCatalog = async (req, res) => {
    const { name } = req.params;

    if (!CATALOGS.includes(name)) {
        return res.status(404).json({ message: `Catalog not found: ${name}` });
    }

    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .input('Catalog', sql.NVarChar(50), name)
            .input('Search', sql.NVarChar(100), orNull(req.query.search))
            .input('ID', sql.Int, parseId(req.query.id))
            .execute('GetCatalog');

        res.status(200).json(result.recordset);

    } catch (error) {
        handleSqlError(res, error, 'Error retrieving catalog');
    }
};


module.exports = {
    getCatalog
};
