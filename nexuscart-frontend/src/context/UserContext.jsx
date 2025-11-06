import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      try {
        setLoading(true)
        const { data } = await api.getProfile()
        setUser(data)
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
        }
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user));
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}