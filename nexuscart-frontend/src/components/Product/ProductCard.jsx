import { useState, forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { FiCheck, FiHeart } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useWishlist } from '../../context/WishlistContext'

const ProductCard = forwardRef(({ product, onAddToCart, viewMode = 'grid' }, ref) => {
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [sizePopup, setSizePopup] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()

  const isWishlisted = isInWishlist(product._id || product.id)

  // Function to handle image paths from backend
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop';
    }
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a relative path starting with /images/, serve from public folder
    // Vercel will automatically serve these from the public/images folder
    if (imagePath.startsWith('/images/')) {
      return imagePath;
    }
    
    // Map backend image paths to your actual images
    const imageMap = {
      '/images/shirt.jpeg': '/images/shirt.jpeg',
      '/images/whitetee.jpeg': '/images/whitetee.jpeg',
      '/images/runningshoes.jpeg': '/images/runningshoes.jpeg',
      '/images/hoodie.jpg': '/images/hoodie.jpg',
      '/images/casualpants.jpg': '/images/casualpants.jpg',
      '/images/leatherjacket.jpeg': '/images/leatherjacket.jpeg',
      '/images/watch.jpg': '/images/watch.jpg',
      '/images/backpack.jpeg': '/images/backpack.jpeg',
      '/images/sunglasses.jpg': '/images/sunglasses.jpg',
      '/images/denimjeans.jpg': '/images/denimjeans.jpg',
      '/images/beanie.jpg': '/images/beanie.jpg',
      '/images/phonecase.jpeg': '/images/phonecase.jpeg'
    };
    
    return imageMap[imagePath] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop';
  };

  const getDefaultSizes = () => {
    if (product.sizes && product.sizes.length > 0) return product.sizes
    const cat = product.category?.toLowerCase()
    if (cat === 'shoes') return ["6","7","8","9","10","11","12"]
    if (cat === 'rings') return ["6","7","8","9","10","11"]
    return ["S","M","L","XL"]
  }

  const handleAdd = async (size = null) => {
    if (adding) return;
    
    const sizes = getDefaultSizes();
    const chosenSize = size || (sizes.length === 1 ? sizes[0] : null);

    if (sizes.length > 1 && !chosenSize) {
      setSizePopup(true);
      return;
    }

    setAdding(true);
    try {
      await onAddToCart(product, chosenSize, 1);
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
      setSizePopup(false);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isWishlisted) {
      removeFromWishlist(product._id || product.id)
    } else {
      addToWishlist(product)
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  if (viewMode === 'list') {
    return (
      <div className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 hover:shadow-md transition-all duration-300">
        {/* Product Image */}
        <Link to={`/products/${product._id || product.id}`} className="flex-shrink-0">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 overflow-hidden rounded-xl">
            <img
              src={getImageUrl(product.image)}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl"></div>
            )}
          </div>
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2 gap-2">
            <Link to={`/products/${product._id || product.id}`} className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 hover:text-primary truncate text-sm sm:text-base">
                {product.name}
              </h3>
            </Link>
            <button
              onClick={handleWishlistToggle}
              className={`p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 ${
                isWishlisted ? 'text-red-500' : 'text-gray-400'
              }`}
            >
              <FiHeart className={isWishlisted ? 'fill-current' : ''} size={18} />
            </button>
          </div>
          
          <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {product.category}
            </span>
            <p className="font-semibold text-gray-900 text-sm sm:text-base">
              R {product.price?.toFixed?.(2) ?? product.price}
            </p>
          </div>

          {/* Add to Cart Button */}
          <div className="flex justify-end">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault()
                handleAdd()
              }}
              disabled={adding || added}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-medium text-white transition-all min-w-[100px] ${
                added 
                  ? 'bg-green-600' 
                  : adding 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-primary hover:bg-indigo-600'
              }`}
            >
              {added ? (
                <span className="flex items-center gap-1">
                  <FiCheck size={14} />
                  Added
                </span>
              ) : adding ? (
                'Adding...'
              ) : (
                'Add to Cart'
              )}
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  // Grid View - Fixed version
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col h-full">
      {/* Product Image */}
      <div className="relative mb-3 flex-shrink-0">
        <Link to={`/products/${product._id || product.id}`} className="block overflow-hidden rounded-xl">
          <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-gray-100 rounded-xl">
            <img
              ref={ref}
              src={getImageUrl(product.image)}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl"></div>
            )}
          </div>
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all ${
            isWishlisted ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
          }`}
        >
          <FiHeart 
            className={isWishlisted ? 'fill-current' : ''} 
            size={18} 
          />
        </button>
      </div>

      {/* Product Info - Flex column to push button to bottom */}
      <div className="flex flex-col flex-1 space-y-3">
        {/* Name and Price - Fixed overlapping with proper spacing */}
        <div className="flex flex-col gap-1 min-h-[3rem]">
          <Link to={`/products/${product._id || product.id}`} className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 hover:text-primary line-clamp-2 text-sm sm:text-base leading-tight mb-1">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center justify-between">
            <p className="font-bold text-primary text-base sm:text-lg">
              R {product.price?.toFixed?.(2) ?? product.price}
            </p>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {product.category}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Add to Cart Button - Always at bottom */}
        <div className="pt-2 mt-auto">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAdd()}
            disabled={adding || added}
            className={`w-full rounded-xl px-3 py-3 text-sm font-medium text-white transition-all ${
              added 
                ? 'bg-green-600' 
                : adding 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-indigo-600'
            }`}
          >
            {added ? (
              <span className="flex items-center gap-1 justify-center">
                <FiCheck size={16} />
                Added
              </span>
            ) : adding ? (
              'Adding...'
            ) : (
              'Add to Cart'
            )}
          </motion.button>
        </div>
      </div>

      {/* Size Popup */}
      {sizePopup && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-32 rounded-lg border border-gray-200 bg-white p-2 shadow-lg z-50">
          <p className="text-xs font-semibold mb-2 text-gray-700 text-center">Select size</p>
          <div className="space-y-1">
            {getDefaultSizes().map((s) => (
              <button
                key={s}
                onClick={() => handleAdd(s)}
                className="block w-full text-center px-2 py-1.5 text-xs rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

ProductCard.displayName = 'ProductCard'

export default ProductCard