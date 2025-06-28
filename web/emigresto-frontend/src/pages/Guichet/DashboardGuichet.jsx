// src/pages/DashboardGuichet.jsx
import React, { useEffect, useState } from 'react'
import AlertComponent from '../../layout/Layout_R/AlertComponent'
import CalendarComponent from '../../layout/Layout_R/CalendarComponent'
import GraphComponent from '../../layout/Layout_R/GraphComponent'
import HistoryComponent from '../../layout/Layout_R/HistoryComponent'
import { API } from '../../services/apiService'

const joursSemaine = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const getTodayName = () => joursSemaine[new Date().getDay()]

export default function Dashboard() {
  const [stats, setStats] = useState({
    allCount: 0,
    petitDejCount: 0,
    lunchCount: 0,
    dinnerCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // tomorrow is used to find the specific 'Jour' object.
  const tomorrow = joursSemaine[(joursSemaine.indexOf(getTodayName()) + 1) % 7]

  useEffect(() => {
    setLoading(true)
    setError(null)
    API.jour
      .list()
      .then(res => {
        console.log("Données brutes de l'API Jour:", res.results);

        // We still need to find a 'Jour' object to access the weekly methods on the serializer.
        // It doesn't strictly matter WHICH day of the week's 'Jour' object we pick,
        // as the weekly calculations are static and independent of a specific 'Jour' instance.
        // For simplicity, we can just take the first one, or still use 'tomorrow'.
        const anyJourData = res.results.find(j => j.nomJour === tomorrow) || res.results[0]; // Fallback to first if tomorrow is not found

        console.log(`Données du Jour utilisées pour les stats hebdomadaires (e.g., '${anyJourData?.nomJour || "N/A"}'):`, anyJourData);

        if (anyJourData) {
          setStats({
            // Use the NEW weekly fields from the API response
            allCount: anyJourData.weekly_total_reservations || 0,
            petitDejCount: anyJourData.weekly_petit_dej_reservations || 0,
            lunchCount: anyJourData.weekly_dejeuner_reservations || 0,
            dinnerCount: anyJourData.weekly_diner_reservations || 0
          })

          console.log("État 'stats' mis à jour (Stats hebdomadaires):", {
            allCount: anyJourData.weekly_total_reservations || 0,
            petitDejCount: anyJourData.weekly_petit_dej_reservations || 0,
            lunchCount: anyJourData.weekly_dejeuner_reservations || 0,
            dinnerCount: anyJourData.weekly_diner_reservations || 0
          });

        } else {
          setError("Aucune donnée de jour disponible. Les statistiques hebdomadaires ne peuvent pas être chargées.")
          console.log("Aucune donnée de jour n'a pu être trouvée.");
        }
      })
      .catch(err => {
        console.error("Erreur de chargement des statistiques:", err)
        setError("Impossible de charger les statistiques hebdomadaires.")
      })
      .finally(() => {
        setLoading(false)
      })
  }, [tomorrow])

  return (
    <div className="bg-gray-100 h-full w-full flex justify-center items-center ">
      <div className="grid grid-cols-9 grid-rows-6 h-full w-full gap-3">

        {/* Card 1 : Statistiques */}
        <div className="row-span-3 col-span-3 bg-white shadow-md rounded-lg p-3 flex flex-col justify-center">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">
            Réservations de la Semaine Courante
          </h2> {/* Updated title */}
          {loading ? (
            <div className="text-center text-gray-500 text-xs">Chargement des statistiques hebdomadaires...</div>
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

        {/* Card 2 : Historique */}
        <div className="row-span-3 bg-white col-span-3 shadow-md rounded-lg p-3 flex flex-col overflow-hidden">
          <div className="flex-1">
            <HistoryComponent />
          </div>
        </div>

        {/* Card 3 : Calendrier */}
        <div className="row-span-6 bg-white col-span-3 shadow-md rounded-lg p-3 flex flex-col overflow-hidden">
          <div className="flex-1">
            <CalendarComponent />
          </div>
        </div>

        {/* Card 4 : Graphique */}
        <div className="row-span-3 bg-white col-span-4 shadow-md rounded-lg p-4 flex flex-col">
          <div className="flex-1">
            <GraphComponent />
          </div>
        </div>

        {/* Card 5 : Alertes */}
        <div className="row-span-3 col-span-2 bg-white shadow-md rounded-lg p-4 flex flex-col">
            <h2 className="text-sm font-semibold mb-2">Alertes</h2> {/* Add a title for the alert panel */}
            {/* The flex-1 ensures it takes available space. overflow-y-auto makes it scrollable. */}
            {/* max-h-full is used here to ensure it respects the parent's height constraint from row-span-3. */}
            <div className="flex-1 overflow-y-auto max-h-full">
                <AlertComponent />
            </div>
        </div>
      </div>
    </div>
  )
}