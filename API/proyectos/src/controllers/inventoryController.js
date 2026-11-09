const { sql, poolPromise } = require('../config/database');
const { handleSqlError, orNull, missingFields, parseId } = require('../utils/Dbhelpers');


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


// ==============================
// Parámetros comunes de insert y update
// ==============================

// StockGroupIDs puede venir como arreglo [1, 3] o como texto '1,3'
const toGroupList = (value) => {
    if (Array.isArray(value)) return value.join(',');
    return orNull(value);
};

const addStockItemInputs = (request, b) => request
    .input('StockItemName', sql.NVarChar(100), orNull(b.StockItemName))
    .input('SupplierID', sql.Int, orNull(b.SupplierID))
    .input('ColorID', sql.Int, orNull(b.ColorID))
    .input('UnitPackageID', sql.Int, orNull(b.UnitPackageID))
    .input('OuterPackageID', sql.Int, orNull(b.OuterPackageID))
    .input('StockGroupIDs', sql.NVarChar(500), toGroupList(b.StockGroupIDs))
    .input('Brand', sql.NVarChar(50), orNull(b.Brand))
    .input('Size', sql.NVarChar(20), orNull(b.Size))
    .input('LeadTimeDays', sql.Int, orNull(b.LeadTimeDays))
    .input('QuantityPerOuter', sql.Int, orNull(b.QuantityPerOuter))
    .input('IsChillerStock', sql.Bit, orNull(b.IsChillerStock))
    .input('Barcode', sql.NVarChar(50), orNull(b.Barcode))
    .input('TaxRate', sql.Decimal(18, 3), orNull(b.TaxRate))
    .input('UnitPrice', sql.Decimal(18, 2), orNull(b.UnitPrice))
    .input('RecommendedRetailPrice', sql.Decimal(18, 2), orNull(b.RecommendedRetailPrice))
    .input('TypicalWeightPerUnit', sql.Decimal(18, 3), orNull(b.TypicalWeightPerUnit))
    .input('MarketingComments', sql.NVarChar(sql.MAX), orNull(b.MarketingComments))
    .input('InternalComments', sql.NVarChar(sql.MAX), orNull(b.InternalComments))
    // Existencias (StockItemHoldings)
    .input('QuantityOnHand', sql.Int, orNull(b.QuantityOnHand))
    .input('BinLocation', sql.NVarChar(20), orNull(b.BinLocation))
    .input('LastCostPrice', sql.Decimal(18, 2), orNull(b.LastCostPrice))
    .input('ReorderLevel', sql.Int, orNull(b.ReorderLevel))
    .input('TargetStockLevel', sql.Int, orNull(b.TargetStockLevel))
    .input('LastEditedBy', sql.Int, orNull(b.LastEditedBy));

const REQUIRED_STOCK_ITEM_FIELDS = [
    'StockItemName',
    'SupplierID',
    'UnitPackageID',
    'OuterPackageID',
    'StockGroupIDs',
    'LeadTimeDays',
    'QuantityPerOuter',
    'TaxRate',
    'UnitPrice',
    'TypicalWeightPerUnit'
];


// ==============================
// POST - Insertar producto de inventario
// ==============================

const createInventoryItem = async (req, res) => {
    const body = req.body || {};

    const missing = missingFields(body, REQUIRED_STOCK_ITEM_FIELDS);
    if (Array.isArray(body.StockGroupIDs) && body.StockGroupIDs.length === 0) {
        missing.push('StockGroupIDs');
    }
    if (missing.length > 0) {
        return res.status(400).json({
            message: 'Missing required fields',
            fields: missing
        });
    }

    try {
        const pool = await poolPromise;

        const result = await addStockItemInputs(pool.request(), body)
            .execute('InsertStockItem');

        res.status(201).json({
            message: 'Stock item created successfully',
            StockItemID: result.recordset[0].StockItemID
        });

    } catch (error) {
        handleSqlError(res, error, 'Error creating stock item');
    }
};


// ==============================
// PUT - Actualizar producto de inventario
// Solo se modifican los campos que vienen en el body.
// Si viene StockGroupIDs, reemplaza todos los grupos del producto.
// ==============================

const updateInventoryItem = async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ message: 'Invalid stock item ID' });
    }

    const body = req.body || {};
    if (Object.keys(body).length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    try {
        const pool = await poolPromise;

        await addStockItemInputs(pool.request(), body)
            .input('StockItemID', sql.Int, id)
            .execute('UpdateStockItem');

        res.status(200).json({
            message: 'Stock item updated successfully'
        });

    } catch (error) {
        handleSqlError(res, error, 'Error updating stock item');
    }
};


// ==============================
// DELETE - Eliminar producto de inventario
// ==============================

const deleteInventoryItem = async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ message: 'Invalid stock item ID' });
    }

    try {
        const pool = await poolPromise;

        await pool
            .request()
            .input('StockItemID', sql.Int, id)
            .execute('DeleteStockItem');

        res.status(200).json({
            message: 'Stock item deleted successfully'
        });

    } catch (error) {
        handleSqlError(res, error, 'Error deleting stock item');
    }
};


module.exports = {
    getInventoryGeneralData,
    getInventorySpecificData,
    getStockGroups,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem
};