import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { FiShoppingCart, FiLogIn, FiLogOut, FiUser, FiMenu, FiX, FiHeart, FiSearch, FiHome, FiShoppingBag, FiChevronDown } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '../../context/UserContext'
import { useWishlist } from '../../context/WishlistContext'

export default function Navbar() {
  const { totalItems } = useCart()
  const { items: wishlistItems } = useWishlist()
  const { user, setUser } = useUser()
  const [menuOpen, setMenuOpen] = useState(false)
  const [badgePulse, setBadgePulse] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!user && token) {
      const savedUser = localStorage.getItem('userData');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Failed to parse user data from localStorage', e);
        }
      }
    }
  }, [user, token, setUser]);

  useEffect(() => {
    if (totalItems >= 0) {
      setBadgePulse(true)
      const t = setTimeout(() => setBadgePulse(false), 400)
      return () => clearTimeout(t)
    }
  }, [totalItems])

  useEffect(() => {
    setMenuOpen(false)
    setUserDropdownOpen(false)
  }, [location])

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userData')
    setUser(null)
    navigate('/login')
    setUserDropdownOpen(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const navItems = [
    { path: '/home', label: 'Home', icon: FiHome },
    { path: '/products', label: 'Products', icon: FiShoppingBag },
  ]

  const userMenuItems = [
    { path: '/profile', label: 'My Profile', icon: FiUser },
    { path: '/profile?tab=wishlist', label: 'Wishlist', icon: FiHeart, badge: wishlistItems.length },
    { path: '/profile?tab=orders', label: 'My Orders', icon: FiShoppingBag },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-xl supports-backdrop-blur:bg-white/70 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Link 
              to="/home" 
              className="group flex items-center gap-3 font-extrabold text-2xl text-dark transition-all duration-300"
            >
              <div className="relative px-3 py-2 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/30 group-hover:scale-105 transition-all duration-300">
                Nexus
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <span className="text-gray-900 group-hover:text-gray-700 transition-colors duration-200">Cart</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 ml-8">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive 
                      ? 'text-primary bg-primary/10 shadow-sm shadow-primary/10' 
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50/80 hover:shadow-sm'
                  }`
                }
              >
                <item.icon className="text-lg transition-transform group-hover:scale-110 duration-200" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-indigo-500/5 rounded-xl blur-sm group-hover:blur-md opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="relative w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white/80 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-primary/30"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-all duration-300 hover:scale-110"
              >
                <FiSearch size={18} />
              </button>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1">
            {/* Search Button - Mobile */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(true)}
              className="md:hidden rounded-xl p-2.5 hover:bg-gray-50 text-gray-600 transition-all duration-300 hover:shadow-sm"
              aria-label="Search products"
            >
              <FiSearch size={20} />
            </motion.button>

            {/* Wishlist */}
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Link
                to="/profile?tab=wishlist"
                className="group relative rounded-xl p-2.5 hover:bg-gray-50 text-gray-600 transition-all duration-300 hover:shadow-sm"
                aria-label="View wishlist"
              >
                <FiHeart 
                  size={20} 
                  className="transition-all duration-300 group-hover:scale-110 group-hover:text-pink-500" 
                />
                {wishlistItems.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white text-[10px] font-semibold shadow-sm shadow-pink-500/30"
                  >
                    {wishlistItems.length > 9 ? '9+' : wishlistItems.length}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* Cart */}
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Link
                to="/cart"
                className="group relative rounded-xl p-2.5 hover:bg-gray-50 text-gray-600 transition-all duration-300 hover:shadow-sm"
                aria-label="Go to cart"
              >
                <FiShoppingCart 
                  id="navbar-cart-icon" 
                  size={20} 
                  className="transition-all duration-300 group-hover:scale-110 group-hover:text-primary" 
                />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key={totalItems}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className={`absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white text-[10px] font-semibold shadow-sm shadow-primary/30 ${
                        badgePulse ? 'animate-pingOnce' : ''
                      }`}
                    >
                      {totalItems > 9 ? '9+' : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>

            {/* Auth Section */}
            {token ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="group flex items-center gap-2 pl-2 pr-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:shadow-sm border border-transparent hover:border-gray-200"
                >
                  <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Avatar" 
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <FiUser className="text-white text-sm transition-transform duration-300 group-hover:scale-110" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-24 truncate group-hover:text-gray-900 transition-colors">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                  <FiChevronDown 
                    className={`text-gray-400 transition-all duration-300 group-hover:text-gray-600 ${
                      userDropdownOpen ? 'rotate-180' : ''
                    }`} 
                    size={16} 
                  />
                </motion.button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 py-2 z-50 backdrop-blur-sm"
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
                        <p className="font-semibold text-gray-900 truncate">{user?.name || 'User'}</p>
                        <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="group flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50/80 hover:text-primary transition-all duration-200"
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="text-lg text-gray-400 transition-all duration-200 group-hover:scale-110 group-hover:text-primary" />
                              <span className="transition-all duration-200 group-hover:translate-x-1">{item.label}</span>
                            </div>
                            {item.badge > 0 && (
                              <span className="px-1.5 py-0.5 text-xs bg-gradient-to-br from-primary to-indigo-600 text-white rounded-full min-w-5 text-center shadow-sm shadow-primary/30">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={logout}
                          className="group flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/80 transition-all duration-200 rounded-b-2xl"
                        >
                          <FiLogOut className="text-lg transition-transform duration-200 group-hover:scale-110 group-hover:-translate-x-0.5" />
                          <span className="transition-all duration-200 group-hover:translate-x-1">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Link
                  to="/login"
                  className="group relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 overflow-hidden"
                  aria-label="Log in"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <FiLogIn size={16} className="relative z-10 transition-transform duration-300 group-hover:scale-110" />
                  <span className="relative z-10 hidden sm:inline transition-transform duration-300 group-hover:translate-x-0.5">Login</span>
                </Link>
              </motion.div>
            )}

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden rounded-xl p-2.5 hover:bg-gray-50 text-gray-600 transition-all duration-300 hover:shadow-sm ml-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden absolute inset-0 bg-white/95 backdrop-blur-sm z-50 p-4"
            >
              <div className="flex items-center gap-3">
                <form onSubmit={handleSearch} className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 bg-white/80 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all duration-300"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors duration-200"
                  >
                    <FiSearch size={18} />
                  </button>
                </form>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  <FiX size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden bg-white/95 backdrop-blur-sm border-t border-gray-100 overflow-hidden shadow-lg"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                      isActive 
                        ? 'text-primary bg-primary/10 shadow-sm shadow-primary/10' 
                        : 'text-gray-700 hover:text-primary hover:bg-gray-50/80 hover:shadow-sm'
                    }`
                  }
                >
                  <item.icon className="text-xl transition-transform duration-300 group-hover:scale-110" />
                  <span className="transition-all duration-300 group-hover:translate-x-1">{item.label}</span>
                </NavLink>
              ))}
              
              {token && userMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="group flex items-center justify-between px-4 py-3 rounded-xl text-base text-gray-700 hover:text-primary hover:bg-gray-50/80 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="text-xl transition-transform duration-300 group-hover:scale-110" />
                    <span className="transition-all duration-300 group-hover:translate-x-1">{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-2 py-1 text-xs bg-gradient-to-br from-primary to-indigo-600 text-white rounded-full shadow-sm shadow-primary/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Global styles for custom animations */}
      <style jsx>{`
        @keyframes pingOnce {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pingOnce {
          animation: pingOnce 0.4s ease-in-out;
        }
      `}</style>
    </header>
  )
}