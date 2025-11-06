const express = require('express');
const router = express.Router();

let orders = [];
let orderIdCounter = 1;

// POST /api/orders 
router.post('/', (req, res) => {
  try {
    const { items, total, shippingAddress, paymentMethod } = req.body;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain items' });
    }
    
    if (!total || total <= 0) {
      return res.status(400).json({ message: 'Valid total amount is required' });
    }
    
    // Create new order
    const newOrder = {
      _id: `order_${orderIdCounter++}`,
      items: items.map(item => ({
        productId: item.id || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size || '',
        image: item.image || ''
      })),
      total: total,
      shippingAddress: shippingAddress || 'Not provided',
      paymentMethod: paymentMethod || 'Not specified',
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store the order 
    orders.push(newOrder);
    
    console.log('New order created:', newOrder._id);
    
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// GET /api/orders 
router.get('/', (req, res) => {
  try {
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id 
router.get('/:id', (req, res) => {
  try {
    const orderId = req.params.id;
    const order = orders.find(o => o._id === orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// PUT /api/orders/:id 
router.put('/:id', (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    const order = orders.find(o => o._id === orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update order status
    order.status = status || order.status;
    order.updatedAt = new Date();
    
    res.json(order);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Failed to update order' });
  }
});

// DELETE /api/orders/:id 
router.delete('/:id', (req, res) => {
  try {
    const orderId = req.params.id;
    const orderIndex = orders.findIndex(o => o._id === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Remove order
    orders.splice(orderIndex, 1);
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Failed to delete order' });
  }
});

// GET /api/orders/health/check 
router.get('/health/check', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Orders API is working',
    orderCount: orders.length
  });
});

module.exports = router;