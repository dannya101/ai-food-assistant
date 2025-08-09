const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const restaurantRoutes = require('./routes/restaurants');
const orderRoutes = require('./routes/orders');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🍕 AI Food Assistant running on http://localhost:${PORT}`);
  console.log(`📊 Features: NVIDIA AI + Web Scraping + Order Simulation`);
});