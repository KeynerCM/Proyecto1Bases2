const { sql, poolPromise } = require('../config/database');


// ==============================
// GET - Obtener inventario general
// ==============================

const getInventoryGeneralData = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .input('PageNumber', sql.Int, req.query.pageNumber || 1)
            .input('NameFilter', sql.NVarChar(100), req.query.name || null)
            .input('StockGroupID', sql.Int, req.query.groupId || null)
            .input('MinQuantity', sql.Int, req.query.minQuantity || null)
            .input('MaxQuantity', sql.Int, req.query.maxQuantity || null)
            .execute('GetStockItemsGeneralInfo');

        res.status(200).json(result.recordset);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error retrieving inventory general info'
        });
    }
};

const getInventorySpecificData = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .input('StockItemID', sql.Int, req.query.id)
            .execute('GetStockItemAdvancedInfo');

        res.status(200).json(result.recordset);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error retrieving inventory specific info'
        });
    }
};

const getStockGroups = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .execute('GetStockGroups');

        res.status(200).json(result.recordset);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error retrieving stock groups'
        });
    }
};

module.exports = {
    getInventoryGeneralData,
    getInventorySpecificData,
    getStockGroups
};
