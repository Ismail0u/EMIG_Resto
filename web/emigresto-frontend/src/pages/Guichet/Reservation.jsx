import jsPDF from "jspdf";
import "jspdf-autotable";
import React, { useEffect, useState } from "react";
import Pagination from "../../layout/Layout_R/Pagination";
import SearchSortExport from "../../layout/Layout_R/SearchSortExport";
import Table from "../../layout/Layout_R/Table";
import { API } from "../../services/apiService";

export default function Reservation() {
  // États principaux
  const [etudiants, setEtudiants] = useState([]);
  const [jours, setJours] = useState([]);
  const [periodes, setPeriodes] = useState([]);
  const [reservations, setReservations] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour recherche, tri et pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;

  // Chargement initial des données
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [etuRes, jourRes, periRes, resaRes] = await Promise.all([
        API.etudiant.list({ page_size: 500 }),
        API.jour.list({ page_size: 7 }),
        API.periode.list({ page_size: 50 }),
        API.reservation.list({ page_size: 1000 }),
      ]);

      setEtudiants(etuRes.results);
      setJours(jourRes.results);
      setPeriodes(periRes.results);

      // Construire la Map d'étudiants → réservations
      const map = new Map();
      etuRes.results.forEach((e) => map.set(e.id, new Map()));
      resaRes.results.forEach((r) => {
        const key = `${r.etudiant}-${r.jour}-${r.periode}`;
        map.get(r.etudiant)?.set(key, r);
      });
      setReservations(map);
    } catch (err) {
      setError("Impossible de charger les réservations.");
      console.error("Erreur fetchData:", err);
    } finally {
      setLoading(false);
    }
  }

  // Calculer le lundi de la semaine en cours (début de semaine)
  const getWeekStart = () => {
    const d = new Date();
    const day = d.getDay() === 0 ? 7 : d.getDay();
    d.setDate(d.getDate() - day + 1);
    return d;
  };

  // Calculer la date ISO YYYY-MM-DD selon un offset de jour par rapport au lundi
  const getReservationDate = (offset) => {
    const d = new Date(getWeekStart());
    d.setDate(d.getDate() + offset);
    return d.toISOString().split("T")[0];
  };

  // Gérer la bascule d'une réservation
  const handleToggle = async (etuId, jourId, periId) => {
    const key = `${etuId}-${jourId}-${periId}`;
    const studentMap = new Map(reservations);
    const row = studentMap.get(etuId);
    const exists = row?.get(key);

    const jourIndex = jours.findIndex((j) => j.id === jourId);
    const dateStr = getReservationDate(jourIndex);
    const payload = {
      etudiant: etuId,
      jour: jourId,
      periode: periId,
      date: dateStr,
      heure: "12:00:00",
    };

    try {
      if (exists) {
        await API.reservation.delete(exists.id);
        row.delete(key);
      } else {
        const created = await API.reservation.create(payload);
        row.set(key, created);
      }
      setReservations(studentMap);
    } catch (e) {
      console.error("Erreur API réservation:", e);
      setError("Erreur lors de l'enregistrement de la réservation.");
    }
  };

  // Tout cocher / décocher
  const handleToggleAll = (etuId) => {
    jours.forEach((j, idxJ) =>
      periodes.forEach((p, idxP) => handleToggle(etuId, j.id, p.id))
    );
  };

  // Filtrage, tri et pagination
  const filtered = etudiants.filter(
    (e) =>
      e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.prenom.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const sorted = sortBy
    ? [...filtered].sort((a, b) =>
        typeof a[sortBy] === "string"
          ? a[sortBy].localeCompare(b[sortBy])
          : a[sortBy] - b[sortBy]
      )
    : filtered;
  const totalPages = Math.ceil(sorted.length / rowsPerPage);
  const paginated = sorted.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Export PDF
  const exportPDF = () => {
    const pdf = new jsPDF("landscape");
    pdf.text("Liste des Réservations", 14, 10);
    const head = ["ID", "Nom", "Prénom", ...jours.map((j) => j.nomJour)];
    const body = sorted.map((e) => {
      const row = [e.id, e.nom, e.prenom];
      jours.forEach((j, idxJ) => {
        let s = "";
        periodes.forEach((p) => {
          const key = `${e.id}-${j.id}-${p.id}`;
          s += reservations.get(e.id)?.has(key) ? "✔ " : "✘ ";
        });
        row.push(s.trim());
      });
      return row;
    });
    pdf.autoTable({ head: [head], body, startY: 20 });
    pdf.save("Reservations.pdf");
  };

  if (loading) return <div className="text-center py-10">Chargement...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <>
      <SearchSortExport
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setSortBy={setSortBy}
        exportToPDF={exportPDF}
      />

      {/* Wrapper pour scroll horizontal uniquement */}
      <div className="overflow-x-auto w-full">
        <Table
          etudiants={paginated}
          jours={jours}
          periodes={periodes}
          reservations={reservations}
          handleReservationToggle={handleToggle}
          handleToggleAll={handleToggleAll}
          handleKeyDown={() => {}}
          getReservationDate={getReservationDate}
        />
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
}
