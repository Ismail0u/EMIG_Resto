// src/layout/Layout_R/CalendarComponent.jsx
import React, { useEffect, useState } from 'react'
import { Calendar } from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { API } from '../../services/apiService'
import { FaCoffee, FaUtensils, FaMoon } from 'react-icons/fa'

export default function CalendarComponent() {
  const [reservations, setReservations] = useState([])
  const [periods, setPeriods] = useState({})
  const [date, setDate] = useState(new Date())
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError(null)

    Promise.all([
      API.reservation.list({ page_size: 1000 }),
      API.periode.list({ page_size: 50 }),
    ])
      .then(([res1, res2]) => {
        setReservations(res1.results)
        const map = {}
        res2.results.forEach(p => {
          map[p.id] = p.nomPeriode
        })
        setPeriods(map)
        setLoading(false)
      })
      .catch((err) => {
        setError("❗ Impossible de charger les données du calendrier.")
        console.error(err)
        setLoading(false)
      })
  }, [])

  const daily = reservations.filter(r =>
    new Date(r.date).toDateString() === date.toDateString()
  )

  const totals = daily.reduce((acc, r) => {
    const nom = periods[r.periode?.id]
    const lower = nom?.toLowerCase() || ''
    if (lower.includes('petit')) acc.petitDej = (acc.petitDej || 0) + 1
    else if (lower.includes('déjeuner')) acc.dejeuner = (acc.dejeuner || 0) + 1
    else if (lower.includes('diner') || lower.includes('dîner')) acc.diner = (acc.diner || 0) + 1
    return acc
  }, { petitDej: 0, dejeuner: 0, diner: 0 })

  const byPeriod = daily.reduce((acc, r) => {
    const pid = r.periode?.id
    if (!pid) return acc
    acc[pid] = acc[pid] || []
    acc[pid].push(r)
    return acc
  }, {})

  const getIcon = (name) => {
    const n = name?.toLowerCase()
    if (n?.includes('petit')) return <FaCoffee className="inline mr-1 text-yellow-600" />
    if (n?.includes('déjeuner')) return <FaUtensils className="inline mr-1 text-green-600" />
    if (n?.includes('diner') || n?.includes('dîner')) return <FaMoon className="inline mr-1 text-purple-600" />
    return null
  }

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-gray-500">Chargement du calendrier...</div>
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded shadow">
          {error}
        </div>
      )}

      {/* 📅 Calendrier */}
      <div className="mb-4 flex-shrink-0">
        <Calendar
          onChange={setDate}
          value={date}
          locale="fr-FR"
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
          className="rounded-lg border-none shadow w-full smaller-calendar"
        />
      </div>

      {/* Style réduit du calendrier */}
      <style jsx>{`
        .smaller-calendar {
          font-size: 0.75rem;
        }
        .smaller-calendar .react-calendar__tile {
          padding: 0.25em 0.5em;
        }
        .smaller-calendar .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none;
          font-size: 0.65rem;
          font-weight: bold;
        }
        .smaller-calendar .react-calendar__navigation button {
          font-size: 0.8rem;
          min-width: 2em;
        }
        .smaller-calendar .react-calendar__navigation__label {
          font-size: 0.8rem;
        }
        .smaller-calendar .react-calendar__navigation button.react-calendar__navigation__arrow {
          padding: 0.2em;
        }
      `}</style>

      {/* 🔎 Détails du jour sélectionné */}
      <div className="flex-1 overflow-y-auto pr-2 text-xs">
        <h3 className="font-semibold text-gray-700 text-sm mb-3">
          Réservations du {date.toLocaleDateString()}
        </h3>

        {daily.length > 0 ? (
          <>
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <h4 className="font-semibold text-blue-800 text-xs mb-2">Récapitulatif :</h4>
              <ul className="space-y-1 text-sm">
                <li>🍞 Petit-déjeuner : <span className="font-bold">{totals.petitDej}</span></li>
                <li>🥗 Déjeuner : <span className="font-bold">{totals.dejeuner}</span></li>
                <li>🌙 Dîner : <span className="font-bold">{totals.diner}</span></li>
              </ul>
            </div>

            {/* 🔄 Réservations par période */}
            {Object.entries(byPeriod).map(([pid, list]) => (
              <div key={pid} className="mb-3">
                <h4 className="font-semibold text-indigo-600 text-sm mb-1">
                  {getIcon(periods[pid])} {periods[pid]} ({list.length})
                </h4>
                <ul className="ml-4 list-disc text-gray-700 text-sm">
                  {list.map(r => (
                    <li key={r.id}>
                      {r.reservant_pour?.nom} {r.reservant_pour?.prenom} ({r.reservant_pour?.matricule})
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        ) : (
          <p className="text-gray-500 text-sm">Aucune réservation pour cette date.</p>
        )}
      </div>
    </div>
  )
}
