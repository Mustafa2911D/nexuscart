import { createContext, useContext, useEffect, useReducer } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { api } from '../services/api'

const WishlistContext = createContext()

const initialState = {
  items: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, items: action.payload.items || [] }
    case 'ADD_TO_WISHLIST':
      return {
        ...state,
        items: [...state.items, action.payload]
      }
    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload.id)
      }
    case 'CLEAR_WISHLIST':
      return { ...state, items: [] }
    default:
      return state
  }
}

export function WishlistProvider({ children }) {
  const [persisted, setPersisted] = useLocalStorage('nexuscart-wishlist', initialState)
  const [state, dispatch] = useReducer(reducer, persisted)

  useEffect(() => {
    setPersisted(state)
  }, [state, setPersisted])

  async function syncWishlistWithBackend() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
    } catch (error) {
      console.error('Failed to sync wishlist with backend:', error);
    }
  }

  useEffect(() => {
    syncWishlistWithBackend();
  }, []);

  function addToWishlist(product) {
    const wishlistItem = {
      _id: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      addedAt: new Date().toISOString()
    }
    
    dispatch({ type: 'ADD_TO_WISHLIST', payload: wishlistItem });
  }

  function removeFromWishlist(productId) {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: { id: productId } });
  }

  function clearWishlist() {
    dispatch({ type: 'CLEAR_WISHLIST' });
  }

  function isInWishlist(productId) {
    return state.items.some(item => item._id === productId);
  }

  const value = {
    items: state.items,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export const useWishlist = () => useContext(WishlistContext)