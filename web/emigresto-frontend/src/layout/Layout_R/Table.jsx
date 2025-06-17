import { Check, X } from "lucide-react";
import React from "react";

const Table = ({ etudiants, jours, periodes, reservations, handleReservationToggle, handleToggleAll, handleKeyDown, getReservationDate }) => {
  const today = new Date();
  const datesParJour = React.useMemo(() => {
    return jours.reduce((acc, jour) => {
      acc[jour.id] = new Date(getReservationDate(jour.id));
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
    />
  );

  return (
    <table className="min-w-full border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th rowSpan="2" className="border px-4 py-2">ID</th>
          <th rowSpan="2" className="border px-4 py-2">Nom</th>
          <th rowSpan="2" className="border px-4 py-2">Prénom</th>
          <th rowSpan="2" className="border px-4 py-2 text-center">Tout cocher</th>
          {jours.map(jour => (
            <th key={jour.id} colSpan={periodes.length} className="border px-4 py-2 text-center">
              {jour.nomJour}
            </th>
          ))}
        </tr>
        <tr className="bg-gray-100">
          {jours.map(jour =>
            periodes.map(periode => (
              <th key={`${jour.id}-${periode.id}`} className="border px-4 py-2 text-center">
                {periode.id}
              </th>
            ))
          )}
        </tr>
      </thead>
      <tbody>
        {etudiants.map(etudiant => {
          const studentReservations = reservations.get(etudiant.id) || new Map();

          const allChecked = jours.every(jour =>
            periodes.every(periode => studentReservations.get(`${jour.id}-${periode.id}`))
          );

          return (
            <tr key={etudiant.id}>
              <td className="border px-4 py-2">{etudiant.id}</td>
              <td className="border px-4 py-2">{etudiant.nom}</td>
              <td className="border px-4 py-2">{etudiant.prenom}</td>
              <td className="border px-4 py-2 text-center">
                <button
                  title={allChecked ? "Tout décocher" : "Tout cocher"}
                  className={`p-2 rounded ${allChecked ? "bg-red-500" : "bg-green-500"}`}
                  onClick={() => handleToggleAll(etudiant.id)}
                >
                  {allChecked ? <X size={14} color="white" /> : <Check size={14} color="white" />}
                </button>
              </td>

              {jours.map(jour =>
                periodes.map(periode => {
                  const key = `${jour.id}-${periode.id}`;
                  const isReserved = studentReservations.get(key) || false;
                  const isPast = datesParJour[jour.id] < today;

                  return (
                    <td key={`${etudiant.id}-${key}`} className="border px-4 py-2 text-center">
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
