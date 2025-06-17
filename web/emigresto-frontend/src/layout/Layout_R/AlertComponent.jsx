import React, { useEffect, useState } from 'react'
import { API } from '../../services/apiService'

export default function AlertComponent() {
  // État local pour stocker les messages d'alerte
  const [alerts, setAlerts] = useState([])

  // État pour gérer les erreurs de chargement
  const [error, setError] = useState(null)

  // useEffect pour charger les réservations dès que le composant est monté
  useEffect(() => {
    API.reservation.list()
      .then(res => {
        const msgs = res.results
          .map(r => {
            const mat = r.etudiant?.matricule || 'Inconnu'
            // Génère un message en fonction du statut
            return r.statut === 'ANNULE'
              ? `❌ Réservation annulée pour ${mat}`
              : r.statut === 'VALIDE'
                ? `✅ Réservation confirmée pour ${mat}`
                : null
          })
          .filter(Boolean) // Supprime les null
        setAlerts(msgs)
      })
      .catch(() => {
        setError("❗ Impossible de charger les alertes.")
      })
  }, [])

  // Affichage de l'erreur si la récupération échoue
  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded shadow">
        {error}
      </div>
    )
  }

  // Affichage des alertes (si disponibles)
  return (
    <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold text-yellow-800">Alertes</h2>

      {alerts.length > 0 ? (
        <ul className="list-disc pl-5 mt-2 text-gray-700 space-y-1">
          {alerts.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 mt-2">Aucune alerte pour le moment.</p>
      )}
    </div>
  )
}
