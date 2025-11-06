import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useUser } from "../context/UserContext";
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiCheck, FiArrowRight } from "react-icons/fi";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch
  } = useForm({ 
    resolver: zodResolver(schema),
    mode: 'onChange'
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  
  const navigate = useNavigate();
  const { setUser } = useUser();

  const onSubmit = async (data) => {
    setError("");
    try {
      const userData = await api.register({
        name: data.name,
        email: data.email,
        password: data.password
      });
      
      if (userData && userData.token) {
        localStorage.setItem("token", userData.token);
        localStorage.setItem("userData", JSON.stringify(userData));
        setUser(userData);
        setSuccess(true);
        setTimeout(() => {
          navigate("/products");
        }, 2000);
      } else {
        throw new Error('Registration failed - no token received');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || "Registration failed. Please try again.");
    }
  };

  const passwordValue = watch("password", "");
  const confirmPasswordValue = watch("confirmPassword", "");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-primary/5 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join us and start your shopping journey</p>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm text-center animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="text-green-600 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Registration Successful!</h3>
            <p className="text-gray-600 mb-4">Your account has been created successfully.</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Redirecting to products...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-all duration-300">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-shake">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Name Field */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <div className={`relative flex items-center border rounded-xl transition-all duration-300 ${
                isFocused.name ? 'border-primary ring-2 ring-primary/20' : 'border-gray-300'
              } ${errors.name ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}>
                <div className="pl-4 text-gray-400">
                  <FiUser size={18} />
                </div>
                <input
                  {...register("name")}
                  type="text"
                  className="w-full px-3 py-3 bg-transparent outline-none placeholder-gray-400"
                  placeholder="Enter your full name"
                  onFocus={() => setIsFocused(prev => ({ ...prev, name: true }))}
                  onBlur={() => setIsFocused(prev => ({ ...prev, name: false }))}
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                  {errors.name.message}
                </p>
              )}
            </div>

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
                  {...register("email")}
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
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className={`relative flex items-center border rounded-xl transition-all duration-300 ${
                isFocused.password ? 'border-primary ring-2 ring-primary/20' : 'border-gray-300'
              } ${errors.password ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}>
                <div className="pl-4 text-gray-400">
                  <FiLock size={18} />
                </div>
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3 py-3 bg-transparent outline-none placeholder-gray-400 pr-12"
                  placeholder="Create a password"
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
              {passwordValue && (
                <div className="mt-2 flex items-center gap-2">
                  <div className={`w-1/3 h-1 rounded-full transition-colors ${
                    passwordValue.length >= 6 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div className={`w-1/3 h-1 rounded-full transition-colors ${
                    passwordValue.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div className={`w-1/3 h-1 rounded-full transition-colors ${
                    passwordValue.length >= 10 ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <div className={`relative flex items-center border rounded-xl transition-all duration-300 ${
                isFocused.confirmPassword ? 'border-primary ring-2 ring-primary/20' : 'border-gray-300'
              } ${errors.confirmPassword ? 'border-red-500 ring-2 ring-red-500/20' : ''} ${
                confirmPasswordValue && passwordValue === confirmPasswordValue ? 'border-green-500 ring-2 ring-green-500/20' : ''
              }`}>
                <div className="pl-4 text-gray-400">
                  <FiLock size={18} />
                </div>
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full px-3 py-3 bg-transparent outline-none placeholder-gray-400 pr-12"
                  placeholder="Confirm your password"
                  onFocus={() => setIsFocused(prev => ({ ...prev, confirmPassword: true }))}
                  onBlur={() => setIsFocused(prev => ({ ...prev, confirmPassword: false }))}
                />
                <button
                  type="button"
                  className="absolute right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff size={20} className="hover:scale-110 transition-transform" />
                  ) : (
                    <FiEye size={20} className="hover:scale-110 transition-transform" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1 animate-fade-in">
                  {errors.confirmPassword.message}
                </p>
              )}
              {confirmPasswordValue && passwordValue === confirmPasswordValue && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1 animate-fade-in">
                  <FiCheck className="text-green-500" /> Passwords match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="group w-full rounded-xl bg-primary px-4 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Create Account
                  <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              )}
            </button>
          </form>
        )}

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="text-primary font-semibold hover:text-primary/80 transition-colors duration-200 group inline-flex items-center gap-1"
            >
              Sign in here
              <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" size={14} />
            </Link>
          </p>
        </div>

        {/* Terms Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}