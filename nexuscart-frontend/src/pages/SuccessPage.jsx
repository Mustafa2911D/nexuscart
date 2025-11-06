import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheckCircle, FiShoppingBag, FiPackage, FiMail, FiHome, FiClock, FiArrowRight, FiDownload, FiShare2 } from 'react-icons/fi'
import { useEffect, useState } from 'react'

export default function SuccessPage() {
  const location = useLocation();
  const order = location.state?.order;
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleShareOrder = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Order Confirmation',
          text: `I just placed an order on NexusCart! Order #${order?._id?.slice(-8).toUpperCase()}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Order link copied to clipboard!')
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-indigo-50 py-8 px-4">
      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{ 
                  opacity: 1,
                  y: -50,
                  x: Math.random() * window.innerWidth,
                  rotate: 0
                }}
                animate={{ 
                  opacity: 0,
                  y: window.innerHeight,
                  rotate: 360,
                  x: Math.random() * window.innerWidth - 100
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  ease: "easeOut"
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                }}
              >
                {['🎉', '🎊', '✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 6)]}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <motion.div
        className="max-w-4xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Success Header */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <FiCheckCircle className="text-5xl text-green-600" />
          </motion.div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Thank you for your purchase! Your order has been successfully placed and is being processed.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Order Summary */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleShareOrder}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Share order"
                  >
                    <FiShare2 size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Download receipt">
                    <FiDownload size={20} />
                  </button>
                </div>
              </div>

              {order && (
                <div className="space-y-6">
                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FiPackage className="text-blue-600 text-lg" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Order Number</p>
                          <p className="font-semibold text-gray-900">
                            #{order._id?.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <FiClock className="text-green-600 text-lg" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Order Date</p>
                          <p className="font-semibold text-gray-900">
                            {new Date().toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FiShoppingBag className="text-purple-600 text-lg" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="font-bold text-2xl text-primary">
                            R {order.total?.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <FiMail className="text-orange-600 text-lg" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Confirmation</p>
                          <p className="font-semibold text-gray-900">Email sent</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Order Items ({order.items?.length})
                    </h3>
                    <div className="space-y-3">
                      {order.items?.slice(0, 3).map((item, index) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity} • R {item.price}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              R {(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="text-center py-3 text-gray-600">
                          +{order.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-primary/5 to-indigo-100 rounded-2xl p-8 border border-primary/20"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">What's Next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: FiMail,
                    title: "Confirmation Email",
                    description: "Check your inbox for order details and tracking information",
                    color: "blue"
                  },
                  {
                    icon: FiPackage,
                    title: "Order Processing",
                    description: "Your order is being prepared for shipment",
                    color: "green"
                  },
                  {
                    icon: FiHome,
                    title: "Delivery",
                    description: "Expected delivery in 3-5 business days",
                    color: "purple"
                  }
                ].map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className={`w-16 h-16 bg-${step.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <step.icon className={`text-${step.color}-600 text-2xl`} />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Action Sidebar */}
          <motion.div
            variants={itemVariants}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/products"
                    className="w-full bg-primary text-white py-4 px-6 rounded-xl hover:bg-indigo-600 transition-all font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                  >
                    <FiShoppingBag className="text-lg" />
                    Continue Shopping
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/profile?tab=orders"
                    className="w-full border border-primary text-primary py-4 px-6 rounded-xl hover:bg-primary hover:text-white transition-all font-semibold flex items-center justify-center gap-3"
                  >
                    <FiPackage className="text-lg" />
                    View All Orders
                  </Link>
                </motion.div>
              </div>

              {/* Support Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Need Help?</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">Email: support@nexuscart.com</p>
                  <p className="text-gray-600">Phone: +27 123 456 789</p>
                  <p className="text-gray-600">Hours: 24/7 Support</p>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Order Status</h3>
              <div className="space-y-4">
                {[
                  { status: 'Order Placed', active: true, completed: true },
                  { status: 'Processing', active: true, completed: true },
                  { status: 'Shipped', active: false, completed: false },
                  { status: 'Delivered', active: false, completed: false }
                ].map((step, index) => (
                  <div key={step.status} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? 'bg-green-500 text-white' 
                        : step.active
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {step.completed ? <FiCheckCircle size={16} /> : index + 1}
                    </div>
                    <span className={`font-medium ${
                      step.completed || step.active ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Featured Products Suggestion */}
        <motion.section
          variants={itemVariants}
          className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">You Might Also Like</h2>
              <p className="text-gray-600">Discover more amazing products</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/products"
                className="text-primary hover:text-indigo-600 font-semibold flex items-center gap-2 transition-colors"
              >
                Browse All
                <FiArrowRight className="text-lg" />
              </Link>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <motion.div
                key={item}
                whileHover={{ y: -5 }}
                className="text-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <FiShoppingBag className="text-3xl text-gray-400 group-hover:text-primary mx-auto mb-3 transition-colors" />
                <p className="text-gray-500 group-hover:text-gray-700 text-sm transition-colors">
                  Recommended product {item}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  )
}