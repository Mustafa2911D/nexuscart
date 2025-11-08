import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { FiUser, FiMail, FiLogOut, FiCheck, FiUpload, FiHome, FiShoppingBag, FiHeart, FiSettings, FiLock, FiTrash2, FiEdit, FiEye, FiEyeOff, FiPlus, FiMinus, FiCalendar, FiPackage, FiTruck, FiCheckCircle, FiX, FiClock, FiMapPin, FiCreditCard, FiBox } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProfilePage() {
  const { user, setUser } = useUser()
  const { items: wishlistItems, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart, clearCart } = useCart()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [updating, setUpdating] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('profile')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  
  // Password update state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordUpdating, setPasswordUpdating] = useState(false)
  
  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    setLoading(true)
    const fetchData = async () => {
      try {
        const [profileResponse, ordersResponse] = await Promise.all([
          api.getProfile(),
          api.getOrders()
        ]);
        
        const userData = profileResponse.data || profileResponse;
        setUser(userData);
        setAvatarPreview(userData?.avatar || null);
        
        // Fix orders data structure
        let ordersData = [];
        if (Array.isArray(ordersResponse)) {
          ordersData = ordersResponse;
        } else if (ordersResponse && Array.isArray(ordersResponse.data)) {
          ordersData = ordersResponse.data;
        } else if (ordersResponse && ordersResponse.orders) {
          ordersData = ordersResponse.orders;
        }
        setOrders(ordersData);
      } catch (err) {
        console.error('Failed to load user data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load user info');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate, setUser])

  // Fetch orders when orders tab is active
  const fetchOrders = async () => {
    try {
      const ordersData = await api.getOrders();
      let ordersArray = [];
      
      if (Array.isArray(ordersData)) {
        ordersArray = ordersData;
      } else if (ordersData && Array.isArray(ordersData.data)) {
        ordersArray = ordersData.data;
      } else if (ordersData && ordersData.orders) {
        ordersArray = ordersData.orders;
      }
      
      setOrders(ordersArray);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('nexuscart-cart');
    localStorage.removeItem('nexuscart-wishlist');
    setUser(null);
    navigate('/login');
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      handleAvatarUpdate(reader.result);
    };
    reader.readAsDataURL(file);
  }

  const handleAvatarUpdate = async (base64Image) => {
    if (updating) return;
    setUpdating(true);
    setError('');
    
    try {
      const payload = {
        ...user,
        avatar: base64Image
      };
      
      const response = await api.updateProfile(payload);
      const userData = response.data || response;
      setUser(userData);
      setSuccess('Avatar updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update avatar');
    } finally {
      setUpdating(false);
    }
  }

  const handleProfileUpdate = async () => {
    if (updating) return;
    setUpdating(true);
    setError('');
    
    try {
      const payload = {
        name: user.name,
        email: user.email,
        address: user.address,
        avatar: user.avatar
      };
      
      const response = await api.updateProfile(payload);
      const userData = response.data || response;
      setUser(userData);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  }

  const handlePasswordUpdate = async () => {
    if (passwordUpdating) return;
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    
    setPasswordUpdating(true);
    setError('');
    
    try {
      await api.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setSuccess('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update password');
    } finally {
      setPasswordUpdating(false);
    }
  }

  const handleDeleteAccount = async () => {
    if (deleting) return;
    
    if (!deleteConfirm) {
      setError('Please enter your password to confirm account deletion');
      return;
    }
    
    setDeleting(true);
    setError('');
    
    try {
      await api.deleteAccount({ password: deleteConfirm });
      
      // Clear all local data
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      localStorage.removeItem('nexuscart-cart');
      localStorage.removeItem('nexuscart-wishlist');
      
      setUser(null);
      navigate('/register');
      
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteConfirm('');
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Fix image URLs
  const getImageUrl = (image) => {
    if (!image) return '/images/placeholder-product.jpg';
    if (image.startsWith('http')) return image;
    if (image.startsWith('/')) return image;
    return `/${image}`;
  };

  // Fix date display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Calculate estimated dates
  const getEstimatedDates = (orderDate) => {
    const order = new Date(orderDate);
    const shipDate = new Date(order);
    shipDate.setDate(shipDate.getDate() + 1); // Ships next day
    
    const deliveryDate = new Date(order);
    deliveryDate.setDate(deliveryDate.getDate() + 5); // Delivers in 5 days
    
    return {
      ship: formatDate(shipDate),
      delivery: formatDate(deliveryDate)
    };
  };

  // Calculate total spent
  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

  // Handle view order details
  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  // Generate tracking number
  const generateTrackingNumber = (orderId) => {
    return `NX${orderId.slice(-8).toUpperCase()}ZA`;
  };

  // Get order status timeline
  const getOrderTimeline = (order) => {
    const orderDate = new Date(order.createdAt);
    const estimatedDates = getEstimatedDates(order.createdAt);
    
    return [
      {
        status: 'Order Placed',
        description: 'Your order has been received',
        date: formatDateTime(order.createdAt),
        completed: true,
        active: true
      },
      {
        status: 'Processing',
        description: 'We\'re preparing your order for shipment',
        date: 'In progress',
        completed: order.status !== 'pending',
        active: order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'
      },
      {
        status: 'Shipped',
        description: 'Your order is on the way',
        date: estimatedDates.ship,
        completed: order.status === 'shipped' || order.status === 'delivered',
        active: order.status === 'shipped'
      },
      {
        status: 'Delivered',
        description: 'Your order has been delivered',
        date: estimatedDates.delivery,
        completed: order.status === 'delivered',
        active: order.status === 'delivered'
      }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User not found</h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  const tabContentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const sidebarItems = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'orders', label: 'Orders', icon: FiShoppingBag },
    { id: 'wishlist', label: 'Wishlist', icon: FiHeart },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Notifications */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3"
            >
              <FiCheckCircle className="text-green-600 text-xl" />
              <span className="text-green-800 font-medium">{success}</span>
            </motion.div>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-800 font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.div 
            className="lg:w-1/4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              {/* User Profile Header */}
              <div className="text-center mb-8">
                <div className="relative inline-block group">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center overflow-hidden mx-auto mb-4 shadow-lg">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar" 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <FiUser className="text-4xl text-white" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                      <FiEdit className="text-white text-xl" />
                    </div>
                  </div>
                  <label className="absolute bottom-2 right-2 bg-white text-primary p-3 rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all hover:scale-110">
                    <FiUpload className="text-lg" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
                <p className="text-gray-600 mb-1">{user.email}</p>
                {user.number && (
                  <p className="text-gray-500 text-sm">{user.number}</p>
                )}
                <div className="mt-3 inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  <FiCheck className="text-xs" />
                  Verified Account
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all ${
                      activeTab === item.id
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-md'
                    }`}
                  >
                    <item.icon className={`text-xl ${activeTab === item.id ? 'text-white' : 'text-gray-400'}`} />
                    <span className="font-medium">{item.label}</span>
                    {item.id === 'wishlist' && wishlistItems.length > 0 && (
                      <span className={`ml-auto px-2 py-1 rounded-full text-xs ${
                        activeTab === item.id 
                          ? 'bg-white text-primary' 
                          : 'bg-primary text-white'
                      }`}>
                        {wishlistItems.length}
                      </span>
                    )}
                  </motion.button>
                ))}
                
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-left text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
                >
                  <FiLogOut className="text-xl" />
                  <span className="font-medium">Logout</span>
                </motion.button>
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <AnimatePresence mode="wait">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                >
                  {/* ... (profile tab content remains the same) ... */}
                </motion.div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Order History</h2>
                    <div className="text-sm text-gray-600">
                      {orders.length} order{orders.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-16">
                      <FiShoppingBag className="text-6xl text-gray-300 mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold text-gray-600 mb-4">No orders yet</h3>
                      <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Start shopping and your order history will appear here.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/products')}
                        className="bg-primary text-white px-8 py-4 rounded-xl hover:bg-indigo-600 transition-all shadow-lg hover:shadow-xl"
                      >
                        Start Shopping
                      </motion.button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order, index) => (
                        <motion.div
                          key={order._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
                            <div>
                              <p className="font-bold text-lg text-gray-900">
                                Order #{order._id?.slice(-8).toUpperCase()}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                <FiCalendar className="text-gray-400" />
                                {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'shipped' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                              </span>
                              <span className="text-xl font-bold text-primary">
                                R {order.total?.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {order.items?.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                <img 
                                  src={getImageUrl(item.image || item.product?.image)} 
                                  alt={item.name || item.product?.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.src = '/images/placeholder-product.jpg';
                                  }}
                                />
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900 text-sm">{item.name || item.product?.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {item.quantity} × R{item.price || item.product?.price}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {order.items?.length > 2 && (
                              <div className="flex items-center justify-center p-3 bg-gray-50 rounded-xl">
                                <span className="text-sm text-gray-600 font-medium">
                                  +{order.items.length - 2} more items
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <FiTruck className="text-gray-400" />
                              {order.trackingNumber ? (
                                <span>Tracking: {order.trackingNumber}</span>
                              ) : (
                                <span>Tracking: {generateTrackingNumber(order._id)}</span>
                              )}
                            </div>
                            <button 
                              onClick={() => handleViewOrderDetails(order)}
                              className="text-primary hover:text-indigo-600 font-semibold text-sm flex items-center gap-2 group"
                            >
                              View Details
                              <FiPlus className="group-hover:rotate-45 transition-transform" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <motion.div
                  key="wishlist"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                >
                  {/* ... (wishlist tab content remains the same) ... */}
                </motion.div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
                >
                  {/* ... (settings tab content remains the same) ... */}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderDetails && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowOrderDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order Details
                  </h2>
                  <p className="text-gray-600">
                    #{selectedOrder._id?.slice(-8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="text-xl text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Order Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiCalendar className="text-blue-600 text-lg" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Order Date</p>
                        <p className="font-semibold text-gray-900">
                          {formatDateTime(selectedOrder.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FiPackage className="text-green-600 text-lg" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-semibold text-gray-900 capitalize">
                          {selectedOrder.status}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FiTruck className="text-purple-600 text-lg" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tracking Number</p>
                        <p className="font-semibold text-gray-900">
                          {selectedOrder.trackingNumber || generateTrackingNumber(selectedOrder._id)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <FiCreditCard className="text-orange-600 text-lg" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="font-semibold text-gray-900">
                          {selectedOrder.paymentMethod || 'Credit Card'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FiMapPin className="text-gray-500" />
                    Shipping Address
                  </h3>
                  <p className="text-gray-700">
                    {selectedOrder.shippingAddress || 'No shipping address provided'}
                  </p>
                </div>

                {/* Order Timeline */}
                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Order Status Timeline</h3>
                  <div className="space-y-4">
                    {getOrderTimeline(selectedOrder).map((step, index) => (
                      <div key={step.status} className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          step.completed 
                            ? 'bg-green-500 text-white' 
                            : step.active
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          {step.completed ? <FiCheckCircle size={16} /> : index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${
                              step.completed || step.active ? 'text-gray-900' : 'text-gray-400'
                            }`}>
                              {step.status}
                            </span>
                            <span className="text-sm text-gray-500">{step.date}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Order Items ({selectedOrder.items?.length || 0})
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <img 
                          src={getImageUrl(item.image || item.product?.image)} 
                          alt={item.name || item.product?.name}
                          className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = '/images/placeholder-product.jpg';
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.name || item.product?.name}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} • Size: {item.size || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            R {((item.price || item.product?.price) * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            R {item.price || item.product?.price} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">
                      R {selectedOrder.total?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-2xl p-6 flex gap-3">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  Close
                </button>
                <button className="flex-1 bg-primary text-white py-3 px-6 rounded-xl hover:bg-indigo-600 transition-colors font-semibold">
                  Download Invoice
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}