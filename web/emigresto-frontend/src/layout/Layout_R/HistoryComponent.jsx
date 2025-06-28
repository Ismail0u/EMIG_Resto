// src/layout/Layout_R/HistoryComponent.jsx
import React, { useEffect, useState } from 'react'
import { API } from '../../services/apiService'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

export default function HistoryComponent() {
  const [hist, setHist] = useState([])
  const [periods, setPeriods] = useState({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError(null)

    Promise.all([
      API.reservation.list({ page_size: 50 }),
      API.periode.list({ page_size: 50 }) // Augmenté de 5 à 50 pour être sûr
    ])
      .then(([resHist, resPeriodes]) => {
        // Vérification de la structure des données
        if (!resHist || !Array.isArray(resHist.results)) {
          throw new Error("Données d'historique invalides")
        }
        if (!resPeriodes || !Array.isArray(resPeriodes.results)) {
          throw new Error("Données de périodes invalides")
        }

        console.log("✅ Historique reçu:", resHist.results)
        console.log("✅ Périodes reçues:", resPeriodes.results)
        
        setHist(resHist.results)

        const mapping = {}
        resPeriodes.results.forEach(p => {
          if (p && p.id && p.nomPeriode) {
            mapping[p.id] = p.nomPeriode
          }
        })
        setPeriods(mapping)

        setLoading(false)
      })
      .catch((err) => {
        console.error('❌ Erreur chargement historique:', err)
        setError(`❗ Impossible de charger l'historique: ${err.message}`)
        setLoading(false)
      })
  }, [])

  // Regroupement par période avec vérification
  const byPeriod = hist.reduce((acc, r) => {
    if (!r) return acc
    
    // Gestion flexible de l'ID de période
    const pid = r.periode?.id || r.periode_id || r.periode
    if (!pid) {
      console.warn("Réservation sans période:", r)
      return acc
    }
    
    acc[pid] = acc[pid] || []
    acc[pid].push(r)
    return acc
  }, {})

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Chargement de l'historique…</div>
  }

  if (error) {
    return <div className="flex-1 flex items-center justify-center text-red-500 text-sm">{error}</div>
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <h2 className="text-sm font-semibold mb-2 flex-shrink-0 text-gray-700">Historique</h2>

      {Object.entries(byPeriod).length > 0 ? (
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {Object.entries(byPeriod).map(([pid, list]) => (
            <div key={pid} className="bg-white rounded-lg shadow p-3 border border-gray-200">
              <h3 className="text-base font-semibold text-indigo-700 mb-2">
                🕒 {periods[pid] || `Période ${pid}`} – {list.length} réservation(s)
              </h3>
              <ul className="space-y-1 text-sm text-gray-700">
                {list.map(r => {
                  // Vérification de la structure de la réservation
                  if (!r) return null
                  
                  const reservant = r.reservant_pour || r.reservant || {}
                  const nom = reservant.nom || 'Nom inconnu'
                  const prenom = reservant.prenom || 'Prénom inconnu'
                  const matricule = reservant.matricule || 'Matricule inconnu'
                  const date = r.date ? new Date(r.date).toLocaleDateString() : 'Date inconnue'
                  
                  return (
                    <li key={r.id || Math.random()} className="flex items-center gap-2">
                      {r.statut === 'VALIDE' ? (
                        <FaCheckCircle className="text-green-500" />
                      ) : (
                        <FaTimesCircle className="text-red-500" />
                      )}
                      <span>
                        {nom} {prenom} ({matricule}) — <span className="text-gray-500">{date}</span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          Aucune réservation enregistrée.
        </div>
      )}
    </div>
  )
}