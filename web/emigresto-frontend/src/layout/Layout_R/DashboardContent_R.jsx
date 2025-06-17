import React, { useEffect, useState } from 'react'
import { API } from '../../services/apiService'
import CalendarComponent from './CalendarComponent'
import GraphComponent from './GraphComponent'
import HistoryComponent from './HistoryComponent'

const joursSemaine = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
const getTodayName = () => joursSemaine[new Date().getDay()]

export default function DashboardContent_R() {
  const [stats, setStats] = useState({ allCount: 0, petitDejCount: 0, lunchCount: 0, dinnerCount: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const tomorrow = joursSemaine[(joursSemaine.indexOf(getTodayName()) + 1) % 7]

  // 📦 Récupération des stats pour le lendemain
  useEffect(() => {
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
        }
      })
      .catch(() => setError('❌ Erreur récupération stats'))
      .finally(() => setLoading(false))
  }, [tomorrow])

  if (loading) return <div className="p-4 text-gray-500">Chargement…</div>
  if (error) return <div className="p-4 text-red-600 bg-red-100 rounded">{error}</div>

  return (
    <div className="space-y-6">
      {/* 🔹 Première ligne : 3 cards sur 4 colonnes, la dernière occupe 2 colonnes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 📊 Statistiques */}
        <div className="bg-white shadow rounded-xl p-4 flex flex-col justify-center">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">
            Réservations pour <span className="font-bold text-primary">{tomorrow}</span>
          </h2>
          <p className="text-sm text-gray-600">Total : {stats.allCount}</p>
          <p className="text-sm text-gray-600">Petit-déj : {stats.petitDejCount}</p>
          <p className="text-sm text-gray-600">Déj : {stats.lunchCount}</p>
          <p className="text-sm text-gray-600">Dîner : {stats.dinnerCount}</p>
        </div>

        {/* 🕘 Historique */}
        <div className="bg-white shadow rounded-xl p-4 flex flex-col justify-center">
          <HistoryComponent />
        </div>

        {/* 📆 Calendrier – plus large (2 colonnes) */}
        <div className="bg-white shadow rounded-xl p-4 lg:col-span-2">
          <CalendarComponent />
        </div>
      </div>

      {/* 🔹 Deuxième ligne : Graphique centré sur 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-4">
        <div className="lg:col-start-2 lg:col-span-2">
          <div className="bg-white shadow rounded-xl p-4">
            <GraphComponent />
          </div>
        </div>
      </div>
    </div>
  )
}
