import CartItem from '../components/Cart/CartItem'
import CartSummary from '../components/Cart/CartSummary'
import { useCart } from '../context/CartContext'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiShoppingBag, FiTrash2, FiArrowRight, FiPlus, FiHeart } from 'react-icons/fi'

export default function ShoppingCartPage() {
  const { items, dispatch } = useCart()
  const [showConfirm, setShowConfirm] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const handleClearCart = () => setShowConfirm(true)
  
  const confirmClear = async () => {
    setIsClearing(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    dispatch({ type: "CLEAR_CART" })
    setShowConfirm(false)
    setIsClearing(false)
  }
  
  const cancelClear = () => setShowConfirm(false)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

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
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Shopping Cart</h1>
              <p className="text-gray-600">
                {items.length === 0 
                  ? "Start adding items to your cart" 
                  : `You have ${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`
                }
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <span>Cart</span>
              <FiArrowRight className="text-xs" />
              <span>Checkout</span>
              <FiArrowRight className="text-xs" />
              <span className="text-gray-400">Confirmation</span>
            </div>
          </div>
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiShoppingBag className="text-4xl text-primary" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                Looks like you haven't added anything to your cart yet. Explore our amazing products and treat yourself to something special!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-xl hover:bg-indigo-600 transition-all font-semibold shadow-lg hover:shadow-xl"
                  >
                    <FiPlus className="text-lg" />
                    Start Shopping
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/products?featured=true"
                    className="inline-flex items-center gap-3 border border-gray-300 px-8 py-4 rounded-xl hover:border-primary hover:bg-primary/5 transition-all font-semibold"
                  >
                    <FiHeart className="text-lg" />
                    Browse Featured
                  </Link>
                </motion.div>
              </div>
              
              {/* Quick Stats */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-6 text-center">
                  {[
                    { label: 'Premium Quality', value: '100%' },
                    { label: 'Free Shipping', value: 'Over R500' },
                    { label: 'Easy Returns', value: '30 Days' }
                  ].map((stat, index) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-lg font-bold text-primary mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-8 lg:grid-cols-3"
          >
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <motion.div
                variants={itemVariants}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Cart Items ({totalItems})
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearCart}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-all font-medium"
                  >
                    <FiTrash2 className="text-lg" />
                    Clear Cart
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, index) => (
                      <motion.div
                        key={`${item._id}-${item.size}`}
                        variants={itemVariants}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ 
                          duration: 0.3,
                          delay: index * 0.1 
                        }}
                      >
                        <CartItem item={item} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Continue Shopping */}
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-primary/5 to-indigo-100 rounded-2xl p-6 border border-primary/20"
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Not done shopping?</h3>
                    <p className="text-gray-600 text-sm">Continue browsing our collection</p>
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-2 bg-white text-primary border border-primary px-6 py-3 rounded-xl hover:bg-primary hover:text-white transition-all font-semibold shadow-sm hover:shadow-md"
                    >
                      <FiPlus className="text-lg" />
                      Continue Shopping
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Cart Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <CartSummary />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={cancelClear}
              />
              
              <motion.div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative z-10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiTrash2 className="text-2xl text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Clear Cart?</h3>
                  <p className="text-gray-600">
                    This will remove all {totalItems} item{totalItems !== 1 ? 's' : ''} from your cart. This action cannot be undone.
                  </p>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={cancelClear}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmClear}
                    disabled={isClearing}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isClearing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <FiTrash2 className="text-lg" />
                        Yes, Clear Cart
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recently Viewed Suggestions */}
        {items.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16"
          >
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">You Might Also Like</h2>
                <Link 
                  to="/products" 
                  className="text-primary hover:text-indigo-600 font-semibold flex items-center gap-2 transition-colors"
                >
                  View All
                  <FiArrowRight className="text-lg" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Placeholder for recommended products */}
                <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl">
                  <FiHeart className="text-3xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">More products coming soon</p>
                </div>
                <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl">
                  <FiHeart className="text-3xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">More products coming soon</p>
                </div>
                <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl">
                  <FiHeart className="text-3xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">More products coming soon</p>
                </div>
                <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl">
                  <FiHeart className="text-3xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">More products coming soon</p>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}