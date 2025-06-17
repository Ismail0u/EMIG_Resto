import React, { useEffect, useState } from 'react'
import { Calendar } from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { API } from '../../services/apiService'

export default function CalendarComponent() {
  const [reservations, setReservations] = useState([])
  const [periods, setPeriods] = useState({})
  const [date, setDate] = useState(new Date())
  const [error, setError] = useState(null)

  // 🔄 Chargement des données à l'initialisation
  useEffect(() => {
    // Récupération des réservations
    API.reservation.list()
      .then(res => setReservations(res.results))
      .catch(() => setError("❗ Impossible de charger les réservations."))

    // Récupération des périodes
    API.periode.list()
      .then(res => {
        const mapping = {}
        res.results.forEach(p => {
          mapping[p.id] = p.nomPeriode
        })
        setPeriods(mapping)
      })
      .catch(() => console.error("Erreur chargement des périodes"))
  }, [])

  // 📅 Filtrage des réservations du jour sélectionné
  const daily = reservations.filter(r =>
    new Date(r.date).toDateString() === date.toDateString()
  )

  // 🔄 Regroupement des réservations par période
  const byPeriod = daily.reduce((acc, r) => {
    acc[r.periode] = (acc[r.periode] || []).concat(r)
    return acc
  }, {})

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📆 Calendrier des Réservations</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded shadow">
          {error}
        </div>
      )}

      {/* 📅 Calendrier interactif */}
      <Calendar
        onChange={setDate}
        value={date}
        tileClassName={({ date: dt }) =>
          reservations.some(r => new Date(r.date).toDateString() === dt.toDateString())
            ? 'bg-green-100 font-bold'
            : ''
        }
        tileContent={({ date: dt }) =>
          reservations.some(r => new Date(r.date).toDateString() === dt.toDateString())
            ? <span className="text-green-600">●</span>
            : null
        }
        className="rounded-lg border-none shadow"
      />

      {/* 📋 Détails des réservations pour la date sélectionnée */}
      <div className="mt-6">
        <h3 className="font-semibold text-gray-700 mb-3">
          Réservations du {date.toLocaleDateString()}
        </h3>

        {Object.keys(byPeriod).length > 0 ? (
          Object.entries(byPeriod).map(([pid, list]) => (
            <div key={pid} className="mb-4 pl-4 border-l-4 border-green-300">
              <h4 className="font-medium text-green-800">
                🕒 Période : {periods[pid] || 'Inconnue'}
              </h4>
              <p className="text-sm text-gray-600">Total : {list.length}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">Aucune réservation pour cette date.</p>
        )}
      </div>
    </div>
  )
}
