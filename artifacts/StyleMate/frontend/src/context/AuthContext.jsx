import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('stylemate_token')
    const saved = localStorage.getItem('stylemate_user')
    if (token && saved) {
      setUser(JSON.parse(saved))
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data)
          localStorage.setItem('stylemate_user', JSON.stringify(res.data))
        })
        .catch(() => {
          localStorage.removeItem('stylemate_token')
          localStorage.removeItem('stylemate_user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('stylemate_token', res.data.token)
    localStorage.setItem('stylemate_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data
  }

  const register = async (name, email, password, gender) => {
    const res = await api.post('/auth/register', { name, email, password, gender })
    localStorage.setItem('stylemate_token', res.data.token)
    localStorage.setItem('stylemate_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('stylemate_token')
    localStorage.removeItem('stylemate_user')
    setUser(null)
  }

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data)
    setUser(res.data)
    localStorage.setItem('stylemate_user', JSON.stringify(res.data))
    return res.data
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
