import { useEffect, useMemo, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../services/api'
import ProductCard from '../components/Product/ProductCard'
import ProductFilter from '../components/Product/ProductFilter'
import CartDrawer from '../components/Cart/CartDrawer'
import { useCart } from '../context/CartContext'
import { FiGrid, FiList, FiFilter, FiTrendingUp, FiAward, FiTruck, FiX, FiChevronLeft, FiChevronRight, FiSearch, FiSliders } from 'react-icons/fi'

export default function ProductsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [viewMode, setViewMode] = useState('grid') 
  const [showFilters, setShowFilters] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [isFiltered, setIsFiltered] = useState(false)

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  })

  const { addToCart } = useCart()
  const productRefs = useRef({})

  useEffect(() => {
    let mounted = true
    setLoading(true)
    
    const fetchProducts = async () => {
      try {
        const params = {
          search: search || undefined,
          category: category !== 'All' ? category : undefined,
          page: pagination.currentPage,
          limit: viewMode === 'grid' ? 12 : 6,
          sort: sortBy,
          minPrice: priceRange[0],
          maxPrice: priceRange[1]
        }
        
        const response = await api.getProducts(params)
        
        // Handle different response structures
        let productsData = []
        let totalCount = 0
        let totalPages = 1
        let currentPage = 1
        
        if (Array.isArray(response)) {
          productsData = response
          totalCount = response.length
        } else if (response && response.products) {
          productsData = response.products
          totalCount = response.total || response.products.length
          totalPages = response.totalPages || 1
          currentPage = response.currentPage || 1
        } else if (response && Array.isArray(response.data)) {
          productsData = response.data
          totalCount = response.total || response.data.length
        } else if (Array.isArray(response)) {
          productsData = response
          totalCount = response.length
        }
        
        if (mounted) {
          setProducts(productsData)
          setPagination({
            currentPage: currentPage,
            totalPages: totalPages,
            total: totalCount
          })
          setIsFiltered(!!search || category !== 'All' || priceRange[1] < 5000)
        }
      } catch (e) {
        console.error('Failed to fetch products:', e)
        if (mounted) setError('Failed to load products. Please try again later.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await api.getCategories()
        
        // Handle different response structures
        let categoriesData = []
        if (Array.isArray(response)) {
          categoriesData = response
        } else if (response && response.categories) {
          categoriesData = response.categories
        } else if (response && Array.isArray(response.data)) {
          categoriesData = response.data
        }
        
        if (mounted) setCategories(categoriesData)
      } catch (e) {
        console.error('Failed to fetch categories:', e)
      }
    }

    fetchProducts()
    fetchCategories()
    
    return () => { mounted = false }
  }, [search, category, pagination.currentPage, viewMode, sortBy, priceRange])

  const handleAddToCart = (product) => {
    addToCart(product)
    
    const imgRef = productRefs.current[product._id || product.id]
    if (imgRef) {
      const imgClone = imgRef.cloneNode(true)
      const rect = imgRef.getBoundingClientRect()
      imgClone.style.position = 'fixed'
      imgClone.style.top = rect.top + 'px'
      imgClone.style.left = rect.left + 'px'
      imgClone.style.width = rect.width + 'px'
      imgClone.style.height = rect.height + 'px'
      imgClone.style.zIndex = 9999
      imgClone.style.borderRadius = '0.5rem'
      imgClone.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)'
      document.body.appendChild(imgClone)

      const cartIcon = document.querySelector('#navbar-cart-icon')
      if (cartIcon) {
        const cartRect = cartIcon.getBoundingClientRect()
        imgClone.animate(
          [
            { 
              transform: 'translate(0,0) scale(1) rotate(0deg)', 
              opacity: 1,
              borderRadius: '0.5rem'
            },
            {
              transform: `translate(${cartRect.left - rect.left}px, ${cartRect.top - rect.top}px) scale(0.1) rotate(180deg)`,
              opacity: 0.5,
              borderRadius: '50%'
            }
          ],
          { 
            duration: 800, 
            easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' 
          }
        ).onfinish = () => imgClone.remove()
      }
    }
  }

  const sortedProducts = useMemo(() => {
    let sorted = [...products];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }, [products, sortBy]);

  const clearFilters = () => {
    setSearch('')
    setCategory('All')
    setPriceRange([0, 5000])
    setSortBy('newest')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Products Intro Section */}
      <motion.section 
        className="mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-primary bg-clip-text text-transparent">
            Discover Our Collection
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Explore our carefully curated selection of premium products. From trendy fashion to 
            essential accessories, we have everything you need to elevate your style.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: FiTrendingUp, value: `${pagination.total}+`, label: 'Products Available' },
              { icon: FiAward, value: '100%', label: 'Quality Guaranteed' },
              { icon: FiTruck, value: 'Free', label: 'Shipping over R500' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 text-primary rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="text-2xl" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Button */}
          <div className="lg:hidden flex items-center gap-4 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl shadow-sm border hover:shadow-md transition-all"
            >
              <FiSliders className="text-gray-600" />
              <span className="font-medium">Filters</span>
              {isFiltered && (
                <span className="w-2 h-2 bg-primary rounded-full"></span>
              )}
            </motion.button>
            
            {isFiltered && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FiX size={16} />
                Clear filters
              </motion.button>
            )}
          </div>

          {/* Sidebar Filters */}
          <AnimatePresence>
            {(showFilters || window.innerWidth >= 1024) && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:w-1/4"
              >
                <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    <div className="flex items-center gap-2">
                      {isFiltered && (
                        <button
                          onClick={clearFilters}
                          className="text-sm text-primary hover:text-indigo-600 transition-colors"
                        >
                          Clear all
                        </button>
                      )}
                      <button
                        onClick={() => setShowFilters(false)}
                        className="lg:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Search */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Price Range: R0 - R{priceRange[1]}
                    </label>
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="100"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>R0</span>
                        <span>R5000</span>
                      </div>
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Categories</label>
                    <div className="space-y-1">
                      <motion.button
                        whileHover={{ x: 4 }}
                        onClick={() => setCategory('All')}
                        className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          category === 'All' 
                            ? 'bg-primary text-white shadow-lg' 
                            : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                        }`}
                      >
                        All Categories
                      </motion.button>
                      {categories.map((c) => (
                        <motion.button
                          key={c}
                          whileHover={{ x: 4 }}
                          onClick={() => setCategory(c)}
                          className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                            category === c 
                              ? 'bg-primary text-white shadow-lg' 
                              : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'
                          }`}
                        >
                          {c}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Toolbar */}
            <motion.div 
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <FiGrid size={20} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list' 
                        ? 'bg-primary text-white shadow-lg' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <FiList size={20} />
                  </motion.button>
                </div>
                
                <div className="h-6 w-px bg-gray-300"></div>
                
                <span className="text-sm text-gray-600 font-medium">
                  Showing {products.length} of {pagination.total} products
                  {isFiltered && ' • Filtered'}
                </span>
              </div>
              
              <ProductFilter 
                search={search} 
                setSearch={setSearch} 
                category={category} 
                setCategory={setCategory} 
                categories={categories} 
              />
            </motion.div>

            {/* Products Grid */}
            {loading ? (
              <motion.div 
                className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' 
                    : 'grid-cols-1'
                }`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {Array.from({length: viewMode === 'grid' ? 12 : 6}).map((_,i)=>(
                  <motion.div 
                    key={i} 
                    variants={itemVariants}
                    className={`rounded-2xl border border-gray-200 bg-white p-4 animate-pulse ${
                      viewMode === 'list' ? 'flex gap-4' : ''
                    }`}
                  >
                    <div className={`${viewMode === 'list' ? 'w-24 h-24' : 'h-48 w-full'} rounded-xl bg-gray-200`} />
                    <div className={`${viewMode === 'list' ? 'flex-1' : 'mt-4'}`}>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                      <div className="h-9 bg-gray-200 rounded w-28" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : error ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-red-50 border border-red-200 p-6 text-center"
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Products</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            ) : products.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-yellow-50 border border-yellow-200 p-8 text-center"
              >
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiSearch className="text-yellow-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-yellow-800 mb-2">No Products Found</h3>
                <p className="text-yellow-600 mb-4">Try adjusting your filters or search terms.</p>
                <button 
                  onClick={clearFilters}
                  className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <>
                <motion.div 
                  className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' 
                      : 'grid-cols-1'
                  }`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  key={viewMode + sortedProducts.length}
                >
                  {sortedProducts.map((p, index) => (
                    <motion.div
                      key={p._id || p.id}
                      variants={itemVariants}
                      layout
                    >
                      <ProductCard
                        product={p}
                        viewMode={viewMode}
                        ref={el => productRefs.current[p._id || p.id] = el}
                        onAddToCart={() => handleAddToCart(p)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <motion.div 
                    className="mt-12 flex justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPagination(prev => ({ 
                          ...prev, 
                          currentPage: Math.max(1, prev.currentPage - 1) 
                        }))}
                        disabled={pagination.currentPage === 1}
                        className="p-2 rounded-xl border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary transition-colors"
                      >
                        <FiChevronLeft size={20} />
                      </motion.button>
                      
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                        <motion.button
                          key={page}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                          className={`px-4 py-2 rounded-xl font-medium transition-all ${
                            pagination.currentPage === page
                              ? 'bg-primary text-white shadow-lg'
                              : 'bg-white text-gray-700 border border-gray-300 hover:border-primary hover:shadow-md'
                          }`}
                        >
                          {page}
                        </motion.button>
                      ))}
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPagination(prev => ({ 
                          ...prev, 
                          currentPage: Math.min(pagination.totalPages, prev.currentPage + 1) 
                        }))}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="p-2 rounded-xl border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary transition-colors"
                      >
                        <FiChevronRight size={20} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      <CartDrawer />
      
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #4f46e5;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #4f46e5;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  )
}