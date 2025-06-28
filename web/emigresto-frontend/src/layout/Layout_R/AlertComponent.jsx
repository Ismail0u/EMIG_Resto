import React, { useEffect, useState } from 'react'
import { API } from '../../services/apiService'

export default function AlertComponent() {
  const [alerts, setAlerts] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError(null)

    API.reservation.list({ page_size: 10 }) // Optionnel mais recommandé
      .then(res => {
        if (!res || !Array.isArray(res.results)) {
          throw new Error("Réponse invalide : 'results' manquant ou incorrect")
        }

        console.log("✅ Réservations reçues pour alertes:", res.results)

        const msgs = res.results
          .map(r => {
            const etu = r.reservant_pour
            if (!etu) return null
            const mat = etu.matricule || 'Inconnu'
            const nom = etu.nom || 'Nom?'
            const prenom = etu.prenom || 'Prénom?'

            if (r.statut === 'ANNULE') return `❌ Réservation annulée pour ${nom} ${prenom} (${mat})`
            if (r.statut === 'VALIDE') return `✅ Réservation confirmée pour ${nom} ${prenom} (${mat})`
            return null
          })
          .filter(Boolean)

        setAlerts(msgs)
        setLoading(false)
      })
      .catch(err => {
        console.error("❌ Erreur lors du chargement des alertes:", err)
        setError("❗ Impossible de charger les alertes.")
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Chargement des alertes...</div>
  }

  if (error) {
    return <div className="flex-1 flex items-center justify-center text-red-500 text-sm">{error}</div>
  }

  if (!alerts.length) {
    return <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Aucune alerte pour le moment.</div>
  }

  return (
    <div>
      <ul className="list-disc flex-1 overflow-y-auto pb-2">
        {alerts.map((msg, i) => (
          <li key={i} className="text-gray-700 text-sm">
            {msg}
          </li>
        ))}
      </ul>
    </div>
  )
}
