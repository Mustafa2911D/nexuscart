import { useCart } from '../../context/CartContext'
import CartItem from './CartItem'
import CartSummary from './CartSummary'
import { AnimatePresence, motion } from 'framer-motion'

export default function CartDrawer() {
  const { isOpen, dispatch, items, loading } = useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={()=>dispatch({type:'CLOSE_CART'})} />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-elevated"
            role="dialog" aria-modal="true" aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-semibold">Your Cart</h3>
              <button onClick={()=>dispatch({type:'CLOSE_CART'})} className="rounded-lg px-2 py-1 hover:bg-gray-100">✕</button>
            </div>
            <div className="flex h-[calc(100%-160px)] flex-col overflow-y-auto p-4 gap-4">
              {items.length === 0 ? (
                <div className="mt-10 text-center text-gray-500">
                  <img src="https://images.unsplash.com/photo-1585386959984-a41552231605?q=80&w=1200&auto=format&fit=crop" alt="Empty cart" className="mx-auto mb-4 h-36 w-36 rounded-full object-cover" />
                  <p>Your cart is empty.</p>
                </div>
              ) : items.map((item)=> <CartItem key={item.id} item={item} />)}
            </div>
            <div className="border-t p-4">
              <CartSummary />
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
