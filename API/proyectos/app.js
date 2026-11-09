const express = require('express');
const cors = require('cors');

const productRoutes = require('./src/routes/productRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const salesRoutes = require('./src/routes/salesRoutes');
const proveedoresRoutes = require('./src/routes/proveedoresRoutes');
const estadisticasRoutes = require('./src/routes/estadisticasRoutes');
const catalogRoutes = require('./src/routes/catalogRoutes');

const app = express();


// ==============================
// Middlewares
// ==============================

// PUT y DELETE con JSON hacen una petición previa (preflight OPTIONS);
// cors la responde sola, pero se dejan explícitos los métodos permitidos.
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());


// ==============================
// Rutas
// ==============================

app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/catalogs', catalogRoutes);


// ==============================
// Ruta no encontrada
// ==============================

app.use((req, res) => {
    res.status(404).json({
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});


// ==============================
// Manejo de errores generales
// (por ejemplo, un body con JSON mal formado)
// ==============================

app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Invalid JSON in request body' });
    }

    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
});


module.exports = app;