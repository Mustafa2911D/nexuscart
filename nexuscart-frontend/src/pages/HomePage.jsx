import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import ProductCard from '../components/Product/ProductCard'
import CartDrawer from '../components/Cart/CartDrawer'
import { useCart } from '../context/CartContext'
import { FiTruck, FiShield, FiRefreshCw, FiStar, FiCheck, FiArrowRight } from 'react-icons/fi'

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [products, setProducts] = useState([])
  const [email, setEmail] = useState('')
  const [newsletterSuccess, setNewsletterSuccess] = useState(false)
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const { dispatch } = useCart()
  const productRefs = useRef({})

  useEffect(() => {
    let mounted = true
    setLoading(true)
    
    api.getProducts()
      .then(({ data }) => { 
        if (mounted) {
          const productsData = data.products || data || []
          setProducts(Array.isArray(productsData) ? productsData : [])
        }
      })
      .catch(e => {
        console.error('Failed to fetch products:', e)
        setError('Failed to load products. Please try again later.')
      })
      .finally(() => setLoading(false))
      
    return () => mounted = false
  }, [])

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setNewsletterLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setNewsletterSuccess(true)
      setEmail('')
      setTimeout(() => setNewsletterSuccess(false), 3000)
    } catch (error) {
      setError('Failed to subscribe. Please try again.')
    } finally {
      setNewsletterLoading(false)
    }
  }

  const getDefaultSizes = (product) => {
    if (product.sizes && product.sizes.length > 0) return product.sizes
    const cat = product.category?.toLowerCase()
    if (cat === 'shoes') return ["6","7","8","9","10","11","12"]
    if (cat === 'rings') return ["6","7","8","9","10","11"]
    return ["S","M","L","XL"]
  }

  const handleAddToCart = (product, size = null) => {
    const pid = product.id || product._id
    const imgEl = productRefs.current[pid]
    if (!imgEl) return

    const requiresSize = getDefaultSizes(product).length > 1
    const selectedSize = size || (requiresSize ? null : getDefaultSizes(product)[0])
    if (requiresSize && !selectedSize) {
      alert("Please select a size")
      return
    }

    // Enhanced flying animation
    const rect = imgEl.getBoundingClientRect()
    const clone = imgEl.cloneNode(true)
    clone.style.position = 'fixed'
    clone.style.top = rect.top + 'px'
    clone.style.left = rect.left + 'px'
    clone.style.width = rect.width + 'px'
    clone.style.height = rect.height + 'px'
    clone.style.zIndex = 9999
    clone.style.borderRadius = '0.5rem'
    clone.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)'
    clone.style.transition = 'all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    document.body.appendChild(clone)

    const cartIcon = document.querySelector('#navbar-cart-icon')
    if (!cartIcon) return
    const cartRect = cartIcon.getBoundingClientRect()

    clone.animate(
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
    ).onfinish = () => clone.remove()

    dispatch({ type: 'ADD_TO_CART', payload: { ...product, size: selectedSize, quantity: 1 } })
  }

  return (
    <div className="pb-16">
      {/* Enhanced Hero Section */}
      <section className="relative my-8 overflow-hidden rounded-2xl bg-dark text-white group">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?q=80&w=1974&auto=format&fit=crop"
            alt="Modern shopping experience"
            className="h-full w-full object-cover opacity-25 transition-all duration-700 group-hover:scale-105 group-hover:opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark/80 to-dark/50" />
        </div>
        
        <div className="relative mx-auto max-w-5xl p-8 sm:p-12 text-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight animate-fade-in">
              Indulge in a <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">modern</span> shopping experience
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
              Curated products. Seamless checkout. Luxury vibes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link 
                to="/products" 
                className="group/btn relative rounded-xl bg-primary px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/25"
              >
                <span className="flex items-center gap-2">
                  Shop now
                  <FiArrowRight className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                </span>
              </Link>
              <a 
                href="#featured" 
                className="rounded-xl border border-white/30 px-8 py-4 font-semibold transition-all duration-300 hover:bg-white/10 hover:scale-105 hover:border-white/50"
              >
                Browse collection
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="my-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: FiTruck, title: "Free Shipping", desc: "On orders over R500" },
            { icon: FiShield, title: "Secure Payment", desc: "100% secure transactions" },
            { icon: FiRefreshCw, title: "Easy Returns", desc: "30-day return policy" },
            { icon: FiStar, title: "Quality Products", desc: "Curated selection" }
          ].map((feature, index) => (
            <div 
              key={feature.title}
              className="group text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-primary/20"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-2xl mb-6 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                <feature.icon className="text-2xl" />
              </div>
              <h3 className="font-bold text-lg mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Enhanced Featured Products */}
      <section id="featured" className="my-20">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-600 mt-2">Handpicked items just for you</p>
          </div>
          <Link 
            to="/products" 
            className="group flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300"
          >
            See all
            <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="group animate-pulse">
                <div className="h-64 w-full rounded-2xl bg-gray-200" />
                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-9 bg-gray-200 rounded w-28 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 p-6 text-red-700 border border-red-200 text-center">
            <p className="font-semibold">Oops! Something went wrong</p>
            <p className="mt-1">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-red-600 px-6 py-2 text-white font-medium hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl bg-yellow-50 p-6 text-yellow-700 border border-yellow-200 text-center">
            <p className="font-semibold">No products found</p>
            <p className="mt-1">Please check your backend connection</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {products.slice(0, 8).map((p) => {
              const pid = p._id || p.id
              return (
                <div 
                  key={pid} 
                  className="group"
                  ref={(el) => (productRefs.current[pid] = el)}
                >
                  <ProductCard
                    product={p}
                    onAddToCart={(size) => handleAddToCart(p, size)}
                  />
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Enhanced Newsletter Section */}
      <section className="my-20 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 sm:p-12 text-center border border-primary/10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Stay Updated</h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            Subscribe to our newsletter for the latest products and exclusive offers delivered to your inbox
          </p>
          
          {newsletterSuccess ? (
            <div className="bg-green-100 text-green-700 p-6 rounded-2xl max-w-md mx-auto flex items-center justify-center gap-3 border border-green-200 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <FiCheck className="text-white text-lg" />
                </div>
                <span className="font-medium">Thank you for subscribing!</span>
              </div>
            </div>
          ) : (
            <form 
              onSubmit={handleNewsletterSubmit} 
              className="flex flex-col sm:flex-row max-w-md mx-auto gap-3"
            >
              <div className="flex-1 relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 hover:border-gray-400"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={newsletterLoading}
                className="rounded-xl bg-primary px-6 py-3 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
              >
                {newsletterLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Subscribing...
                  </span>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      <CartDrawer />
    </div>
  )
}