const express = require('express');
const productRoutes = require('./src/routes/productRoutes');
const customerRoutes = require('./src/routes/customerRoutes')
const inventoryRoutes = require('./src/routes/inventoryRoutes')

const app = express();
const cors = require('cors');

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inventory', inventoryRoutes);

module.exports = app;