import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../services/api";
import { useCart } from "../context/CartContext";
import { FiHeart, FiShare2, FiStar, FiTruck, FiShield, FiRefreshCw, FiCheck, FiShoppingCart, FiZoomIn, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from "../components/Product/ProductCard";
import { useWishlist } from '../context/WishlistContext';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product?._id || product?.id);
  const { addToCart } = useCart();
  const productImgRef = useRef(null);
  const imageContainerRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [productResponse, productsResponse] = await Promise.all([
          api.getProduct(id),
          api.getProducts({ limit: 8 })
        ]);
        
        setProduct(productResponse.data);
        
        if (productsResponse.data.products) {
          setRelatedProducts(productsResponse.data.products.filter(p => p._id !== id).slice(0, 4));
        }

        if (productResponse.data?.sizes?.length > 0) {
          setSelectedSize(productResponse.data.sizes[0]);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    
    if (isWishlisted) {
      removeFromWishlist(product._id || product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleShareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    }
  };

  const handleAddToCart = () => {
    if (!productImgRef.current) return;

    const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : 
                 product.category?.toLowerCase() === "shoes" ? ["6","7","8","9","10","11","12"] :
                 product.category?.toLowerCase() === "rings" ? ["6","7","8","9","10","11"] :
                 ["S", "M", "L", "XL"];

    if (sizes.length > 1 && !selectedSize) {
      alert("Please select a size");
      return;
    }

    const finalSize = selectedSize || sizes[0];

    // Enhanced flying animation
    const imgClone = productImgRef.current.cloneNode(true);
    const rect = productImgRef.current.getBoundingClientRect();
    imgClone.style.position = "fixed";
    imgClone.style.top = rect.top + "px";
    imgClone.style.left = rect.left + "px";
    imgClone.style.width = rect.width + "px";
    imgClone.style.height = rect.height + "px";
    imgClone.style.zIndex = 9999;
    imgClone.style.borderRadius = "0.5rem";
    imgClone.style.boxShadow = "0 20px 40px rgba(0,0,0,0.3)";
    document.body.appendChild(imgClone);

    const cartIcon = document.querySelector("#navbar-cart-icon");
    if (!cartIcon) return;
    const cartRect = cartIcon.getBoundingClientRect();

    imgClone.animate(
      [
        { 
          transform: "translate(0,0) scale(1) rotate(0deg)", 
          opacity: 1,
          borderRadius: "0.5rem"
        },
        {
          transform: `translate(${cartRect.left - rect.left}px, ${cartRect.top - rect.top}px) scale(0.1) rotate(180deg)`,
          opacity: 0.5,
          borderRadius: "50%"
        },
      ],
      { 
        duration: 800, 
        easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)" 
      }
    ).onfinish = () => imgClone.remove();

    addToCart(product, finalSize, quantity);
    
    // Show success notification
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const productImages = product?.images?.length > 0 ? product.images : 
                       [product?.image, product?.image, product?.image].filter(Boolean);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) return (
    <div className="max-w-6xl mx-auto p-8 text-center">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md mx-auto">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-6 h-6 bg-red-500 rounded-full"></div>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Product</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  if (!product) return (
    <div className="max-w-6xl mx-auto p-8 text-center">
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Product Not Found</h3>
        <p className="text-yellow-600 mb-4">The product you're looking for doesn't exist.</p>
        <Link to="/products" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors">
          Browse Products
        </Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Success Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2"
          >
            <FiCheck className="text-xl" />
            Added to cart successfully!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-gray-600 flex items-center gap-2">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <div className="space-y-4">
          <div 
            ref={imageContainerRef}
            className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-square group cursor-zoom-in"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
          >
            <motion.img
              ref={productImgRef}
              src={imageError ? 'https://via.placeholder.com/600x600?text=Image+Not+Found' : product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: isZoomed ? 1.1 : 1.05 }}
              transition={{ duration: 0.3 }}
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="eager"
            />
            
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
            )}
            
            {/* Image Zoom Indicator */}
            {!isZoomed && (
              <div className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <FiZoomIn size={20} />
              </div>
            )}

            {/* Wishlist and Share Buttons */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWishlistToggle}
                className={`p-3 rounded-full shadow-lg hover:shadow-xl transition-all ${
                  isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:text-red-500'
                }`}
              >
                <FiHeart className={isWishlisted ? 'fill-current' : ''} size={20} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleShareProduct}
                className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl text-gray-600 hover:text-primary transition-all"
              >
                <FiShare2 size={20} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold mb-3 text-gray-900">{product.name}</h1>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar key={star} className="fill-current" size={18} />
                ))}
              </div>
              <span className="text-sm text-gray-600">(42 reviews)</span>
              <span className="text-sm text-green-600 font-medium">In Stock</span>
            </div>
            
            <p className="text-3xl font-bold text-primary mb-4">R {product.price}</p>
            <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
          </motion.div>

          {/* Product Options */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <label className="block mb-3 font-semibold text-gray-900">Select Size</label>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <motion.button
                      key={size}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 rounded-xl border-2 font-medium transition-all ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-white shadow-lg'
                          : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                      }`}
                    >
                      {size}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block mb-3 font-semibold text-gray-900">Quantity</label>
              <div className="flex items-center gap-3 w-fit">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-xl border-2 border-gray-300 flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  -
                </motion.button>
                <span className="w-16 text-center text-xl font-bold">{quantity}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-xl border-2 border-gray-300 flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  +
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              className="flex-1 bg-primary text-white py-4 px-8 rounded-xl hover:bg-indigo-600 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
            >
              <FiShoppingCart size={24} />
              Add to Cart
            </motion.button>
          </motion.div>

          {/* Product Features */}
          <motion.div 
            className="border-t pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FiTruck className="text-primary text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Free Shipping</p>
                  <p className="text-sm text-gray-600">Over R500</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FiShield className="text-primary text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">2-Year Warranty</p>
                  <p className="text-sm text-gray-600">Quality Guaranteed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FiRefreshCw className="text-primary text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Easy Returns</p>
                  <p className="text-sm text-gray-600">30-day policy</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <motion.section 
        className="mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 font-semibold capitalize border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
                </div>
              )}
              
              {activeTab === 'specifications' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Material</span>
                      <span className="font-semibold">Premium Cotton</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Care</span>
                      <span className="font-semibold">Machine Wash</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Origin</span>
                      <span className="font-semibold">South Africa</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">SKU</span>
                      <span className="font-semibold">{product._id}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h4 className="font-semibold mb-2">Excellent quality!</h4>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar key={star} className="fill-current" size={16} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">2 days ago</span>
                    </div>
                    <p className="text-gray-600">The product exceeded my expectations. Great fit and comfortable to wear all day.</p>
                    <p className="text-sm mt-3 font-semibold">- Sarah M.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <motion.section 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">You Might Also Like</h2>
            <Link 
              to="/products" 
              className="text-primary font-semibold hover:text-indigo-600 transition-colors flex items-center gap-2"
            >
              View All
              <FiChevronRight size={20} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={(size) => addToCart(product, size)}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  );
}