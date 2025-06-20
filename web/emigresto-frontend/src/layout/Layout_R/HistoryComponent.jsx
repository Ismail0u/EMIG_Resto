import React, { useEffect, useState } from 'react'
import { API } from '../../services/apiService'

const HistoryComponent = () => {
  const [hist, setHist] = useState([])
  const [periods, setPeriods] = useState({})
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
  // ATTENTION: La version précédente comptait seulement le nombre.
  // Si tu veux la liste des réservations par période, il faut regrouper les objets entiers.
  // Je vais supposer que tu veux la liste complète pour chaque période comme dans les autres composants.
  const byPeriod = hist.reduce((acc, r) => {
    acc[r.periode] = (acc[r.periode] || []) // Initialise comme un tableau vide
    acc[r.periode].push(r) // Ajoute la réservation au tableau de sa période
    return acc
  }, {})


  if (loading) return <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Chargement de l'historique…</div>
  if (error) return <div className="flex-1 flex items-center justify-center text-red-500 text-sm">{error}</div>

  return (
    // Ce composant ne contient plus de div avec styles de carte.
    // Il prendra les styles de son parent (la carte du dashboard).
    // Nous ajoutons `flex flex-col h-full` ici pour qu'il remplisse le conteneur de la carte,
    // et que son contenu interne puisse défiler.
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-3 flex-shrink-0">Historique</h2>

      {Object.entries(byPeriod).length > 0 ? (
        // flex-1 pour prendre l'espace restant, overflow-y-auto pour le défilement
        <div className="flex-1 overflow-y-auto pr-2">
          {Object.entries(byPeriod).map(([pid, list]) => (
            <div key={pid} className="mb-4">
              <h3 className="font-medium text-gray-700 text-base">
                Période: {periods[pid] || `ID: ${pid}`} ({list.length} réservations)
              </h3>
              <ul className="list-disc pl-5 text-sm text-gray-600">
                {list.map(r => (
                  <li key={r.id}>
                    {r.etudiant?.nom} {r.etudiant?.prenom} ({r.etudiant?.matricule}) - {new Date(r.date).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm flex-1 flex items-center justify-center">
          Aucune réservation historique trouvée.
        </p>
      )}
    </div>
  )
}

export default HistoryComponent