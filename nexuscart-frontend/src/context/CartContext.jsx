// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { api } from '../services/api'

const CartContext = createContext()

const initialState = {
  items: [],
  isOpen: false,
  loading: false,
  error: null
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'HYDRATE':
      return { 
        ...state, 
        items: action.payload.items || [],
        loading: false,
        error: null
      }
    case 'OPEN_CART':
      return { ...state, isOpen: true }
    case 'CLOSE_CART':
      return { ...state, isOpen: false }
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen }
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map(item =>
          item._id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        )
      }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload.id)
      }
    case "CLEAR_CART":
      return { ...state, items: [] }
    case "ADD_TO_CART":
      const existingItemIndex = state.items.findIndex(item => 
        item.product?._id === action.payload.productId && item.size === action.payload.size
      );
      
      if (existingItemIndex > -1) {
        return {
          ...state,
          items: state.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      } else {
        return { 
          ...state, 
          items: [...state.items, {
            _id: Date.now().toString(),
            product: action.payload,
            quantity: action.payload.quantity,
            size: action.payload.size,
            price: action.payload.price
          }] 
        };
      }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [persisted, setPersisted] = useLocalStorage('nexuscart-cart', initialState)
  const [state, dispatch] = useReducer(reducer, persisted)

  useEffect(() => {
    setPersisted(state)
  }, [state, setPersisted])

  const totalItems = useMemo(() => 
    state.items.reduce((total, item) => total + item.quantity, 0), 
    [state.items]
  )
  
  const totalPrice = useMemo(() => 
    state.items.reduce((total, item) => total + (item.price * item.quantity), 0), 
    [state.items]
  )

  async function syncCartWithBackend() {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const cartData = await api.getCart();
      if (cartData && cartData.data) {
        dispatch({ type: 'HYDRATE', payload: { items: cartData.data.items } });
      }
    } catch (error) {
      console.error('Failed to sync cart with backend:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  }

  useEffect(() => {
    syncCartWithBackend();
  }, []);

  async function addToCart(product, size = null, quantity = 1) {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const token = localStorage.getItem('token');
      const itemData = {
        productId: product._id || product.id,
        quantity,
        size: size || ''
      };
      
      if (token) {
        const result = await api.addToCart(itemData);
        if (result && result.data) {
          dispatch({ type: 'HYDRATE', payload: { items: result.data.items } });
        }
      } else {
        // Guest user - add to local state
        dispatch({ 
          type: 'ADD_TO_CART', 
          payload: {
            ...product,
            productId: product._id || product.id,
            quantity,
            size: size || '',
            price: product.price
          }
        });
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      // Fallback to local state
      dispatch({ 
        type: 'ADD_TO_CART', 
        payload: {
          ...product,
          productId: product._id || product.id,
          quantity,
          size: size || '',
          price: product.price
        }
      });
    }
  }

  async function updateQuantity(itemId, quantity) {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.updateCartItem(itemId, quantity);
      }
      dispatch({ type: 'UPDATE_QTY', payload: { id: itemId, quantity } });
    } catch (error) {
      console.error('Failed to update cart item:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'UPDATE_QTY', payload: { id: itemId, quantity } });
    }
  }

  async function removeFromCart(itemId) {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.removeFromCart(itemId);
      }
      dispatch({ type: 'REMOVE_ITEM', payload: { id: itemId } });
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'REMOVE_ITEM', payload: { id: itemId } });
    }
  }

  async function clearCart() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.clearCart();
      }
      dispatch({ type: 'CLEAR_CART' });
      setPersisted({ ...initialState, items: [] });
    } catch (error) {
      console.error('Failed to clear cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      dispatch({ type: 'CLEAR_CART' });
      setPersisted({ ...initialState, items: [] });
    }
  }

  const value = useMemo(
    () => ({
      ...state,
      totalItems,
      totalPrice,
      dispatch,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      syncCartWithBackend,
    }),
    [state, totalItems, totalPrice]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}