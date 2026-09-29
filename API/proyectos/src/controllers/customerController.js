const { sql, poolPromise } = require('../config/database');


// ==============================
// GET - Obtener clientes general
// ==============================

const getCustomerGeneralData = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .input('PageNumber', sql.Int, req.query.pageNumber || 1)
            .input('NameFilter', sql.NVarChar(100), req.query.name || null)
            .execute('GetCustomersGeneralInfo');

        res.status(200).json(result.recordset);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error retrieving products'
        });
    }
};


module.exports = {
    getCustomerGeneralData
};
