// src/pages/Guichet/StudentList.jsx

import { useQuery } from '@tanstack/react-query'
import React, { useState, useMemo } from 'react'
import Spinner from '../../components/Spinner'
import { API } from '../../services/apiService'
import SearchSortExport from '../../layout/Layout_R/SearchSortExport'
import Pagination from '../../layout/Layout_R/Pagination'
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function StudentList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['etudiants'],
    queryFn: () => API.etudiant.list({ page_size: 1000 }),
  })

  const filteredAndSortedEtudiants = useMemo(() => {
    if (!data?.results) return [];

    let currentEtudiants = [...data.results];

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentEtudiants = currentEtudiants.filter(e =>
        String(e.id).includes(lowerCaseSearchTerm) ||
        e.matricule.toLowerCase().includes(lowerCaseSearchTerm) ||
        e.full_name.toLowerCase().includes(lowerCaseSearchTerm) ||
        e.email.toLowerCase().includes(lowerCaseSearchTerm) ||
        e.telephone.includes(lowerCaseSearchTerm)
      );
    }

    if (sortBy) {
      currentEtudiants.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (typeof aValue === 'string') {
          return aValue.localeCompare(bValue);
        }
        return aValue - bValue;
      });
    }
    return currentEtudiants;
  }, [data?.results, searchTerm, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedEtudiants.length / rowsPerPage);
  const paginatedEtudiants = filteredAndSortedEtudiants.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const exportPDF = () => {
    const pdf = new jsPDF("landscape");
    pdf.text("Liste des Étudiants", 14, 10);

    const head = [
      "ID",
      "Matricule",
      "Nom & Prénom",
      "Email",
      "Téléphone",
      "Sexe",
      "Solde (FCFA)",
      "Tickets Restants",
    ];

    const body = filteredAndSortedEtudiants.map((e) => [
      e.id,
      e.matricule,
      e.full_name,
      e.email,
      e.telephone,
      e.sexe,
      Number(e.solde || 0).toFixed(2),
      e.ticket_quota,
    ]);

    pdf.autoTable({ head: [head], body: body, startY: 20 });
    pdf.save("Liste_Etudiants.pdf");
  };

  if (isLoading) return <Spinner />

  if (isError)
    return (
      <div className="text-red-600 p-4 font-medium">
        Erreur de chargement : {error?.message || 'Une erreur est survenue.'}
      </div>
    )

  // Cas où il n'y a aucun étudiant après filtrage ou pas d'étudiants du tout
  // On affiche quand même SearchSortExport et Pagination pour la cohérence
  const noStudentsFound = !data?.results?.length;
  const noFilteredStudents = !paginatedEtudiants.length && searchTerm;


  return (
    <>
      <SearchSortExport
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setSortBy={setSortBy}
        exportToPDF={exportPDF}
        inputClass="p-1 text-sm"
        buttonClass="px-2 py-1 text-sm"
      />

      {noFilteredStudents ? (
         <div className="p-4 text-gray-600 italic text-center">
            Aucun étudiant trouvé pour la recherche "{searchTerm}".
        </div>
      ) : noStudentsFound ? (
        <div className="p-4 text-gray-600 italic text-center">
            Aucun étudiant trouvé.
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg">
          <table
            className="min-w-full border border-gray-300 table-fixed"
            aria-label="Liste des étudiants"
          >
            {/* En-tête de la table */}
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-2 text-left font-semibold w-[5%] text-xs cursor-pointer" onClick={() => setSortBy('id')}>ID</th>
                <th className="border px-2 py-2 text-left font-semibold w-[10%] text-xs cursor-pointer" onClick={() => setSortBy('matricule')}>Matricule</th>
                <th className="border px-2 py-2 text-left font-semibold w-[20%] text-xs cursor-pointer" onClick={() => setSortBy('full_name')}>Nom & Prénom</th>
                <th className="border px-2 py-2 text-left font-semibold w-[20%] text-xs cursor-pointer" onClick={() => setSortBy('email')}>Email</th>
                <th className="border px-2 py-2 text-left font-semibold w-[10%] text-xs cursor-pointer" onClick={() => setSortBy('telephone')}>Téléphone</th>
                <th className="border px-2 py-2 text-left font-semibold w-[5%] text-xs cursor-pointer" onClick={() => setSortBy('sexe')}>Sexe</th>
                <th className="border px-2 py-2 text-right font-semibold w-[15%] text-xs cursor-pointer" onClick={() => setSortBy('solde')}>Solde (FCFA)</th>
                <th className="border px-2 py-2 text-right font-semibold w-[15%] text-xs cursor-pointer" onClick={() => setSortBy('ticket_quota')}>
                  Tickets Restants
                </th>
              </tr>
            </thead>

            {/* Corps de la table */}
            <tbody>
              {paginatedEtudiants.map((etu) => (
                <tr
                  key={etu.id}
                  className="even:bg-gray-50 hover:bg-blue-50 transition-colors"
                >
                  <td className="border px-2 py-1 text-xs">{etu.id}</td>
                  <td className="border px-2 py-1 text-xs">{etu.matricule}</td>
                  <td className="border px-2 py-1 text-xs">{etu.full_name}</td>
                  <td className="border px-2 py-1 text-xs">{etu.email}</td>
                  <td className="border px-2 py-1 text-xs">{etu.telephone}</td>
                  <td className="border px-2 py-1 text-xs">{etu.sexe}</td>
                  <td className="border px-2 py-1 text-right text-xs">
                    {Number(etu.solde || 0).toFixed(2)}
                  </td>
                  <td className="border px-2 py-1 text-right text-xs">{etu.ticket_quota}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODIFICATION ICI : Affichage inconditionnel de la pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        buttonClass="px-2 py-1 text-sm"
      />
    </>
  )
}