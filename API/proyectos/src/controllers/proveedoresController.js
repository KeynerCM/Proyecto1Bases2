const { sql, poolPromise } = require('../config/database');


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


module.exports = {
    getProveedores,
    getProveedorSpecific
};