// src/services/apiService.js
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { API_BASE_URL } from '../config'
import { tokenStorage } from './tokenStorage'

// 1. Création d’une instance Axios avec config de base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// 2. Intercepteur de requête : injecte toujours le token si présent
api.interceptors.request.use(
  async config => {
    const token = await tokenStorage.getAccess()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 3. Rafraîchissement automatique en cas de 401
let isRefreshing = false
let subscribers = []

api.interceptors.response.use(
  response => response, // passe la réponse quand tout va bien
  async error => {
    const { response, config } = error
    if (response?.status === 401 && !config._retry) {
      config._retry = true

      // 3.1 Si déjà en refresh, on attend que ça se termine
      if (isRefreshing) {
        return new Promise(resolve =>
          subscribers.push(token => {
            config.headers.Authorization = `Bearer ${token}`
            resolve(api(config))
          })
        )
      }

      // 3.2 Sinon on lance le refresh
      try {
        isRefreshing = true
        const refreshToken = await tokenStorage.getRefresh()
        if (!refreshToken) throw new Error('No refresh token')

        const { data } = await axios.post(
          `${API_BASE_URL}auth/token/refresh/`,
          { refresh: refreshToken }
        )
        await tokenStorage.setAccess(data.access)

        // Notifie toutes les requêtes en attente
        subscribers.forEach(cb => cb(data.access))
        subscribers = []

        // Requête originale avec nouveau token
        config.headers.Authorization = `Bearer ${data.access}`
        return api(config)
      } catch (e) {
        // Si refresh échoue, on déloge l’utilisateur
        await tokenStorage.clear()
        toast.error('Session expirée, reconnectez-vous')
        window.location.href = '/login'
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }

    // 4. Gestion des autres erreurs
    return handleError(error)
  }
)

// 4. Gestion centralisée des erreurs axios
function handleError(error) {
  if (error.response) {
    const { status, data } = error.response
    const msg = data.detail || data.message || 'Erreur serveur'
    if (status === 401) {
      tokenStorage.clear()
      toast.error('Session expirée, reconnectez-vous')
    } else {
      toast.error(`Erreur [${status}] : ${msg}`)
    }
    throw new Error(msg)
  }
  toast.error('Erreur réseau : impossible de contacter le serveur')
  throw new Error('Erreur réseau')
}

// 5. Service générique pour CRUD
class BaseService {
  constructor(path) {
    this.path = path.replace(/\/?$/, '/')
  }

  list = params =>
    api.get(this.path, { params }).then(r => r.data).catch(handleError)

  get = id =>
    api.get(`${this.path}${id}/`).then(r => r.data).catch(handleError)

  create = data =>
    api.post(this.path, data).then(r => r.data).catch(handleError)

  update = (id, data) =>
    api.patch(`${this.path}${id}/`, data).then(r => r.data).catch(handleError)

  delete = id =>
    api.delete(`${this.path}${id}/`).then(r => r.data).catch(handleError)
}

// 6. AuthService pour l’authentification & tokens
class AuthService {
  me = () => api.get('user-details/').then(r => r.data).catch(handleError)

  login = async creds => {
    const { data } = await api.post('auth/token/', creds)
    await tokenStorage.setAccess(data.access)
    await tokenStorage.setRefresh(data.refresh)
    return data
  }

  register = data =>
    api.post('auth/register/', data).then(r => r.data).catch(handleError)

  logout = async () => {
    const refresh = await tokenStorage.getRefresh()
    await api.post('auth/logout/', { refresh })
    await tokenStorage.clear()
  }
}

// 7. Export de nos services
export const API = {
  auth: new AuthService(),
  etudiant: new BaseService('etudiants'),
  jour: new BaseService('jours'),
  periode: new BaseService('periodes'),
  reservation: new BaseService('reservations'),
  ticket: new BaseService('tickets'),
  paiement: new BaseService('paiements'),
  transaction: new BaseService('transactions'),
  recu: new BaseService('recus'),
  notification: new BaseService('notifications'),
  personnel: new BaseService('personnels'),
    vendeurtickets: new BaseService('vendeurtickets'),
  utilisateur: new BaseService('utilisateurs'),
}
