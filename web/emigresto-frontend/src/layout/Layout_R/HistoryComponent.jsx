import React, { useEffect, useState } from 'react'
import { API } from '../../services/apiService'

const HistoryComponent = () => {
  const [hist, setHist] = useState([])
  const [periods, setPeriods] = useState({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true) // Ajout d'un état loading

  useEffect(() => {
    // Chargement simultané des réservations et des périodes
    Promise.all([API.reservation.list(), API.periode.list()])
      .then(([resHist, resPeriodes]) => {
        setHist(resHist.results)
        const m = {}
        resPeriodes.results.forEach(p => { m[p.id] = p.nomPeriode })
        setPeriods(m)
        setLoading(false)
      })
      .catch(() => {
        setError('Impossible de charger l’historique.')
        setLoading(false)
      })
  }, [])

  // Comptage du nombre de réservations par période
  const byPeriod = hist.reduce((acc, r) => {
    acc[r.periode] = (acc[r.periode] || 0) + 1
    return acc
  }, {})

  if (loading) return <div>Chargement de l'historique…</div>

  return (
    <div className="p-4 bg-white rounded-md shadow-sm">
      <h2 className="text-xl font-semibold mb-3">Historique</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}

      {Object.entries(byPeriod).length > 0 ? (
        Object.entries(byPeriod).map(([pid, count]) => (
          <div key={pid} className="mb-2">
            <strong>{periods[pid] ?? 'Inconnu'}</strong> : {count} réservation{count > 1 ? 's' : ''}
          </div>
        ))
      ) : (
        <p className="text-gray-500">Aucune donnée.</p>
      )}
    </div>
  )
}

export default HistoryComponent
