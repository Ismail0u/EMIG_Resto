import React from 'react'

const DataTable_R = ({ etudiants, jours, periodes, reservations, onCheckboxToggle, handleKeyDown }) => {
  return (
    <table className="w-full table-fixed border border-gray-300 text-sm">
      {/* En-tête du tableau */}
      <thead className="bg-gray-100">
        <tr>
          {/* En-tête fixe pour chaque étudiant */}
          <th rowSpan="2" className="border p-2 font-medium">ID</th>
          <th rowSpan="2" className="border p-2 font-medium">Nom</th>
          <th rowSpan="2" className="border p-2 font-medium">Prénom</th>

          {/* En-tête des jours, chaque jour prend autant de colonnes que de périodes */}
          {jours.map((jour, i) => (
            <th
              key={jour.id}
              colSpan={periodes.length}
              className={`border p-2 text-center font-medium ${i > 0 ? 'border-l-4 border-gray-400' : ''}`}
            >
              {jour.nomJour}
            </th>
          ))}
        </tr>

        <tr>
          {/* En-tête des périodes sous chaque jour */}
          {jours.flatMap((jour, i) =>
            periodes.map(periode => (
              <th
                key={`${jour.id}-${periode.id}`}
                className={`border p-2 text-center font-normal ${i > 0 ? 'border-l-4 border-gray-400' : ''}`}
              >
                {periode.nomPeriode}
              </th>
            ))
          )}
        </tr>
      </thead>

      {/* Corps du tableau */}
      <tbody>
        {etudiants.map(etudiant => (
          <tr key={etudiant.id} className="even:bg-gray-50">
            {/* Infos de base étudiant */}
            <td className="border p-2 text-center">{etudiant.id}</td>
            <td className="border p-2">{etudiant.nom}</td>
            <td className="border p-2">{etudiant.prenom}</td>

            {/* Cellules des réservations (checkbox) pour chaque jour et période */}
            {jours.flatMap(jour =>
              periodes.map(periode => {
                const key = `${jour.id}-${periode.id}`
                const isChecked = !!reservations.get(etudiant.id)?.get(key)

                return (
                  <td key={key} className="border p-2 text-center">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onCheckboxToggle(etudiant.id, jour.id, periode.id)}
                      onKeyDown={e => handleKeyDown(e, etudiant.id, jour.id, periode.id)}
                      tabIndex={0}
                      className="cursor-pointer w-4 h-4"
                    />
                  </td>
                )
              })
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default DataTable_R
