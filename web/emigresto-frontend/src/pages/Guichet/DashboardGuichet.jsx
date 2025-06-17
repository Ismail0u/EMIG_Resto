import React, { useEffect, useState } from 'react'
import AlertComponent from '../../layout/Layout_R/AlertComponent'
import CalendarComponent from '../../layout/Layout_R/CalendarComponent'
import GraphComponent from '../../layout/Layout_R/GraphComponent'
import HistoryComponent from '../../layout/Layout_R/HistoryComponent'
import { API } from '../../services/apiService'

const joursSemaine = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const getTodayName = () => joursSemaine[new Date().getDay()]

export default function Dashboard() {
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
            allCount: data.nbre_reserve_jour,
            petitDejCount: data.nbre_reserve_lendemain_petitDej,
            lunchCount: data.nbre_reserve_lendemain_dejeuner,
            dinnerCount: data.nbre_reserve_lendemain_diner,
          })
        } else {
          setStats({ allCount: 0, petitDejCount: 0, lunchCount: 0, dinnerCount: 0 })
        }
      })
      .catch(() => setError('❌ Erreur récupération stats'))
      .finally(() => setLoading(false))
  }, [tomorrow])

  return (
    <div className="space-y-8 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Zone d’alerte */}
      <AlertComponent />

      {/* Ligne 1 : 3 cards (la 3e plus large) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
              {/* Statistiques réservation demain */}
      <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition duration-300 p-6">
        <h2 className="text-lg font-extrabold text-black mb-4">
          Réservations pour <span className="text-blue-700">{tomorrow}</span>
        </h2>
        {loading && <p className="text-gray-400">Chargement…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && (
          <div className="space-y-3 text-base">
            <p className="text-black font-semibold">
              Total : <span className="text-blue-700 text-xl font-bold">{stats.allCount}</span>
            </p>
            <p className="text-black font-semibold">
              Petit-déj : <span className="text-red-600 text-xl font-bold">{stats.petitDejCount}</span>
            </p>
            <p className="text-black font-semibold">
              Déj : <span className="text-blue-700 text-xl font-bold">{stats.lunchCount}</span>
            </p>
            <p className="text-black font-semibold">
              Dîner : <span className="text-red-600 text-xl font-bold">{stats.dinnerCount}</span>
            </p>
          </div>
        )}
      </div>
        {/* Historique */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition duration-300 p-5">
          <HistoryComponent />
        </div>

        {/* Graphique sur 2 colonnes */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition duration-300 p-5 md:col-span-2 lg:col-span-2">
          <GraphComponent />
        </div>
      </div>

      {/* Ligne 2 : Calendrier centré sur 2 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-4">
        <div className="md:col-start-2 md:col-span-2">
          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition duration-300 p-5">
            <CalendarComponent />
          </div>
        </div>
      </div>
    </div>
  )
}
