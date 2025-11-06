import { Outlet } from 'react-router-dom'
import Navbar from './components/UI/Navbar'
import { FiFacebook, FiTwitter, FiInstagram, FiMail, FiPhone, FiMapPin, FiHome, FiShoppingBag, FiShoppingCart, FiUser } from 'react-icons/fi'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              <span className="bg-primary text-white px-2 py-1 rounded-lg">Nexus</span>Cart
            </h3>
            <p className="text-gray-400 mb-4">
              Your premier destination for quality products and exceptional shopping experiences.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <FiInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/home" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                  <FiHome size={16} />
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                  <FiShoppingBag size={16} />
                  Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                  <FiShoppingCart size={16} />
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-white transition flex items-center gap-2">
                  <FiUser size={16} />
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition">Contact Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Shipping Info</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Returns & Exchanges</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">FAQ</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FiMapPin className="text-primary" />
                <span className="text-gray-400">123 Commerce St, Cape Town, 2915, South Africa</span>
              </div>
              <div className="flex items-center gap-2">
                <FiPhone className="text-primary" />
                <span className="text-gray-400">+27 (11) 387-4529</span>
              </div>
              <div className="flex items-center gap-2">
                <FiMail className="text-primary" />
                <span className="text-gray-400">support@nexuscart.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} NexusCart. All rights reserved. 
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-light text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}