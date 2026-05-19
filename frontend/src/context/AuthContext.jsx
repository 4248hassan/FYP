import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)
const TOKEN_KEY = 'authToken'
const USER_KEY = 'authUser'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window === 'undefined') return null
    const storedUser = window.localStorage.getItem(USER_KEY)
    try {
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      window.localStorage.removeItem(USER_KEY)
      return null
    }
  })
  const [token, setToken] = useState(() => {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(TOKEN_KEY)
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedToken = window.localStorage.getItem(TOKEN_KEY)
    const storedUser = window.localStorage.getItem(USER_KEY)

    if (!storedToken || !storedUser) {
      setToken(null)
      setUser(null)
      return
    }

    setToken(storedToken)
    try {
      setUser(JSON.parse(storedUser))
    } catch {
      window.localStorage.removeItem(USER_KEY)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return
      try {
        const response = await api.get('/users/profile')
        saveAuth(token, response.data.user)
      } catch (err) {
        console.error('Failed to refresh profile', err)
        logout()
      }
    }

    fetchProfile()
  }, [token])

  const saveAuth = (nextToken, nextUser) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TOKEN_KEY, nextToken)
      window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
      console.debug('[auth] saved auth token and user', { user: nextUser?.email, role: nextUser?.role })
    }
    setToken(nextToken)
    setUser(nextUser)
  }

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials)
    console.debug('[auth] login response', res.data)
    const { token: nextToken, user: nextUser } = res.data
    saveAuth(nextToken, nextUser)
    return nextUser
  }

  const register = async (data) => {
    const payload = {
      name: data.name || `${data.firstName?.trim() || ''} ${data.lastName?.trim() || ''}`.trim(),
      email: data.email,
      password: data.password,
      role: data.role || 'customer',
    }
    const res = await api.post('/auth/register', payload)
    const { token: nextToken, user: nextUser } = res.data
    saveAuth(nextToken, nextUser)
    return nextUser
  }

  const updateProfile = async (updates) => {
    const res = await api.put('/users/profile', updates)
    const updatedUser = res.data.user
    saveAuth(token, updatedUser)
    return updatedUser
  }

  const changePassword = async (oldPassword, newPassword) => {
    const res = await api.put('/users/change-password', { oldPassword, newPassword })
    return res.data
  }

  const uploadProfilePicture = async (file) => {
    if (!file) {
      throw new Error('No file selected for upload')
    }

    console.log('🔧 uploadProfilePicture called with:', file.name, file.type)
    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log('🌐 Sending POST to /users/upload-profile-pic')
      // Don't set Content-Type header - axios handles FormData automatically
      const res = await api.post('/users/upload-profile-pic', formData)

      console.log('📨 Response received:', res.data)
      const updatedUser = res.data.user
      
      if (!updatedUser) {
        throw new Error('No user data in response')
      }
      
      console.log('💾 Saving auth with updated user:', updatedUser.profileImage)
      saveAuth(token, updatedUser)
      return updatedUser
    } catch (error) {
      console.error('❌ uploadProfilePicture error:', error)
      if (error.response) {
        console.error('Response status:', error.response.status)
        console.error('Response data:', error.response.data)
      }
      throw error
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN_KEY)
      window.localStorage.removeItem(USER_KEY)
      // Clear sessionStorage as well
      window.sessionStorage.clear()
    }
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        login,
        logout,
        register,
        updateProfile,
        changePassword,
        uploadProfilePicture,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return ctx
}

export function useAuth() {
  return useAuthContext()
}

export default AuthContext

