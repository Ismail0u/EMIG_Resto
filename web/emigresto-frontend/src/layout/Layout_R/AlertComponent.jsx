// src/layout/Layout_R/AlertComponent.jsx
import React, { useEffect, useState } from 'react'
import { API } from '../../services/apiService'

export default function AlertComponent() {
  const [alerts, setAlerts] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);

    API.reservation.list({ page_size: 1000 })
      .then(res => {
        const msgs = res.results
          .map(r => {
            const mat = r.etudiant?.matricule || 'Inconnu'
            if (r.statut === 'ANNULE') return `❌ Réservation annulée pour ${r.etudiant?.nom} ${r.etudiant?.prenom} (${mat})`
            if (r.statut === 'VALIDE') return `✅ Réservation confirmée pour ${r.etudiant?.nom} ${r.etudiant?.prenom} (${mat})`
            return null
          })
          .filter(Boolean)
        setAlerts(msgs)
        setLoading(false);
      })
      .catch(() => {
        setError("❗ Impossible de charger les alertes.")
        setLoading(false);
      })
  }, [])

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Chargement des alertes...</div>;
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-500 text-sm">
        {error}
      </div>
    );
  }

  if (!alerts.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
        Aucune alerte pour le moment.
      </div>
    );
  }

  return (
    // Removed border-l-4 and border-yellow-500
    <div >
    

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