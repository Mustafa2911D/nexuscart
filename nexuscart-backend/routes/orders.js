const express = require('express');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// GET /api/orders - Get user orders from MongoDB
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product');
    
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Get single order from MongoDB
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    }).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// POST /api/orders - Create order (for direct order creation if needed)
router.post('/', async (req, res) => {
  try {
    const { items, total, shippingAddress, paymentMethod } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain items' });
    }
    
    if (!total || total <= 0) {
      return res.status(400).json({ message: 'Valid total amount is required' });
    }
    
    const order = await Order.create({
      user: req.user._id,
      items: items.map(item => ({
        product: item.productId || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size || '',
        image: item.image || ''
      })),
      total,
      shippingAddress: shippingAddress || req.user.address,
      paymentMethod: paymentMethod || 'Credit Card',
      status: 'completed'
    });
    
    await order.populate('items.product');
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// PUT /api/orders/:id - Update order status
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.status = status || order.status;
    await order.save();
    
    res.json(order);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Failed to update order' });
  }
});

// DELETE /api/orders/:id 
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    await Order.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Failed to delete order' });
  }
});

// GET /api/orders/health/check 
router.get('/health/check', async (req, res) => {
  try {
    const orderCount = await Order.countDocuments();
    res.json({ 
      status: 'OK', 
      message: 'Orders API is working',
      orderCount: orderCount,
      database: 'MongoDB'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection issue' 
    });
  }
});

module.exports = router;