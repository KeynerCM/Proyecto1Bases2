const { sql, poolPromise } = require('../config/database');


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

module.exports = {
    getSalesGeneralData,
    getSalesSpecificData
};
