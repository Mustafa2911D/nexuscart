const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

// Products
const sampleProducts = [
  {
    name: 'Classic White T-Shirt',
    description: 'A comfortable and versatile white t-shirt made from 100% cotton. Perfect for everyday wear.',
    price: 249.99,
    category: 'Clothing',
    image: '/images/whitetee.jpeg',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight running shoes with excellent cushioning and support for your active lifestyle.',
    price: 899.99,
    category: 'Footwear',
    image: '/images/runningshoes.jpeg',
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    inStock: true
  },
  {
    name: 'Hooded Sweatshirt',
    description: 'A warm and comfortable hoodie perfect for cooler days. Features a front pocket and adjustable drawstrings.',
    price: 499.99,
    category: 'Clothing',
    image: '/images/hoodie.jpg',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true
  },
  {
    name: 'Casual Pants',
    description: 'Comfortable and stylish pants suitable for both casual and semi-formal occasions.',
    price: 599.99,
    category: 'Clothing',
    image: '/images/casualpants.jpg',
    sizes: ['30', '32', '34', '36', '38'],
    inStock: true
  },
  {
    name: 'Leather Jacket',
    description: 'Premium quality leather jacket with a classic design that never goes out of style.',
    price: 1299.99,
    category: 'Clothing',
    image: '/images/leatherjacket.jpeg',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true
  },
  {
    name: 'Sports Watch',
    description: 'Water-resistant sports watch with multiple features including heart rate monitor and GPS.',
    price: 799.99,
    category: 'Accessories',
    image: '/images/watch.jpg',
    sizes: ['One Size'],
    inStock: true
  },
  {
    name: 'Backpack',
    description: 'Durable backpack with multiple compartments, perfect for travel or daily use.',
    price: 399.99,
    category: 'Accessories',
    image: '/images/backpack.jpeg',
    sizes: ['One Size'],
    inStock: true
  },
  {
    name: 'Sunglasses',
    description: 'Stylish sunglasses with UV protection and polarized lenses.',
    price: 199.99,
    category: 'Accessories',
    image: '/images/sunglasses.jpg',
    inStock: true
  },
  {
    name: 'Formal Shirt',
    description: 'Elegant formal shirt made from high-quality cotton, perfect for business occasions.',
    price: 349.99,
    category: 'Clothing',
    image: '/images/shirt.jpeg',
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true
  },
  {
    name: 'Denim Jeans',
    description: 'Classic denim jeans with a comfortable fit and modern style.',
    price: 449.99,
    category: 'Clothing',
    image:'/images/denimjeans.jpg',
    sizes: ['30', '32', '34', '36', '38'],
    inStock: true
  },
  {
    name: 'Winter Beanie',
    description: 'Warm and comfortable beanie for cold weather, made from premium wool.',
    price: 149.99,
    category: 'Accessories',
    image: '/images/beanie.jpg',
    sizes: ['One Size'],
    inStock: true
  },
  {
    name: 'Smartphone Case',
    description: 'Protective case for smartphones with a sleek design and drop protection.',
    price: 99.99,
    category: 'Accessories',
    image: '/images/phonecase.jpeg',
    sizes: ['Iphone 11', 'Iphone 12', 'Iphone 13', 'Iphone 14', 'Iphone 15', 'Iphone 16'],
    inStock: true
  }
];

// GET /api/products 
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const search = req.query.search || '';
    const category = req.query.category || '';
    
    let query = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    const productsCount = await Product.countDocuments(query);
    let products;
    
    if (productsCount === 0) {
      await Product.insertMany(sampleProducts);
      products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } else {
      products = await Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }
    
    const total = await Product.countDocuments(query);
    
    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
});

// GET /api/products/categories 
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
});

// GET /api/products/:id 
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
});

module.exports = router;