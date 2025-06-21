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
  const [loading, setLoading] = useState(true); // Added loading state

  // 🔄 Chargement des données à l'initialisation
  useEffect(() => {
    setLoading(true); // Start loading
    setError(null);    // Reset errors

    // Fetch all relevant reservations (assuming page_size might be needed for many)
    Promise.all([
      API.reservation.list({ page_size: 1000 }), // Ensure all reservations are fetched
      API.periode.list() // Fetch periods
    ])
      .then(([resReservations, resPeriodes]) => {
        setReservations(resReservations.results);
        const mapping = {};
        resPeriodes.results.forEach(p => {
          mapping[p.id] = p.nomPeriode;
        });
        setPeriods(mapping);
        setLoading(false); // End loading
      })
      .catch((err) => {
        setError("❗ Impossible de charger les données du calendrier.");
        console.error("CalendarComponent fetch error:", err);
        setLoading(false); // End loading on error
      });
  }, [])

  // 📅 Filtrage des réservations du jour sélectionné
  const daily = reservations.filter(r =>
    new Date(r.date).toDateString() === date.toDateString()
  );

  // Calcul des totaux par type de repas pour la date sélectionnée (DAILY reservations)
  const totalsByMealType = daily.reduce((acc, r) => {
    // Check if r.periode exists and has an id.
    // r.periode is expected to be an object: {id: ..., nomPeriode: ...}
    if (r.periode && r.periode.id) {
        // Use the ID to get the name from the 'periods' mapping you created,
        // or directly use r.periode.nomPeriode if available and reliable.
        // Using periods[r.periode.id] is safer if r.periode.nomPeriode might be missing or inconsistent.
        const periodeName = periods[r.periode.id];

        if (periodeName) { // Make sure the period name was found
            const lowerCasePeriodeName = periodeName.toLowerCase();
            if (lowerCasePeriodeName.includes('petit-déjeuner')) {
                acc.petitDej = (acc.petitDej || 0) + 1;
            } else if (lowerCasePeriodeName.includes('déjeuner')) {
                acc.dejeuner = (acc.dejeuner || 0) + 1;
            } else if (lowerCasePeriodeName.includes('diner')) {
                acc.diner = (acc.diner || 0) + 1;
            }
        }
    }
    return acc;
  }, { petitDej: 0, dejeuner: 0, diner: 0 });

  // 🔄 Regroupement des réservations par période pour l'affichage détaillé
  const byPeriod = daily.reduce((acc, r) => {
    // Ensure r.periode is an object and has an ID
    if (r.periode && r.periode.id) {
        acc[r.periode.id] = (acc[r.periode.id] || []);
        acc[r.periode.id].push(r);
    }
    return acc;
  }, {});

  // Add loading screen
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Chargement du calendrier...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
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

      {/* Vos styles CSS spécifiques pour rendre le calendrier plus petit - PRÉSERVÉS */}
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

      {/* Détails des réservations pour la date sélectionnée */}
      {/* Les classes de taille de texte Tailwind sont conservées comme dans votre version */}
      <div className=" flex-1 overflow-y-auto pr-2 text-xs">
        <h3 className="font-semibold text-gray-700 text-sm mb-4">
          Réservations du {date.toLocaleDateString()}
        </h3>

        {/* Affichage du récapitulatif des totaux */}
        {daily.length > 0 ? (
          <div className="mb-4 p-3 bg-blue-50 rounded-md mt-2">
            <h4 className="font-semibold text-blue-800 text-xs mb-2">Récapitulatif des réservations:</h4>
            <p className="text-gray-700 text-base">
              Petit-déjeuner: <span className="font-bold">{totalsByMealType.petitDej}</span>
            </p>
            <p className="text-gray-700 text-base">
              Déjeuner: <span className="font-bold">{totalsByMealType.dejeuner}</span>
            </p>
            <p className="text-gray-700 text-base">
              Dîner: <span className="font-bold">{totalsByMealType.diner}</span>
            </p>
          </div>
        ) : (
          <p className="p-3 text-gray-500 text-xs">Aucune réservation pour cette date.</p>
        )}

       
        
      </div>
    </div>
  )
}