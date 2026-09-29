const express = require('express');
const productRoutes = require('./src/routes/productRoutes');
const customerRoutes = require('./src/routes/customerRoutes')

const app = express();

app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);

module.exports = app;