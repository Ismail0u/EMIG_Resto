// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { API } from '../services/apiService'
import { tokenStorage } from '../services/tokenStorage'

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      const tok = await tokenStorage.getAccess()
      if (!tok) {
        setLoading(false)
        return
      }
      try {
        const u = await API.auth.me()
        setUser(u)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = async (email, password) => {
    const data = await API.auth.login({ email, password }) // => { access, refresh }
    const userDetails = await API.auth.me()                // récupère l'utilisateur connecté
    const userFull = await API.utilisateur.get(userDetails.id) // ici on a le role
  
    setUser(userFull)
    toast.success('Connexion réussie')
    return { user: userFull } // ✅ maintenant user.role est bien disponible
  }
  const register = async (payload) => {
    const res = await API.auth.register(payload)
    toast.success('Inscription réussie')
    return res
  }

  const logout = async () => {
    await API.auth.logout()
    setUser(null)
    toast.success('Déconnexion réussie')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Chargement de la session…</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
