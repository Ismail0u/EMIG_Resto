// src/pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logsvg1 from '../assets/images/emig_logo.png'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { user } = await login(email, password)
      const role = user?.role

      console.log("✅ Utilisateur connecté, rôle :", role)

      if (role === 'VENDEUR_TICKETS') {
        navigate('/dashboardVendeur', { replace: true })
      } else {
        navigate(from, { replace: true })
      }

    } catch (err) {
      setError('Email ou mot de passe invalide.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-xl shadow-md w-full max-w-4xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* --- Illustration --- */}
        <div className="hidden md:flex flex-col items-center justify-center bg-blue-50 p-6">
         <img src={logsvg1} alt="Illustration de connexion" className="w-3/4 mb-4" />
         <h1 className="text-3xl font-bold flex space-x-1">
           <span className="text-blue-800">Emig</span>
           <span className="text-red-400">Resto</span>
         </h1>
        </div>


        {/* --- Formulaire de connexion --- */}
        <div className="p-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-6 text-center">
            Connexion
          </h1>

          {/* Message d’erreur */}
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-100 border border-red-200 p-2 rounded">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <a href="/register" className="text-blue-600 hover:underline">
              Inscrivez-vous ici
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
