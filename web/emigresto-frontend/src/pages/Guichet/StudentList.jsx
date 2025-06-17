// src/pages/Guichet/StudentList.jsx
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import Spinner from '../../components/Spinner'
import { API } from '../../services/apiService'

export default function StudentList() {
  // 1) Récupération des étudiants via React Query
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['etudiants'],
    queryFn: () => API.etudiant.list({ page_size: 1000 }),
  })

  // 2) Affichage d'un loader pendant le chargement
  if (isLoading) return <Spinner />

  // 3) Gestion des erreurs
  if (isError)
    return (
      <div className="text-red-600 p-4 font-medium">
        Erreur de chargement : {error?.message || 'Une erreur est survenue.'}
      </div>
    )

  // 4) Cas où il n'y a aucun étudiant
  if (!data?.results?.length)
    return (
      <div className="p-4 text-gray-600 italic text-center">
        Aucun étudiant trouvé.
      </div>
    )

  return (
    <div className="bg-white shadow-md rounded-lg overflow-auto max-h-[75vh]">
      <table
        className="min-w-full table-auto border-collapse"
        aria-label="Liste des étudiants"
      >
        {/* En-tête de la table */}
        <thead className="bg-gray-100 border-b border-gray-300">
          <tr>
            <th className="px-4 py-2 text-left font-semibold">ID</th>
            <th className="px-4 py-2 text-left font-semibold">Matricule</th>
            <th className="px-4 py-2 text-left font-semibold">Nom complet</th>
            <th className="px-4 py-2 text-left font-semibold">Prénom</th>
            <th className="px-4 py-2 text-left font-semibold">Email</th>
            <th className="px-4 py-2 text-left font-semibold">Téléphone</th>
            <th className="px-4 py-2 text-left font-semibold">Sexe</th>
            <th className="px-4 py-2 text-right font-semibold">Solde (FCFA)</th>
            <th className="px-4 py-2 text-right font-semibold">
              Tickets restants
            </th>
          </tr>
        </thead>

        {/* Corps de la table */}
        <tbody>
          {data.results.map((etu) => (
            <tr
              key={etu.id}
              className="even:bg-gray-50 hover:bg-blue-50 transition-colors"
            >
              <td className="px-4 py-2">{etu.id}</td>
              <td className="px-4 py-2">{etu.matricule}</td>
              <td className="px-4 py-2">{etu.full_name}</td>
              <td className="px-4 py-2">{etu.prenom}</td>
              <td className="px-4 py-2">{etu.email}</td>
              <td className="px-4 py-2">{etu.telephone}</td>
              <td className="px-4 py-2">{etu.sexe}</td>
              <td className="px-4 py-2 text-right">
                {Number(etu.solde || 0).toFixed(2)}
              </td>
              <td className="px-4 py-2 text-right">{etu.ticket_quota}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
