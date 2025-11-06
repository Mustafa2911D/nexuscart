const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Create new order
const createOrder = async (req, res) => {
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
};

// Get user orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product');
    
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Get single order
const getOrder = async (req, res) => {
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
};

module.exports = {
  createOrder,
  getOrders,
  getOrder
};