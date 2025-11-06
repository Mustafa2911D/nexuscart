import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../services/api'
import Modal from '../components/UI/Modal'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { FiEye, FiEyeOff, FiMail, FiLock, FiCheck, FiArrowRight } from 'react-icons/fi'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useUser()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ 
    resolver: zodResolver(schema),
    mode: 'onChange'
  })
  const [err, setErr] = useState('')
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState({ email: false, password: false })

  async function onSubmit(values) {
    setErr('')
    try {
      const userData = await api.login(values)
      
      if (userData && userData.token) {
        localStorage.setItem('token', userData.token)
        localStorage.setItem('userData', JSON.stringify(userData))
        setUser(userData)
        setOpen(true)
        setTimeout(() => {
          setOpen(false)
          navigate('/products')
        }, 1500)
      } else {
        throw new Error('Invalid token response - no token received')
      }
    } catch (e) {
      console.error('Login error:', e)
      setErr(e.message || 'Login failed. Please check your credentials and try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-all duration-300">
          {/* Email Field */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <div className={`relative flex items-center border rounded-xl transition-all duration-300 ${
              isFocused.email ? 'border-primary ring-2 ring-primary/20' : 'border-gray-300'
            } ${errors.email ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}>
              <div className="pl-4 text-gray-400">
                <FiMail size={18} />
              </div>
              <input 
                {...register('email')} 
                type="email" 
                className="w-full px-3 py-3 bg-transparent outline-none placeholder-gray-400"
                placeholder="Enter your email"
                onFocus={() => setIsFocused(prev => ({ ...prev, email: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, email: false }))}
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className={`relative flex items-center border rounded-xl transition-all duration-300 ${
              isFocused.password ? 'border-primary ring-2 ring-primary/20' : 'border-gray-300'
            } ${errors.password ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}>
              <div className="pl-4 text-gray-400">
                <FiLock size={18} />
              </div>
              <input 
                {...register('password')} 
                type={showPassword ? "text" : "password"} 
                className="w-full px-3 py-3 bg-transparent outline-none placeholder-gray-400 pr-12"
                placeholder="Enter your password"
                onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
              />
              <button
                type="button"
                className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FiEyeOff size={20} className="hover:scale-110 transition-transform" />
                ) : (
                  <FiEye size={20} className="hover:scale-110 transition-transform" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right mb-6">
            <a href="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors duration-200">
              Forgot your password?
            </a>
          </div>

          {/* Error Message */}
          {err && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-shake">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <p className="text-sm font-medium">{err}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            disabled={isSubmitting} 
            className="group w-full rounded-xl bg-primary px-4 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                Sign in
                <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            )}
          </button>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-primary font-semibold hover:text-primary/80 transition-colors duration-200 group inline-flex items-center gap-1"
              >
                Create one here
                <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" size={14} />
              </Link>
            </p>
          </div>
        </form>

        {/* Demo Credentials Hint */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-center">
          <p className="text-sm text-blue-700">
            <strong>Demo:</strong> Try with test@example.com / password123
          </p>
        </div>
      </div>

      {/* Success Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Login Successful">
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="text-green-600 text-2xl" />
          </div>
          <p className="text-gray-700 mb-2">You have been successfully logged in!</p>
          <p className="text-sm text-gray-500">Redirecting to products page...</p>
        </div>
      </Modal>
    </div>
  )
}