const { sql, poolPromise } = require('../config/database');


// ==============================
// GET - Obtener productos
// ==============================

const getProducts = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .execute('GetProductData');

        res.status(200).json(result.recordset);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error retrieving products'
        });
    }
};


// ==============================
// POST - Insertar producto
// ==============================

const createProduct = async (req, res) => {
    try {

        const {
            Name,
            ProductNumber,
            SafetyStockLevel,
            ReorderPoint,
            StandardCost,
            ListPrice,
            DaysToManufacture,
            SellStartDate
        } = req.body;


        const pool = await poolPromise;

        await pool
            .request()
            .input('Name', sql.NVarChar(50), Name)
            .input('ProductNumber', sql.NVarChar(25), ProductNumber)
            .input('SafetyStockLevel', sql.SmallInt, SafetyStockLevel)
            .input('ReorderPoint', sql.SmallInt, ReorderPoint)
            .input('StandardCost', sql.Money, StandardCost)
            .input('ListPrice', sql.Money, ListPrice)
            .input('DaysToManufacture', sql.Int, DaysToManufacture)
            .input('SellStartDate', sql.DateTime, SellStartDate || null)
            .execute('InsertProduct');


        res.status(201).json({
            message: 'Product created successfully'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Error creating product'
        });
    }
};


// ==============================
// PUT - Actualizar producto
// ==============================

const updateProduct = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            Name,
            ProductNumber,
            Color,
            ListPrice
        } = req.body;


        const pool = await poolPromise;

        const result = await pool
            .request()
            .input('ProductID', sql.Int, id)
            .input('Name', sql.NVarChar(50), Name)
            .input('ProductNumber', sql.NVarChar(25), ProductNumber)
            .input('Color', sql.NVarChar(15), Color || null)
            .input('ListPrice', sql.Money, ListPrice)
            .execute('UpdateProduct');


        res.status(200).json({
            message: 'Product updated successfully'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Error updating product'
        });
    }
};


// ==============================
// DELETE - Eliminar producto
// ==============================

const deleteProduct = async (req, res) => {
    try {

        const { id } = req.params;


        const pool = await poolPromise;

        await pool
            .request()
            .input('ProductID', sql.Int, id)
            .execute('DeleteProduct');


        res.status(200).json({
            message: 'Product deleted successfully'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Error deleting product'
        });
    }
};


module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
};