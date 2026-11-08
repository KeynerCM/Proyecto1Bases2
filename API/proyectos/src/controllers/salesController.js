const { sql, poolPromise } = require('../config/database');
const { handleSqlError, orNull, missingFields, parseId } = require('../utils/dbHelpers');


// ==============================
// GET - Obtener ventas general
// ==============================

const getSalesGeneralData = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .input('PageNumber', sql.Int, req.query.pageNumber || 1)
            .input('CustomerFilter', sql.NVarChar(100), req.query.customer || null)
            .input('StartDate', sql.Date, req.query.startDate || null)
            .input('EndDate', sql.Date, req.query.endDate || null)
            .input('MinAmount', sql.Decimal(18, 2), req.query.minAmount || null)
            .input('MaxAmount', sql.Decimal(18, 2), req.query.maxAmount || null)
            .execute('GetInvoicesGeneralInfo');

        res.status(200).json(result.recordset);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error retrieving sales general info'
        });
    }
};

const getSalesSpecificData = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .input('InvoiceID', sql.Int, req.query.id)
            .execute('GetInvoiceAdvancedInfo');

        // El procedimiento devuelve dos resultados: encabezado y detalle
        res.status(200).json({
            header: result.recordsets[0][0] || null,
            lines: result.recordsets[1]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error retrieving sales specific info'
        });
    }
};


// ==============================
// Parámetros comunes de insert y update
// Lines: [{ StockItemID: 66, Quantity: 5 }, { StockItemID: 1, Quantity: 2, UnitPrice: 10.5 }]
// UnitPrice es opcional: si no viene se usa el precio del producto
// ==============================

const addInvoiceInputs = (request, b) => request
    .input('DeliveryMethodID', sql.Int, orNull(b.DeliveryMethodID))
    .input('SalespersonPersonID', sql.Int, orNull(b.SalespersonPersonID))
    .input('PackedByPersonID', sql.Int, orNull(b.PackedByPersonID))
    .input('InvoiceDate', sql.Date, orNull(b.InvoiceDate))
    .input('CustomerPurchaseOrderNumber', sql.NVarChar(20), orNull(b.CustomerPurchaseOrderNumber))
    .input('DeliveryInstructions', sql.NVarChar(sql.MAX), orNull(b.DeliveryInstructions))
    .input('Comments', sql.NVarChar(sql.MAX), orNull(b.Comments))
    .input('Lines', sql.NVarChar(sql.MAX), b.Lines === undefined ? null : JSON.stringify(b.Lines))
    .input('LastEditedBy', sql.Int, orNull(b.LastEditedBy));


// ==============================
// POST - Insertar factura con sus líneas
// ==============================

const createSale = async (req, res) => {
    const body = req.body || {};

    const missing = missingFields(body, ['CustomerID', 'SalespersonPersonID']);
    if (!Array.isArray(body.Lines) || body.Lines.length === 0) {
        missing.push('Lines');
    }
    if (missing.length > 0) {
        return res.status(400).json({
            message: 'Missing required fields',
            fields: missing
        });
    }

    try {
        const pool = await poolPromise;

        const result = await addInvoiceInputs(pool.request(), body)
            .input('CustomerID', sql.Int, body.CustomerID)
            .execute('InsertInvoice');

        res.status(201).json({
            message: 'Invoice created successfully',
            InvoiceID: result.recordset[0].InvoiceID
        });

    } catch (error) {
        handleSqlError(res, error, 'Error creating invoice');
    }
};


// ==============================
// PUT - Actualizar factura
// Solo se modifican los campos que vienen en el body.
// Si viene Lines, reemplaza todas las líneas de la factura.
// ==============================

const updateSale = async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ message: 'Invalid invoice ID' });
    }

    const body = req.body || {};
    if (Object.keys(body).length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }
    if (body.CustomerID !== undefined) {
        return res.status(400).json({
            message: 'The customer of an invoice cannot be changed'
        });
    }
    if (body.Lines !== undefined && (!Array.isArray(body.Lines) || body.Lines.length === 0)) {
        return res.status(400).json({
            message: 'Lines must be a non-empty array'
        });
    }

    try {
        const pool = await poolPromise;

        await addInvoiceInputs(pool.request(), body)
            .input('InvoiceID', sql.Int, id)
            .execute('UpdateInvoice');

        res.status(200).json({
            message: 'Invoice updated successfully'
        });

    } catch (error) {
        handleSqlError(res, error, 'Error updating invoice');
    }
};


// ==============================
// DELETE - Eliminar factura (con sus líneas y transacciones)
// ==============================

const deleteSale = async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ message: 'Invalid invoice ID' });
    }

    try {
        const pool = await poolPromise;

        await pool
            .request()
            .input('InvoiceID', sql.Int, id)
            .execute('DeleteInvoice');

        res.status(200).json({
            message: 'Invoice deleted successfully'
        });

    } catch (error) {
        handleSqlError(res, error, 'Error deleting invoice');
    }
};


module.exports = {
    getSalesGeneralData,
    getSalesSpecificData,
    createSale,
    updateSale,
    deleteSale
};