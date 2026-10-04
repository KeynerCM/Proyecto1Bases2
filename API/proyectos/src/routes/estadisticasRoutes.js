const express = require('express');

const {
    getEstadisticasCompras,
    getEstadisticasVentas,
    getTop5ProductosPorAnio,
    getTop5ClientesFacturas,
    getTop5ProveedoresCompras,
    getMatrizVentasCategorias,
    getSeguimientoComprasClientes
} = require('../controllers/estadisticasController');

const router = express.Router();


// Estadísticas de compras
router.get('/compras', getEstadisticasCompras);


// Estadísticas de ventas
router.get('/ventas', getEstadisticasVentas);


// Top 5 productos por año
router.get('/productos/top5', getTop5ProductosPorAnio);


// Top 5 clientes con más facturas
router.get('/clientes/top5', getTop5ClientesFacturas);


// Top 5 proveedores por compras
router.get('/proveedores/top5', getTop5ProveedoresCompras);


// Matriz de ventas por categoría y año
router.get('/categorias/matriz', getMatrizVentasCategorias);


// Seguimiento de compras a clientes
router.get('/clientes/seguimiento', getSeguimientoComprasClientes);


module.exports = router;