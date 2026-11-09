const { sql, poolPromise } = require('../config/database');
const { handleSqlError, orNull, missingFields, parseId } = require('../utils/Dbhelpers');


// ========================================
// DATOS BÁSICOS DE PROVEEDORES
// ========================================

const getProveedores = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .input(
                'nombreProveedor',
                sql.NVarChar(100),
                req.query.nombre || null
            )
            .input(
                'nombreCategoria',
                sql.NVarChar(100),
                req.query.categoria || null
            )
            .execute('datosBasicosProveedoresFiltrados');

        res.status(200).json(result.recordset);

    } catch (error) {
        console.error('Error obteniendo proveedores:', error);

        res.status(500).json({
            message: 'Error retrieving suppliers'
        });
    }
};


// ========================================
// DATOS AVANZADOS DE UN PROVEEDOR
// ========================================

const getProveedorSpecific = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .input(
                'nombreProveedor',
                sql.NVarChar(100),
                req.query.name
            )
            .execute('datosAvanzadosProveedores');

        if (result.recordset.length === 0) {
            return res.status(404).json({
                message: 'Proveedor no encontrado'
            });
        }

        res.status(200).json(result.recordset);

    } catch (error) {
        console.error('Error obteniendo detalles del proveedor:', error);

        res.status(500).json({
            message: 'Error retrieving supplier details'
        });
    }
};


// ========================================
// Parámetros comunes de insert y update
// ========================================

const addProveedorInputs = (request, b) => request
    .input('SupplierName', sql.NVarChar(100), orNull(b.SupplierName))
    .input('SupplierCategoryID', sql.Int, orNull(b.SupplierCategoryID))
    .input('PrimaryContactPersonID', sql.Int, orNull(b.PrimaryContactPersonID))
    .input('AlternateContactPersonID', sql.Int, orNull(b.AlternateContactPersonID))
    .input('DeliveryMethodID', sql.Int, orNull(b.DeliveryMethodID))
    .input('DeliveryCityID', sql.Int, orNull(b.DeliveryCityID))
    .input('PostalCityID', sql.Int, orNull(b.PostalCityID))
    .input('SupplierReference', sql.NVarChar(20), orNull(b.SupplierReference))
    .input('BankAccountName', sql.NVarChar(50), orNull(b.BankAccountName))
    .input('BankAccountBranch', sql.NVarChar(50), orNull(b.BankAccountBranch))
    .input('BankAccountCode', sql.NVarChar(20), orNull(b.BankAccountCode))
    .input('BankAccountNumber', sql.NVarChar(20), orNull(b.BankAccountNumber))
    .input('BankInternationalCode', sql.NVarChar(20), orNull(b.BankInternationalCode))
    .input('PaymentDays', sql.Int, orNull(b.PaymentDays))
    .input('InternalComments', sql.NVarChar(sql.MAX), orNull(b.InternalComments))
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

const CAMPOS_OBLIGATORIOS_PROVEEDOR = [
    'SupplierName',
    'SupplierCategoryID',
    'PrimaryContactPersonID',
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


// ========================================
// POST - INSERTAR PROVEEDOR
// ========================================

const createProveedor = async (req, res) => {
    const body = req.body || {};

    const missing = missingFields(body, CAMPOS_OBLIGATORIOS_PROVEEDOR);
    if (missing.length > 0) {
        return res.status(400).json({
            message: 'Missing required fields',
            fields: missing
        });
    }

    try {
        const pool = await poolPromise;

        const result = await addProveedorInputs(pool.request(), body)
            .execute('insertarProveedor');

        res.status(201).json({
            message: 'Supplier created successfully',
            SupplierID: result.recordset[0].SupplierID
        });

    } catch (error) {
        handleSqlError(res, error, 'Error creating supplier');
    }
};


// ========================================
// PUT - ACTUALIZAR PROVEEDOR
// Solo se modifican los campos que vienen en el body
// ========================================

const updateProveedor = async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ message: 'Invalid supplier ID' });
    }

    const body = req.body || {};
    if (Object.keys(body).length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    try {
        const pool = await poolPromise;

        await addProveedorInputs(pool.request(), body)
            .input('SupplierID', sql.Int, id)
            .execute('actualizarProveedor');

        res.status(200).json({
            message: 'Supplier updated successfully'
        });

    } catch (error) {
        handleSqlError(res, error, 'Error updating supplier');
    }
};


// ========================================
// DELETE - ELIMINAR PROVEEDOR
// ========================================

const deleteProveedor = async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ message: 'Invalid supplier ID' });
    }

    try {
        const pool = await poolPromise;

        await pool
            .request()
            .input('SupplierID', sql.Int, id)
            .execute('eliminarProveedor');

        res.status(200).json({
            message: 'Supplier deleted successfully'
        });

    } catch (error) {
        handleSqlError(res, error, 'Error deleting supplier');
    }
};


module.exports = {
    getProveedores,
    getProveedorSpecific,
    createProveedor,
    updateProveedor,
    deleteProveedor
};