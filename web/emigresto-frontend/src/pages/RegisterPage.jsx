import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logsvg2 from '../assets/images/logsvg2.png'

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({ email:'', nom:'', prenom:'', password:'', telephone:'' })
  const [error, setError] = useState(null)
  const nav = useNavigate()

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      await register(form)
      nav('/login')
    } catch (e) {
      setError(JSON.stringify(e))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="max-w-5xl w-full bg-white rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden">
        {/* Illustration Undraw à gauche */}
        <div className="md:w-1/2 hidden md:flex items-center justify-center bg-blue-100 p-8">
          <img
            src={logsvg2}
            alt="Illustration professionnelle"
            className="max-w-full h-auto"
            style={{ filter: 'hue-rotate(200deg) saturate(1.2)' }} // pour un ton bleu personnalisé
          />
        </div>

        {/* Formulaire */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center md:text-left">Inscription</h1>
          {error && <p className="text-red-600 mb-4 text-center md:text-left">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-5">
            {['email', 'nom', 'prenom', 'telephone', 'password'].map(field => (
              <div key={field}>
                <label className="block mb-1 capitalize text-blue-700">{field}</label>
                <input
                  name={field}
                  type={field === 'password' ? 'password' : 'text'}
                  className="w-full border border-blue-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={form[field]}
                  onChange={handleChange}
                  required={field !== 'telephone'}
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full bg-blue-700 text-white py-3 rounded hover:bg-blue-800 transition"
            >
              S’inscrire
            </button>
          </form>
          <p className="mt-6 text-center md:text-left text-sm text-gray-600">
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
