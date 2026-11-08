const { sql, poolPromise } = require('../config/database');
const { handleSqlError, orNull, missingFields, parseId } = require('../utils/dbHelpers');


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


// ==============================
// Parámetros comunes de insert y update
// ==============================

const addCustomerInputs = (request, b) => request
    .input('CustomerName', sql.NVarChar(100), orNull(b.CustomerName))
    .input('CustomerCategoryID', sql.Int, orNull(b.CustomerCategoryID))
    .input('BuyingGroupID', sql.Int, orNull(b.BuyingGroupID))
    .input('PrimaryContactPersonID', sql.Int, orNull(b.PrimaryContactPersonID))
    .input('AlternateContactPersonID', sql.Int, orNull(b.AlternateContactPersonID))
    .input('DeliveryMethodID', sql.Int, orNull(b.DeliveryMethodID))
    .input('DeliveryCityID', sql.Int, orNull(b.DeliveryCityID))
    .input('PostalCityID', sql.Int, orNull(b.PostalCityID))
    .input('CreditLimit', sql.Decimal(18, 2), orNull(b.CreditLimit))
    .input('StandardDiscountPercentage', sql.Decimal(18, 3), orNull(b.StandardDiscountPercentage))
    .input('IsStatementSent', sql.Bit, orNull(b.IsStatementSent))
    .input('IsOnCreditHold', sql.Bit, orNull(b.IsOnCreditHold))
    .input('PaymentDays', sql.Int, orNull(b.PaymentDays))
    .input('PhoneNumber', sql.NVarChar(20), orNull(b.PhoneNumber))
    .input('FaxNumber', sql.NVarChar(20), orNull(b.FaxNumber))
    .input('WebsiteURL', sql.NVarChar(256), orNull(b.WebsiteURL))
    .input('DeliveryAddressLine1', sql.NVarChar(60), orNull(b.DeliveryAddressLine1))
    .input('DeliveryAddressLine2', sql.NVarChar(60), orNull(b.DeliveryAddressLine2))
    .input('DeliveryPostalCode', sql.NVarChar(10), orNull(b.DeliveryPostalCode))
    .input('PostalAddressLine1', sql.NVarChar(60), orNull(b.PostalAddressLine1))
    .input('PostalAddressLine2', sql.NVarChar(60), orNull(b.PostalAddressLine2))
    .input('PostalPostalCode', sql.NVarChar(10), orNull(b.PostalPostalCode))
    .input('LastEditedBy', sql.Int, orNull(b.LastEditedBy));

const REQUIRED_CUSTOMER_FIELDS = [
    'CustomerName',
    'CustomerCategoryID',
    'PrimaryContactPersonID',
    'DeliveryMethodID',
    'DeliveryCityID',
    'PaymentDays',
    'PhoneNumber',
    'FaxNumber',
    'WebsiteURL',
    'DeliveryAddressLine1',
    'DeliveryPostalCode',
    'PostalAddressLine1',
    'PostalPostalCode'
];


// ==============================
// POST - Insertar cliente
// ==============================

const createCustomer = async (req, res) => {
    const body = req.body || {};

    const missing = missingFields(body, REQUIRED_CUSTOMER_FIELDS);
    if (missing.length > 0) {
        return res.status(400).json({
            message: 'Missing required fields',
            fields: missing
        });
    }

    try {
        const pool = await poolPromise;

        const result = await addCustomerInputs(pool.request(), body)
            .execute('InsertCustomer');

        res.status(201).json({
            message: 'Customer created successfully',
            CustomerID: result.recordset[0].CustomerID
        });

    } catch (error) {
        handleSqlError(res, error, 'Error creating customer');
    }
};


// ==============================
// PUT - Actualizar cliente
// Solo se modifican los campos que vienen en el body
// ==============================

const updateCustomer = async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ message: 'Invalid customer ID' });
    }

    const body = req.body || {};
    if (Object.keys(body).length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    try {
        const pool = await poolPromise;

        await addCustomerInputs(pool.request(), body)
            .input('CustomerID', sql.Int, id)
            .execute('UpdateCustomer');

        res.status(200).json({
            message: 'Customer updated successfully'
        });

    } catch (error) {
        handleSqlError(res, error, 'Error updating customer');
    }
};


// ==============================
// DELETE - Eliminar cliente
// ==============================

const deleteCustomer = async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ message: 'Invalid customer ID' });
    }

    try {
        const pool = await poolPromise;

        await pool
            .request()
            .input('CustomerID', sql.Int, id)
            .execute('DeleteCustomer');

        res.status(200).json({
            message: 'Customer deleted successfully'
        });

    } catch (error) {
        handleSqlError(res, error, 'Error deleting customer');
    }
};


module.exports = {
    getCustomerGeneralData,
    getCustomerSpecificData,
    createCustomer,
    updateCustomer,
    deleteCustomer
};