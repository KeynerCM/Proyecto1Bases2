const express = require('express');
const productRoutes = require('./src/routes/productRoutes');

const app = express();

app.use(express.json());

app.use('/api/products', productRoutes);

module.exports = app;