// src/services/apiServices.js
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { API_BASE_URL } from '../config'
import { tokenStorage } from './tokenStorage'

// Configuration Axios avancée
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Cache des requêtes GET
const requestCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Intercepteur de requête
api.interceptors.request.use(
  async (config) => {
    // Gestion du cache pour les requêtes GET
    if (config.method === 'get') {
      const cacheKey = `${config.url}-${JSON.stringify(config.params)}`
      const cached = requestCache.get(cacheKey)

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return Promise.resolve(cached.response)
      }
    }

    // Ajout du token d'authentification
    const token = await tokenStorage.getAccess()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Intercepteur de réponse
let isRefreshing = false
let refreshSubscribers = []

api.interceptors.response.use(
  (response) => {
    // Mise en cache des réponses GET
    if (response.config.method === 'get') {
      const cacheKey = `${response.config.url}-${JSON.stringify(response.config.params)}`
      requestCache.set(cacheKey, {
        response,
        timestamp: Date.now()
      })
    }
    return response
  },
  async (error) => {
    const { config, response } = error

    // Gestion des erreurs 401
    if (response?.status === 401 && !config._retry) {
      config._retry = true

      // Si on est déjà en train de rafraîchir, on attend
      if (isRefreshing) {
        return new Promise(resolve => {
          refreshSubscribers.push((token) => {
            config.headers.Authorization = `Bearer ${token}`
            resolve(api(config))
          })
        })
      }

      // On essaie de rafraîchir le token
      try {
        isRefreshing = true
        const refreshToken = await tokenStorage.getRefresh()
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const { data } = await axios.post(
          `${API_BASE_URL}auth/token/refresh/`,
          { refresh: refreshToken }
        )

        await tokenStorage.setAccess(data.access)

        // On met à jour les requêtes en attente
        refreshSubscribers.forEach(cb => cb(data.access))
        refreshSubscribers = []

        // On réessaie la requête originale
        config.headers.Authorization = `Bearer ${data.access}`
        return api(config)
      } catch (refreshError) {
        await tokenStorage.clear()
        toast.error('Session expirée, veuillez vous reconnecter')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Gestion des autres erreurs
    return handleError(error)
  }
)

// Gestion des erreurs
const handleError = (error) => {
  if (error.response) {
    const { status, data } = error.response
    const errorMessage = data.detail || data.message || 'Une erreur est survenue'

    if (status === 401) {
      tokenStorage.clear()
      toast.error('Session expirée, veuillez vous reconnecter')
    } else {
      toast.error(`Erreur [${status}]: ${errorMessage}`)
    }

    throw new Error(errorMessage)
  }

  toast.error('Erreur réseau: Impossible de contacter le serveur')
  throw new Error('Erreur réseau')
}

// BaseService amélioré
class BaseService {
  constructor(path) {
    this.path = path.replace(/\/?$/, '/')
  }

  list = (params = {}) => {
    return api.get(this.path, { params })
      .then(r => r.data)
      .catch(handleError)
  }

  get = (id) => {
    return api.get(`${this.path}${id}/`)
      .then(r => r.data)
      .catch(handleError)
  }

  create = (data) => {
    return api.post(this.path, data)
      .then(r => r.data)
      .catch(handleError)
  }

  update = (id, data) => {
    return api.patch(`${this.path}${id}/`, data)
      .then(r => r.data)
      .catch(handleError)
  }

  delete = (id) => {
    return api.delete(`${this.path}${id}/`)
      .then(r => r.data)
      .catch(handleError)
  }
}

// AuthService amélioré
class AuthService {
  me = () => {
    return api.get('user-details/')
      .then(r => r.data)
      .catch(handleError)
  }

  login = async (creds) => {
    try {
      const { data } = await api.post('auth/token/', creds)
      await tokenStorage.setAccess(data.access)
      await tokenStorage.setRefresh(data.refresh)
      return data
    } catch (error) {
      handleError(error)
      throw error
    }
  }

  refresh = async () => {
    try {
      const refreshToken = await tokenStorage.getRefresh()
      const { data } = await api.post('auth/token/refresh/', { refresh: refreshToken })
      await tokenStorage.setAccess(data.access)
      return data.access
    } catch (error) {
      handleError(error)
      throw error
    }
  }

  register = (data) => {
    return api.post('auth/register/', data)
      .then(r => r.data)
      .catch(handleError)
  }

  logout = async () => {
    try {
      const refreshToken = await tokenStorage.getRefresh()
      await api.post('auth/logout/', { refresh: refreshToken })
      await tokenStorage.clear()
    } catch (error) {
      handleError(error)
      throw error
    }
  }
}

// Services spécifiques
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
  utilisateur: new BaseService('utilisateurs'),
}
