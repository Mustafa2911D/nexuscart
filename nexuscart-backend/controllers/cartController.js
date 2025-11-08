const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Get user cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    
    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching cart' 
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, size } = req.body;
    
    if (!productId) {
      return res.status(400).json({ 
        success: false,
        message: 'Product ID is required' 
      });
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    if (!product.inStock) {
      return res.status(400).json({ 
        success: false,
        message: 'Product is out of stock' 
      });
    }
    
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.size === (size || '')
    );
    
    if (existingItemIndex > -1) {
      // Update quantity if item exists
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity,
        size: size || '',
        price: product.price
      });
    }
    
    await cart.save();
    await cart.populate('items.product');
    
    res.json({
      success: true,
      data: cart,
      message: 'Item added to cart successfully'
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while adding item to cart' 
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ 
        success: false,
        message: 'Quantity must be at least 1' 
      });
    }
    
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: 'Cart not found' 
      });
    }
    
    const item = cart.items.id(itemId);
    
    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found in cart' 
      });
    }
    
    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');
    
    res.json({
      success: true,
      data: cart,
      message: 'Cart item updated successfully'
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating cart item' 
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: 'Cart not found' 
      });
    }
    
    const item = cart.items.id(itemId);
    
    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found in cart' 
      });
    }
    
    cart.items.pull(itemId);
    await cart.save();
    await cart.populate('items.product');
    
    res.json({
      success: true,
      data: cart,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while removing item from cart' 
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ 
        success: false,
        message: 'Cart not found' 
      });
    }
    
    cart.items = [];
    await cart.save();
    
    res.json({
      success: true,
      data: cart,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while clearing cart' 
    });
  }
};

// Checkout 
const checkout = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Cart is empty' 
      });
    }
    
    // Calculate total
    const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        image: item.product.image
      })),
      total,
      shippingAddress: shippingAddress || req.user.address,
      paymentMethod: paymentMethod || 'Credit Card',
      status: 'processing'
    });
    
    // Clear the cart
    cart.items = [];
    await cart.save();
    
    // Populate order with product details
    await order.populate('items.product');
    
    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during checkout process' 
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  checkout
};