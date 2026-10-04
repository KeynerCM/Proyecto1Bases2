const { sql, poolPromise } = require('../config/database');

// =====================================================
// ESTADISTICAS 1 - COMPRAS
// =====================================================

const getEstadisticasCompras = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .input(
                'Proveedor',
                sql.NVarChar(100),
                req.query.proveedor || null
            )
            .input(
                'Categoria',
                sql.NVarChar(100),
                req.query.categoria || null
            )
            .execute('EstadisticasCompras');

        res.status(200).json(result.recordset);

    } catch (error) {
        console.error('Error obteniendo estadísticas de compras:', error);

        res.status(500).json({
            message: 'Error retrieving purchase statistics'
        });
    }
};


// =====================================================
// ESTADISTICAS 2 - VENTAS
// =====================================================

const getEstadisticasVentas = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool
            .request()
            .input(
                'Cliente',
                sql.NVarChar(100),
                req.query.cliente || null
            )
            .input(
                'Categoria',
                sql.NVarChar(100),
                req.query.categoria || null
            )
            .execute('EstadisticasVentas');

        res.status(200).json(result.recordset);

    } catch (error) {
        console.error('Error obteniendo estadísticas de ventas:', error);

        res.status(500).json({
            message: 'Error retrieving sales statistics'
        });
    }
};


// =====================================================
// ESTADISTICAS 3 - TOP 5 PRODUCTOS POR AÑO
// =====================================================

const getTop5ProductosPorAnio = async (req, res) => {
    try {
        const pool = await poolPromise;

        const anio = parseInt(req.query.anio);

        if (isNaN(anio)) {
            return res.status(400).json({
                message: 'El parámetro anio debe ser un número válido'
            });
        }

        const result = await pool
            .request()
            .input(
                'Anio',
                sql.Int,
                anio
            )
            .execute('Top5ProductosPorAnio');

        res.status(200).json(result.recordset);

    } catch (error) {
        console.error(
            'Error obteniendo Top 5 productos por año:',
            error
        );

        res.status(500).json({
            message: 'Error retrieving top 5 products'
        });
    }
};


// =====================================================
// ESTADISTICAS 4 - TOP 5 CLIENTES CON MÁS FACTURAS
// =====================================================

const getTop5ClientesFacturas = async (req, res) => {
    try {
        const pool = await poolPromise;

        const anioInicio = parseInt(req.query.anioInicio);
        const anioFin = parseInt(req.query.anioFin);

        if (isNaN(anioInicio) || isNaN(anioFin)) {
            return res.status(400).json({
                message: 'anioInicio y anioFin deben ser números válidos'
            });
        }

        const result = await pool
            .request()
            .input(
                'AnioInicio',
                sql.Int,
                anioInicio
            )
            .input(
                'AnioFin',
                sql.Int,
                anioFin
            )
            .execute('Top5ClientesFacturas');

        res.status(200).json(result.recordset);

    } catch (error) {
        console.error(
            'Error obteniendo Top 5 clientes por facturas:',
            error
        );

        res.status(500).json({
            message: 'Error retrieving top 5 customers'
        });
    }
};


// =====================================================
// ESTADISTICAS 5 - TOP 5 PROVEEDORES POR COMPRAS
// =====================================================

const getTop5ProveedoresCompras = async (req, res) => {
    try {
        const pool = await poolPromise;

        const anioInicio = parseInt(req.query.anioInicio);
        const anioFin = parseInt(req.query.anioFin);

        if (isNaN(anioInicio) || isNaN(anioFin)) {
            return res.status(400).json({
                message: 'anioInicio y anioFin deben ser números válidos'
            });
        }

        const result = await pool
            .request()
            .input(
                'AnioInicio',
                sql.Int,
                anioInicio
            )
            .input(
                'AnioFin',
                sql.Int,
                anioFin
            )
            .execute('sp_Top5ProveedoresCompras');

        res.status(200).json(result.recordset);

    } catch (error) {
        console.error(
            'Error obteniendo Top 5 proveedores por compras:',
            error
        );

        res.status(500).json({
            message: 'Error retrieving top 5 suppliers'
        });
    }
};


module.exports = {
    getEstadisticasCompras,
    getEstadisticasVentas,
    getTop5ProductosPorAnio,
    getTop5ClientesFacturas,
    getTop5ProveedoresCompras
};