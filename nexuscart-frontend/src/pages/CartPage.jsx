import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowRight, FiHeart, FiShoppingBag, FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";

const CartPage = () => {
  const { cart, removeFromCart, clearCart, updateQuantity } = useContext(CartContext);
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [processingCheckout, setProcessingCheckout] = useState(false);

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setProcessingCheckout(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setShowCheckoutSuccess(true);
    setProcessingCheckout(false);
    
    // Clear cart after showing success
    setTimeout(() => {
      clearCart();
      setShowCheckoutSuccess(false);
    }, 3000);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 }
  };

  if (showCheckoutSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-indigo-50 px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FiCheck className="text-4xl text-green-600" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase! Your order has been successfully placed.
          </p>
          <div className="flex gap-3">
            <Link
              to="/products"
              className="flex-1 bg-primary text-white py-3 px-6 rounded-xl hover:bg-indigo-600 transition-colors font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
              <p className="text-gray-600">
                {cart.length === 0 
                  ? "Your cart is waiting to be filled" 
                  : `You have ${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`
                }
              </p>
            </div>
            {cart.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 px-4 py-2 rounded-xl hover:bg-red-50 transition-all"
              >
                <FiTrash2 />
                Clear Cart
              </motion.button>
            )}
          </div>
        </motion.div>

        {cart.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100">
              <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiShoppingCart className="text-4xl text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Discover amazing products and add them to your cart. Start shopping to fill it with items you love!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/products"
                  className="bg-primary text-white px-8 py-4 rounded-xl hover:bg-indigo-600 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <FiShoppingBag />
                  Start Shopping
                </Link>
                <Link
                  to="/products?featured=true"
                  className="border border-gray-300 px-8 py-4 rounded-xl hover:border-primary hover:bg-primary/5 transition-all font-semibold flex items-center justify-center gap-3"
                >
                  <FiHeart />
                  Browse Featured
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid lg:grid-cols-3 gap-8"
          >
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {cart.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${index}`}
                    variants={itemVariants}
                    layout
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image || "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1352&q=80"}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-xl"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.name}</h3>
                        <p className="text-primary font-bold text-xl mb-3">R {item.price}</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-sm text-gray-600 font-medium">Quantity:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                            >
                              <FiMinus size={14} />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors"
                            >
                              <FiPlus size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Item total:</span>
                          <span className="font-semibold text-gray-900">
                            R {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeFromCart(item.id)}
                        className="flex-shrink-0 w-10 h-10 rounded-xl border border-red-200 text-red-600 flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-colors self-start"
                        title="Remove item"
                      >
                        <FiTrash2 size={18} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Continue Shopping */}
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-primary/5 to-indigo-100 rounded-2xl p-6 border border-primary/20"
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Continue Shopping</h3>
                    <p className="text-gray-600 text-sm">Discover more amazing products</p>
                  </div>
                  <Link
                    to="/products"
                    className="bg-white text-primary border border-primary px-6 py-3 rounded-xl hover:bg-primary hover:text-white transition-all font-semibold shadow-sm hover:shadow-md flex items-center gap-2"
                  >
                    <FiShoppingBag />
                    Browse Products
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({totalItems})</span>
                    <span>R {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>R {(totalPrice * 0.15).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Total</span>
                      <span>R {(totalPrice * 1.15).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  disabled={processingCheckout}
                  className="w-full bg-primary text-white py-4 px-6 rounded-xl hover:bg-indigo-600 transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {processingCheckout ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiArrowRight />
                      Proceed to Checkout
                    </>
                  )}
                </motion.button>

                {/* Security Badge */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <FiCheck className="text-green-500" />
                    Secure checkout · 256-bit SSL encryption
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Clear Cart Confirmation Modal */}
        <AnimatePresence>
          {showClearConfirm && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowClearConfirm(false)}
              />
              
              <motion.div
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative z-10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
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
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      clearCart();
                      setShowClearConfirm(false);
                    }}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium"
                  >
                    Clear Cart
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CartPage;