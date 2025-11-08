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
        item.product?._id === action.payload._id && item.size === action.payload.size
      );
      
      if (existingItemIndex > -1) {
        return {
          ...state,
          items: state.items.map((item, index) =>
            index === existingItemIndex
              ? { 
                  ...item, 
                  quantity: item.quantity + (action.payload.quantity || 1) 
                }
              : item
          )
        };
      } else {
        const newItem = {
          _id: Date.now().toString(),
          product: {
            _id: action.payload._id,
            name: action.payload.name,
            price: action.payload.price,
            image: action.payload.image,
            category: action.payload.category
          },
          quantity: action.payload.quantity || 1,
          size: action.payload.size || '',
          price: action.payload.price,
          name: action.payload.name,
          image: action.payload.image
        };
        
        return { 
          ...state, 
          items: [...state.items, newItem] 
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
      console.log('Cart sync response:', cartData); 
      
      if (cartData && cartData.data) {
        dispatch({ type: 'HYDRATE', payload: { items: cartData.data.items } });
      } else if (cartData && cartData.items) {
        dispatch({ type: 'HYDRATE', payload: { items: cartData.items } });
      } else if (cartData && Array.isArray(cartData)) {
        dispatch({ type: 'HYDRATE', payload: { items: cartData } });
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
      
      console.log('Adding to cart:', { product, size, quantity, token: !!token }); 
      
      if (token) {
        // User is logged in - sync with backend
        const result = await api.addToCart(itemData);
        console.log('Backend cart response:', result); 
        
        if (result && result.data) {
          dispatch({ type: 'HYDRATE', payload: { items: result.data.items } });
        } else if (result && result.items) {
          dispatch({ type: 'HYDRATE', payload: { items: result.items } });
        } else {
          dispatch({ 
            type: 'ADD_TO_CART', 
            payload: {
              ...product,
              quantity,
              size: size || ''
            }
          });
        }
      } else {
        dispatch({ 
          type: 'ADD_TO_CART', 
            payload: {
              ...product,
              quantity,
              size: size || ''
            }
          });
        }
      } catch (error) {
        console.error('Failed to add item to cart:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
        
        // Always fallback to local state on error
        dispatch({ 
          type: 'ADD_TO_CART', 
          payload: {
            ...product,
            quantity,
            size: size || ''
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

    const checkout = async (orderData) => {
  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    const token = localStorage.getItem('token');
    let orderResult;

    if (token) {
      // Authenticated user - create order via backend
      const response = await api.checkout({
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod || 'Credit Card'
      });
      
      console.log('Checkout response:', response); 
      
      // Handle different response structures
      if (response && response.data) {
        orderResult = response.data; 
      } else if (response && response._id) {
        orderResult = response; 
      } else {
        throw new Error('Invalid checkout response');
      }
    } else {
      const total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      orderResult = {
        _id: `order_${Date.now()}`,
        items: state.items,
        total: total,
        shippingAddress: orderData.shippingAddress || 'Not provided',
        paymentMethod: orderData.paymentMethod || 'Credit Card',
        status: 'completed',
        createdAt: new Date().toISOString()
      };
    }

    // Clear cart after successful checkout
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem('nexuscart-cart');

    return orderResult;
    
  } catch (error) {
    console.error('Checkout error:', error);
    dispatch({ type: 'SET_ERROR', payload: error.message });
    throw error;
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
};

    const manualSyncCart = async () => {
      await syncCartWithBackend();
    };

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
        checkout,
        syncCartWithBackend: manualSyncCart,
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