// src/components/Reservations/Reservation.jsx ou src/pages/Reservation.jsx (selon votre structure)

import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Pagination from "../../layout/Layout_R/Pagination";
import SearchSortExport from "../../layout/Layout_R/SearchSortExport";
import Table from "../../layout/Layout_R/Table"; // Assuming this is your DataTable component
import useReservationsData from "../../hooks/useReservationsData";

export default function Reservation() {
  const {
    etudiants,
    jours,
    periodes,
    reservationsMap,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    page,
    totalPages,
    setPage,
    exportToPDF, // This now comes from the hook
    toggleReservation, // This now comes from the hook
    toggleAllForStudent, // This now comes from the hook
    handleKeyDown,
    getReservationDate,
  } = useReservationsData();

  if (loading) {
    return <div className="text-center py-10">Chargement des données...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 text-center">
        Erreur de chargement: {error.message || error}
      </div>
    );
  }

 
  return (
    <>
      <SearchSortExport
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy} // Passer sortBy pour que le composant SearchSortExport puisse l'afficher
        setSortBy={setSortBy}
        exportToPDF={exportToPDF}
      />

      <div className="overflow-x-auto w-full">
        <Table
          etudiants={etudiants} // `etudiants` ici est déjà paginé et trié par le hook
          jours={jours}
          periodes={periodes}
          reservations={reservationsMap} // C'est la Map des réservations du hook
          handleReservationToggle={toggleReservation} // La fonction du hook
          handleToggleAll={toggleAllForStudent} // La fonction du hook
          handleKeyDown={handleKeyDown}
          getReservationDate={getReservationDate}
        />
      </div>

     
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          setCurrentPage={setPage}
        />
      
    </>
  );
}