// src/layout/Layout_R/CalendarComponent.jsx
import React, { useEffect, useState } from 'react'
import { Calendar } from 'react-calendar'
import 'react-calendar/dist/Calendar.css' // S'assurer que le CSS du calendrier est bien importé
import { API } from '../../services/apiService'

export default function CalendarComponent() {
  const [reservations, setReservations] = useState([])
  const [periods, setPeriods] = useState({})
  const [date, setDate] = useState(new Date())
  const [error, setError] = useState(null)

  // 🔄 Chargement des données à l'initialisation
  useEffect(() => {
    API.reservation.list()
      .then(res => setReservations(res.results))
      .catch(() => setError("❗ Impossible de charger les réservations."))

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
    acc[r.periode] = (acc[r.periode] || [])
    acc[r.periode].push(r)
    return acc
  }, {})

  return (
    <div className="flex flex-col h-full overflow-hidden"> {/* Ajout de overflow-hidden ici */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded shadow">
          {error}
        </div>
      )}

      {/* 📅 Calendrier interactif */}
      <div className="mb-4 flex-shrink-0">
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
          className="rounded-lg border-none shadow w-full smaller-calendar" // Ajout de 'smaller-calendar'
          // maxDetail="month" // Optionnel: Limite la vue à la sélection de mois
          // next2Label={null} // Masque les flèches "année suivante"
          // prev2Label={null} // Masque les flèches "année précédente"
        />
      </div>

      {/* Styles CSS spécifiques pour rendre le calendrier plus petit */}
      <style jsx>{`
        /* Réduction de la taille générale du calendrier */
        .smaller-calendar {
          font-size: 0.75rem; /* Réduit la taille de police globale */
        }
        /* Réduction du padding des cellules de jour */
        .smaller-calendar .react-calendar__tile {
          padding: 0.25em 0.5em; /* Padding réduit */
        }
        /* Ajustement des entêtes des jours de la semaine */
        .smaller-calendar .react-calendar__month-view__weekdays__weekday abbr {
          text-decoration: none; /* Enlève le soulignement sur les abréviations */
          font-size: 0.65rem; /* Encore plus petit pour les jours de la semaine */
          font-weight: bold;
        }
        /* Ajustement des titres de navigation */
        .smaller-calendar .react-calendar__navigation button {
          font-size: 0.8rem; /* Taille de police pour les boutons de navigation (mois/année) */
          min-width: 2em; /* Réduit la largeur minimale des boutons de navigation */
        }
        /* Espacement entre les mois/années dans la navigation */
        .smaller-calendar .react-calendar__navigation__label {
            font-size: 0.8rem;
        }
        /* Ajuster les marges pour les flèches de navigation */
        .smaller-calendar .react-calendar__navigation button.react-calendar__navigation__arrow {
            padding: 0.2em; /* Réduit le padding des flèches */
        }
      `}</style>

      {/* 📋 Détails des réservations pour la date sélectionnée */}
      <div className="mt-6 flex-1 overflow-y-auto pr-2 text-sm"> {/* text-sm pour réduire la taille du texte ici */}
        <h3 className="font-semibold text-gray-700 mb-3 text-base"> {/* Taille de titre ajustée */}
          Réservations du {date.toLocaleDateString()}
        </h3>

        {Object.keys(byPeriod).length > 0 ? (
          Object.entries(byPeriod).map(([pid, list]) => (
            <div key={pid} className="mb-2 pl-3 border-l-3 border-green-300"> {/* mb-2 et pl-3 réduits */}
              <h4 className="font-medium text-green-800 text-sm"> {/* Taille de titre de période ajustée */}
                🕒 Période {periods[pid] || pid}
              </h4>
              <ul className="list-disc pl-4 text-xs"> {/* pl-4 et text-xs pour les éléments de liste */}
                {list.map(r => (
                  <li key={r.id}>
                    {r.etudiant?.nom} {r.etudiant?.prenom} ({r.etudiant?.matricule}) - {r.statut}
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-xs">Aucune réservation pour cette date.</p>
        )}
      </div>
    </div>
  )
}