import { useCart } from '../../context/CartContext'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../../services/api'  

export default function CartSummary() {
  const { totalItems, totalPrice, items, clearCart } = useCart()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const navigate = useNavigate()

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setCheckoutLoading(true);
    try {
      const { data: order } = await api.checkout({
        shippingAddress: "User's address", 
        paymentMethod: "Credit Card"
      });
      
      clearCart();
      navigate('/success', { state: { order } });
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Items</span>
        <span className="font-semibold">{totalItems}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-sm text-gray-600">Total</span>
        <span className="text-lg font-bold">R {totalPrice.toFixed(2)}</span>
      </div>
      
      {items.length > 0 ? (
        <button
          onClick={handleCheckout}
          disabled={checkoutLoading}
          className="mt-3 w-full rounded-xl bg-secondary px-4 py-2 text-center font-medium text-white hover:opacity-95 disabled:opacity-50"
        >
          {checkoutLoading ? 'Processing...' : 'Checkout'}
        </button>
      ) : (
        <Link
          to="/products"
          className="mt-3 block rounded-xl bg-primary px-4 py-2 text-center font-medium text-white hover:opacity-95"
        >
          Continue Shopping
        </Link>
      )}
    </div>
  )
}