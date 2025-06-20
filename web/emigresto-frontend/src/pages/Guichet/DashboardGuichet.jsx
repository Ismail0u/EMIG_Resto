// src/pages/DashboardGuichet.jsx
import React, { useEffect, useState } from 'react'
import AlertComponent from '../../layout/Layout_R/AlertComponent'
import CalendarComponent from '../../layout/Layout_R/CalendarComponent'
import GraphComponent from '../../layout/Layout_R/GraphComponent'
import HistoryComponent from '../../layout/Layout_R/HistoryComponent'
import { API } from '../../services/apiService'

// Fonctions et états liés aux données des stats, maintenant actifs.
const joursSemaine = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const getTodayName = () => joursSemaine[new Date().getDay()]

export default function Dashboard() {
  // États de données activés pour les statistiques.
  const [stats, setStats] = useState({ allCount: 0, petitDejCount: 0, lunchCount: 0, dinnerCount: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const tomorrow = joursSemaine[(joursSemaine.indexOf(getTodayName()) + 1) % 7]

  useEffect(() => {
    setLoading(true)
    setError(null)
    API.jour
      .list()
      .then(res => {
        const data = res.results.find(j => j.nomJour === tomorrow)
        if (data) {
          setStats({
            allCount: data.nbre_reserve_jour || 0,
            petitDejCount: data.nbre_reserve_lendemain_petitDej || 0,
            lunchCount: data.nbre_reserve_lendemain_dej || 0,
            dinnerCount: data.nbre_reserve_lendemain_diner || 0
          })
        } else {
          setError("Aucune donnée trouvée pour demain.")
        }
      })
      .catch(err => {
        console.error("Erreur de chargement des statistiques:", err)
        setError("Impossible de charger les statistiques.")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [tomorrow])

  return (
    // Conteneur principal de la page, prenant toute la hauteur et largeur disponible.
    <div className="bg-gray-100 h-full w-full flex justify-center items-center ">
      {/* Grille principale Bento : 9 colonnes, 6 lignes, avec un gap de 3 */}
      <div className="grid grid-cols-9 grid-rows-6 h-full w-full gap-3">

        {/* Card 1 : Statistiques (remplace "remplace par statistique") */}
        <div className="row-span-3 col-span-3 bg-white shadow-md rounded-lg p-3 flex flex-col justify-center">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">
            Réservation de la semaine
          </h2>
          {loading ? (
            <div className="text-center text-gray-500 text-xs">Chargement des statistiques...</div>
          ) : error ? (
            <div className="text-center text-red-500 text-xs">{error}</div>
          ) : (
            <div className="flex flex-col space-y-1 text-xs">
              <p className="text-black font-semibold">
                Total : <span className="text-blue-700 text-lg font-bold">{stats.allCount}</span>
              </p>
              <p className="text-black font-semibold">
                Petit-déj : <span className="text-red-600 text-lg font-bold">{stats.petitDejCount}</span>
              </p>
              <p className="text-black font-semibold">
                Déj : <span className="text-blue-700 text-lg font-bold">{stats.lunchCount}</span>
              </p>
              <p className="text-black font-semibold">
                Dîner : <span className="text-red-600 text-lg font-bold">{stats.dinnerCount}</span>
              </p>
            </div>
          )}
        </div>

        {/* Card 2 : Historique (remplace "remplace par historique") */}
        <div className="row-span-3 bg-white col-span-3 shadow-md rounded-lg p-3 flex flex-col">
          
          <div className="flex-1"> {/* Permet au composant HistoryComponent de prendre l'espace */}
            <HistoryComponent />
          </div>
        </div>

        {/* Card 3 : Calendrier (remplace "remplace par calendrier") */}
        <div className="row-span-6 bg-white col-span-3 shadow-md rounded-lg p-3 flex flex-col">
          
          <div className="flex-1"> {/* Permet au composant CalendarComponent de prendre l'espace */}
            <CalendarComponent />
          </div>
        </div>

        {/* Card 4 : Graphique (remplace "remplace par Graphique des Réservations") */}
        <div className="row-span-3 bg-white col-span-4 shadow-md rounded-lg p-4 flex flex-col">
          
          <div className="flex-1"> {/* Permet au composant GraphComponent de prendre l'espace */}
            <GraphComponent />
          </div>
        </div>

        {/* Card 5 : Alertes (remplace "Remplace par alerte") */}
        <div className="row-span-3 col-span-2 bg-white shadow-md rounded-lg p-4 flex flex-col">
         
          <div className="flex-1"> {/* Permet au composant AlertComponent de prendre l'espace */}
            <AlertComponent />
          </div>
        </div>
      </div>
    </div>
  )
}