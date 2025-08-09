const express = require('express');
const router = express.Router();

const orders = new Map();
let orderCounter = 1000;

router.post('/', (req, res) => {
  const { items, restaurant, customerInfo } = req.body;
  
  const orderId = `ORD-${orderCounter++}`;
  const order = {
    id: orderId,
    items,
    restaurant,
    customerInfo,
    status: 'placed',
    orderTime: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 25 * 60000).toISOString(),
    total: calculateTotal(items)
  };
  
  orders.set(orderId, order);
  
  setTimeout(() => updateOrderStatus(orderId, 'preparing'), 2000);
  setTimeout(() => updateOrderStatus(orderId, 'out_for_delivery'), 10000);
  setTimeout(() => updateOrderStatus(orderId, 'delivered'), 20000);
  
  res.json(order);
});

router.get('/:orderId', (req, res) => {
  const order = orders.get(req.params.orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

router.get('/', (req, res) => {
  res.json(Array.from(orders.values()));
});

function calculateTotal(items) {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function updateOrderStatus(orderId, status) {
  const order = orders.get(orderId);
  if (order) {
    order.status = status;
    console.log(`📦 Order ${orderId} status updated to: ${status}`);
  }
}

module.exports = router;