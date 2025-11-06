const validateProduct = (req, res, next) => {
  const { name, price, category } = req.body;
  
  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Name, price and category are required' });
  }
  
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ message: 'Price must be a positive number' });
  }
  
  next();
};

module.exports = { validateProduct };