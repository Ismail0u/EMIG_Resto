// src/layout/Layout_R/Table.jsx (Assurez-vous que le chemin est correct)

import { Check, X } from "lucide-react";
import React from "react";

const Table = ({ etudiants, jours, periodes, reservations, handleReservationToggle, handleToggleAll, handleKeyDown, getReservationDate }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Important: Comparer les dates sans l'heure

  const datesParJour = React.useMemo(() => {
    return jours.reduce((acc, jour) => {
      // getReservationDate(jour.id) retourne une date au format YYYY-MM-DD
      // Nous la convertissons en objet Date et mettons l'heure à 00:00:00 pour la comparaison
      const dateForJour = new Date(getReservationDate(jour.id));
      dateForJour.setHours(0, 0, 0, 0);
      acc[jour.id] = dateForJour;
      return acc;
    }, {});
  }, [jours, getReservationDate]);

  const renderCheckbox = (etudiantId, jour, periode, isPast, isReserved) => (
    <input
      aria-label={`Réservation pour étudiant ${etudiantId} le ${jour.nomJour} période ${periode.id}`}
      type="checkbox"
      checked={isReserved}
      disabled={isPast}
      onChange={() => !isPast && handleReservationToggle(etudiantId, jour.id, periode.id)}
      onKeyDown={(e) => !isPast && handleKeyDown(e, etudiantId, jour.id, periode.id)}
      tabIndex={0}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" // Ajout de classes Tailwind pour un style plus propre
    />
  );

  return (
    <table className="min-w-full border border-gray-300 table-fixed">
      <thead>
        <tr className="bg-gray-100">
          <th rowSpan="2" className="border px-2 py-2 w-[5%] text-xs">ID</th>
          <th rowSpan="2" className="border px-2 py-2 w-[15%] text-xs">Nom & Prénom</th>
          <th rowSpan="2" className="border px-2 py-2 w-[5%] text-xs">Tout</th>
          {/* En-têtes pour les jours, avec colspan pour englober les périodes */}
          {jours.map(jour => {
            const isPastDay = datesParJour[jour.id] < today;
            const headerClass = isPastDay ? "bg-gray-200 text-gray-500" : "";
            return (
              <th
                key={jour.id}
                colSpan={periodes.length}
                className={`border px-2 py-2 text-center text-xs ${headerClass}`}
              >
                {jour.nomJour.substring(0, 3)} {/* Garde les 3 premières lettres pour les jours */}
              </th>
            );
          })}
        </tr>
        <tr className="bg-gray-100">
          {/* En-têtes pour les périodes (se répètent pour chaque jour) */}
          {jours.map(jour =>
            periodes.map(periode => {
              const isPastDay = datesParJour[jour.id] < today;
              const headerClass = isPastDay ? "bg-gray-200 text-gray-500" : "";
              return (
                <th key={`${jour.id}-${periode.id}`} className={`border px-1 py-1 text-center text-xs ${headerClass}`}>
                  {periode.id} {/* MODIFICATION ICI : Affichage de l'ID de la période */}
                </th>
              );
            })
          )}
        </tr>
      </thead>
      <tbody>
        {etudiants.map(etudiant => {
          const studentReservations = reservations.get(etudiant.id) || new Map();
          const allChecked = jours.every(jour =>
            periodes.every(periode =>
              studentReservations.has(`${jour.id}-${periode.id}`)
            )
          );

          return (
            <tr key={etudiant.id}>
              <td className="border px-2 py-1 text-xs">{etudiant.id}</td>
              <td className="border px-2 py-1 text-xs">{etudiant.nom} {etudiant.prenom}</td>
              <td className="border px-2 py-1 text-center">
                <button
                  title={allChecked ? "Tout décocher" : "Tout cocher"}
                  className={`p-1 rounded text-white ${allChecked ? "bg-red-500" : "bg-green-500"} text-xs`}
                  onClick={() => handleToggleAll(etudiant.id)}
                >
                  {allChecked ? <X size={10} /> : <Check size={10} />}
                </button>
              </td>

              {jours.map(jour =>
                periodes.map(periode => {
                  const key = `${jour.id}-${periode.id}`;
                  const isReserved = studentReservations.has(key);
                  const isPast = datesParJour[jour.id] < today;

                  return (
                    <td key={`${etudiant.id}-${key}`} className="border px-1 py-1 text-center">
                      {renderCheckbox(etudiant.id, jour, periode, isPast, isReserved)}
                    </td>
                  );
                })
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Table;