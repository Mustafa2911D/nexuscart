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
    // Handle error (show toast notification)
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
      <div className="flex gap-4 rounded-2xl border bg-white p-4 hover:shadow-md transition">
        <Link to={`/products/${product._id || product.id}`} className="flex-shrink-0">
          <div className="relative w-24 h-24 overflow-hidden rounded-xl">
            <img
              src={imageError ? 'https://via.placeholder.com/300x300?text=Image+Not+Found' : product.image}
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

        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <Link to={`/products/${product._id || product.id}`}>
              <h3 className="font-semibold hover:text-primary">{product.name}</h3>
            </Link>
            <button
              onClick={handleWishlistToggle}
              className={`p-2 rounded-full hover:bg-gray-100 ${
                isWishlisted ? 'text-red-500' : 'text-gray-400'
              }`}
            >
              <FiHeart className={isWishlisted ? 'fill-current' : ''} />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{product.category}</span>
            <p className="font-semibold">R {product.price?.toFixed?.(2) ?? product.price}</p>
          </div>

          <div className="mt-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={(e) => {
                e.preventDefault()
                handleAdd()
              }}
              className={`rounded-xl px-4 py-2 text-sm font-medium text-white ${
                added ? 'bg-secondary' : 'bg-primary'
              }`}
            >
              {added ? 'Added' : (adding ? 'Adding...' : 'Add to cart')}
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group rounded-2xl border bg-white p-3 shadow-sm transition hover:shadow-elevated relative">
      <div className="relative">
        <Link to={`/products/${product._id || product.id}`} className="block overflow-hidden rounded-xl">
          <div className="relative h-44 w-full overflow-hidden">
            <img
              ref={ref}
              src={imageError ? 'https://via.placeholder.com/300x300?text=Image+Not+Found' : product.image}
              alt={product.name}
              className="w-full h-full object-cover transition group-hover:scale-[1.03]"
              onError={handleImageError}
              onLoad={handleImageLoad}
              loading="lazy"
            />
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-xl"></div>
            )}
          </div>
        </Link>

        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition ${
            isWishlisted ? 'text-red-500' : 'text-gray-600'
          }`}
        >
          <FiHeart className={isWishlisted ? 'fill-current' : ''} />
        </button>
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <Link to={`/products/${product._id || product.id}`}>
            <h3 className="font-semibold line-clamp-1 hover:text-primary">{product.name}</h3>
          </Link>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
        </div>
        <p className="shrink-0 rounded-lg bg-gray-50 px-2 py-1 font-semibold">
          R {product.price?.toFixed?.(2) ?? product.price}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">{product.category}</span>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => handleAdd()}
          className={`relative rounded-xl px-3 py-2 text-sm font-medium text-white ${
            added ? 'bg-secondary' : 'bg-primary'
          } focus-visible:ring-2`}
          aria-live="polite"
        >
          <motion.span
            initial={false}
            animate={{ scale: added ? 1.05 : 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="inline-flex items-center gap-2"
          >
            {added ? <FiCheck /> : null}
            {added ? 'Added' : (adding ? 'Adding...' : 'Add to cart')}
          </motion.span>
        </motion.button>
      </div>

      {/* Size Popup */}
      {sizePopup && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-28 rounded-lg border bg-white p-2 shadow-lg z-50">
          <p className="text-xs font-semibold mb-1">Select size</p>
          {getDefaultSizes().map((s) => (
            <button
              key={s}
              onClick={() => handleAdd(s)}
              className="block w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-100"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

export default ProductCard