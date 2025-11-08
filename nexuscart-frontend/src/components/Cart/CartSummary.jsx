import { useCart } from '../../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function CartSummary() {
  const { totalItems, totalPrice, items, clearCart, checkout } = useCart()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const navigate = useNavigate()

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setCheckoutLoading(true);
    try {
      const order = await checkout({
        shippingAddress: "User's address", // You can get this from user profile
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

  const tax = totalPrice * 0.15; // 15% tax
  const shipping = totalPrice > 500 ? 0 : 99; // Free shipping over R500
  const finalTotal = totalPrice + tax + shipping;

  return (
    <div className="rounded-2xl bg-gray-50 p-6">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span>Items ({totalItems})</span>
          <span>R {totalPrice.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : `R ${shipping.toFixed(2)}`}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Tax (15%)</span>
          <span>R {tax.toFixed(2)}</span>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>R {finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {items.length > 0 ? (
        <button
          onClick={handleCheckout}
          disabled={checkoutLoading}
          className="w-full bg-primary text-white py-3 px-4 rounded-xl font-semibold hover:bg-indigo-600 disabled:opacity-50 transition-colors"
        >
          {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
        </button>
      ) : (
        <button
          onClick={() => navigate('/products')}
          className="w-full bg-primary text-white py-3 px-4 rounded-xl font-semibold hover:bg-indigo-600 transition-colors"
        >
          Continue Shopping
        </button>
      )}
    </div>
  )
}