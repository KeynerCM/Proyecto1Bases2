require('dotenv').config();

const app = require('./app');
require('./src/config/database');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`);
});