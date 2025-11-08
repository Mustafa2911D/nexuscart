import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { FiUser, FiMail, FiLogOut, FiCheck, FiUpload, FiHome, FiShoppingBag, FiHeart, FiSettings, FiLock, FiTrash2, FiEdit, FiEye, FiEyeOff, FiPlus, FiMinus, FiCalendar, FiPackage, FiTruck, FiCheckCircle } from 'react-icons/fi'
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
        
        const userData = profileResponse.data;
        setUser(userData);
        setAvatarPreview(userData?.avatar || null);
        setOrders(Array.isArray(ordersResponse.data) ? ordersResponse.data : []);
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
      setOrders(Array.isArray(ordersData) ? ordersData : []);
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
      
      const { data } = await api.updateProfile(payload);
      setUser(data);
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
      
      const { data } = await api.updateProfile(payload);
      setUser(data);
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
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Profile Information</h2>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name</label>
                      <input
                        type="text"
                        value={user.name || ''}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
                      <input
                        type="email"
                        value={user.email || ''}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number</label>
                      <input
                        type="tel"
                        value={user.number || ''}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\D/g, '');
                          setUser({ ...user, number: cleaned });
                        }}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <label className="flex text-sm font-semibold text-gray-700 mb-3 items-center gap-2">
                        <FiHome className="text-gray-500" /> 
                        Shipping Address
                      </label>
                      <textarea
                        value={user.address || ''}
                        onChange={(e) => setUser({ ...user, address: e.target.value })}
                        rows={4}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                        placeholder="Enter your complete shipping address"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleProfileUpdate}
                      disabled={updating}
                      className="bg-primary text-white px-8 py-4 rounded-xl hover:bg-indigo-600 transition-all flex items-center gap-3 disabled:opacity-50 shadow-lg hover:shadow-xl"
                    >
                      {updating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <FiCheck className="text-xl" />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                    
                    <button
                      onClick={() => setUser({ ...user, name: '', email: '', number: '', address: '' })}
                      className="text-gray-600 hover:text-gray-800 px-4 py-2 transition-colors"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Account Statistics */}
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Account Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { label: 'Total Orders', value: orders.length, icon: FiPackage, color: 'blue' },
                        { label: 'Wishlist Items', value: wishlistItems.length, icon: FiHeart, color: 'pink' },
                        { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString(), icon: FiCalendar, color: 'green' },
                        { label: 'Total Spent', value: `R${orders.reduce((sum, order) => sum + (order.total || 0), 0).toFixed(2)}`, icon: FiShoppingBag, color: 'purple' }
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                        >
                          <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            <stat.icon className={`text-${stat.color}-600 text-xl`} />
                          </div>
                          <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                          <div className="text-sm text-gray-600">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
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
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
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
                            {order.items.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {item.quantity} × R{item.price}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 2 && (
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
                                <span>Tracking information will be available soon</span>
                              )}
                            </div>
                            <button className="text-primary hover:text-indigo-600 font-semibold text-sm flex items-center gap-2 group">
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
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">
                      Your Wishlist
                      <span className="text-primary ml-3">({wishlistItems.length})</span>
                    </h2>
                    {wishlistItems.length > 0 && (
                      <button
                        onClick={clearWishlist}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-2"
                      >
                        <FiTrash2 />
                        Clear All
                      </button>
                    )}
                  </div>
                  
                  {wishlistItems.length === 0 ? (
                    <div className="text-center py-16">
                      <FiHeart className="text-6xl text-gray-300 mx-auto mb-6" />
                      <h3 className="text-2xl font-semibold text-gray-600 mb-4">Your wishlist is empty</h3>
                      <p className="text-gray-500 mb-8 max-w-md mx-auto">
                        Save items you love to your wishlist. Review them anytime and easily move them to your cart.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/products')}
                        className="bg-primary text-white px-8 py-4 rounded-xl hover:bg-indigo-600 transition-all shadow-lg hover:shadow-xl"
                      >
                        Browse Products
                      </motion.button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {wishlistItems.map((item, index) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
                        >
                          <div className="flex flex-col h-full">
                            <div className="flex gap-4 mb-4">
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.name}</h3>
                                <p className="text-primary font-bold text-lg mb-2">R {item.price}</p>
                                <p className="text-xs text-gray-500">
                                  Added {new Date(item.addedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 mt-auto pt-4">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  addToCart({
                                    _id: item._id,
                                    name: item.name,
                                    price: item.price,
                                    image: item.image,
                                    category: item.category
                                  }, null, 1)
                                }}
                                className="flex-1 bg-primary text-white py-3 rounded-xl hover:bg-indigo-600 transition-colors font-semibold text-sm"
                              >
                                Add to Cart
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => removeFromWishlist(item._id)}
                                className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                              >
                                <FiTrash2 className="text-lg" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
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
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h2>
                  
                  <div className="space-y-8">
                    {/* Change Password */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                          <FiLock className="text-white text-lg" />
                        </div>
                        Change Password
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                          {
                            label: 'Current Password',
                            value: passwordData.currentPassword,
                            onChange: (value) => setPasswordData({...passwordData, currentPassword: value}),
                            show: showPasswords.current,
                            toggle: () => togglePasswordVisibility('current')
                          },
                          {
                            label: 'New Password',
                            value: passwordData.newPassword,
                            onChange: (value) => setPasswordData({...passwordData, newPassword: value}),
                            show: showPasswords.new,
                            toggle: () => togglePasswordVisibility('new')
                          },
                          {
                            label: 'Confirm New Password',
                            value: passwordData.confirmPassword,
                            onChange: (value) => setPasswordData({...passwordData, confirmPassword: value}),
                            show: showPasswords.confirm,
                            toggle: () => togglePasswordVisibility('confirm')
                          }
                        ].map((field, index) => (
                          <div key={field.label} className={field.label === 'Confirm New Password' ? 'md:col-span-2' : ''}>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              {field.label}
                            </label>
                            <div className="relative">
                              <input
                                type={field.show ? "text" : "password"}
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                              />
                              <button
                                type="button"
                                onClick={field.toggle}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                {field.show ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-4 mt-6">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handlePasswordUpdate}
                          disabled={passwordUpdating}
                          className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-indigo-600 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {passwordUpdating ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <FiCheck />
                              Update Password
                            </>
                          )}
                        </motion.button>
                        
                        <button
                          onClick={() => setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: ''
                          })}
                          className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border border-red-200 rounded-2xl p-6 bg-red-50">
                      <h3 className="text-xl font-semibold text-red-700 mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                          <FiTrash2 className="text-white text-lg" />
                        </div>
                        Danger Zone
                      </h3>
                      
                      {!showDeleteConfirm ? (
                        <div>
                          <p className="text-red-600 mb-4">
                            Once you delete your account, there is no going back. All your data will be permanently removed.
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowDeleteConfirm(true)}
                            className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all flex items-center gap-2"
                          >
                            <FiTrash2 />
                            Delete Account
                          </motion.button>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-4"
                        >
                          <p className="text-red-700 font-medium">
                            Are you absolutely sure? This action cannot be undone.
                          </p>
                          <div>
                            <label className="block text-sm font-semibold text-red-700 mb-2">
                              Enter your password to confirm:
                            </label>
                            <input
                              type="password"
                              value={deleteConfirm}
                              onChange={(e) => setDeleteConfirm(e.target.value)}
                              className="w-full rounded-xl border border-red-300 px-4 py-3 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                              placeholder="Enter your password"
                            />
                          </div>
                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleDeleteAccount}
                              disabled={deleting}
                              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                              {deleting ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <FiTrash2 />
                                  Confirm Delete
                                </>
                              )}
                            </motion.button>
                            <button
                              onClick={() => {
                                setShowDeleteConfirm(false);
                                setDeleteConfirm('');
                              }}
                              className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}