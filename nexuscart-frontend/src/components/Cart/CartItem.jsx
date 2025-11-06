import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart()

  function dec() {
    if (item.quantity > 1) {
      updateQuantity(item._id, item.quantity - 1)
    }
  }
  
  function inc() {
    updateQuantity(item._id, item.quantity + 1)
  }

  function handleRemove() {
    removeFromCart(item._id)
  }

  return (
    <div className="flex gap-3 rounded-2xl border bg-white p-3">
      <img 
        src={item.product?.image || item.image} 
        alt={item.product?.name || item.name} 
        className="h-20 w-20 rounded-xl object-cover" 
      />
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-semibold">{item.product?.name || item.name}</h4>
            {item.size && <p className="text-sm text-gray-500">Size: {item.size}</p>}
          </div>
          <button
            onClick={handleRemove}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label={`Remove ${item.product?.name || item.name}`}
          >
            <FiTrash2 />
          </button>
        </div>
        <div className="mt-1 text-sm text-gray-500">
          R {(item.price * item.quantity).toFixed(2)}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button onClick={dec} className="rounded-lg border p-2 hover:border-primary" aria-label="Decrease quantity">
            <FiMinus />
          </button>
          <span className="w-10 text-center">{item.quantity}</span>
          <button onClick={inc} className="rounded-lg border p-2 hover:border-primary" aria-label="Increase quantity">
            <FiPlus />
          </button>
        </div>
      </div>
    </div>
  )
}