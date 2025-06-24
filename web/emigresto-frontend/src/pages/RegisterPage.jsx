import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logsvg2 from '../assets/images/logsvg2.png'
import { API } from '../services/apiService'
import { toast } from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({
    email: '',
    nom: '',
    prenom: '',
    telephone: '',
    password: '',
    role: ''
  })
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Rôles disponibles dans le formulaire
  const roles = [
    { value: 'ETUDIANT', label: 'Étudiant' },
    { value: 'MAGASINIER', label: 'Magasinier' },
    { value: 'VENDEUR_TICKETS', label: 'Vendeur de tickets' },
    { value: 'RESPONSABLE_GUICHET', label: 'Responsable Guichet' },
    { value: 'CHEF_SERVICE_RESTAURANT', label: 'Chef Service Restaurant' },
    { value: 'CUISINIER', label: 'Cuisinier' },
    { value: 'ADMIN', label: 'Administrateur' },
  ]

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)
    try {
      // 1) Création du compte utilisateur
      const { user_id, role, email } = await register(form)
      console.log('✅ Utilisateur créé:', { user_id, role, email })

      // 2) Création du profil métier si nécessaire
      if (form.role !== 'ETUDIANT') {
        const endpointMap = {
          MAGASINIER: 'magasiniers',
          VENDEUR_TICKETS: 'vendeurtickets',
          RESPONSABLE_GUICHET: 'responsableguichets',
          CHEF_SERVICE_RESTAURANT: 'chefservicerestaurant',
          CUISINIER: 'cuisiniers',
          ADMIN: 'administrateurs',
        }
        const endpoint = endpointMap[form.role]
        if (endpoint) {
          await API[endpoint].create({ utilisateur: user_id })
              // 🛠️ Mise à jour du rôle dans le modèle utilisateur
          await API.utilisateur.update(user_id, { role: form.role })
          console.log('✅ Profil métier enregistré')
        }
      }

      // 3) Redirection vers la page de connexion
      toast.success('Inscription réussie ! Vous pouvez vous connecter.')
      navigate('/login')
    } catch (e) {
      console.error('❌ Erreur lors de l’inscription :', e)
      setError(e.message || 'Erreur inconnue lors de l’inscription')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4 overflow-y-auto">
      <div className="max-w-5xl w-full bg-white rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden max-h-full">
        {/* Illustration */}
        <div className="md:w-1/2 hidden md:flex items-center justify-center bg-blue-100 p-8">
          <img
            src={logsvg2}
            alt="Illustration"
            className="max-w-full h-auto"
            style={{ filter: 'hue-rotate(200deg) saturate(1.2)' }}
          />
        </div>

        {/* Formulaire */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center overflow-y-auto max-h-[90vh]">
          <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center md:text-left">
            Inscription
          </h1>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Champs de base */}
            {['email', 'nom', 'prenom', 'telephone', 'password'].map(field => (
              <div key={field}>
                <label className="block mb-1 capitalize text-blue-700">{field}</label>
                <input
                  name={field}
                  type={field === 'password' ? 'password' : 'text'}
                  value={form[field]}
                  onChange={handleChange}
                  required={field !== 'telephone'}
                  className="w-full border border-blue-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            ))}

            {/* Sélecteur de rôle */}
            <div>
              <label className="block mb-1 text-blue-700">Rôle</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border border-blue-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">-- Choisir un rôle --</option>
                {roles.map(r => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-3 rounded hover:bg-blue-800 transition"
            >
              S’inscrire
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-red-600 hover:underline">
              Connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
