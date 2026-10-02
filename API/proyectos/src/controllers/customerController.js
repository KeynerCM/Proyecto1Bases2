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
            message: 'Error retrieving customers general info'
        });
    }
};

const getCustomerSpecificData = async(req, res) =>{
    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .input('nombreCliente', sql.NVarChar(100), req.query.name)
            .execute('GetCustomerAdvancedInfo');
        res.status(200).json(result.recordset);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error retrieving customers specific info'
        });
    }
};

module.exports = {
    getCustomerGeneralData,
    getCustomerSpecificData
};
