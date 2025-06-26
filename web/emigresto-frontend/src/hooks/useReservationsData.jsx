// src/hooks/useReservationsData.js

import { useState, useEffect, useMemo, useCallback } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { API } from "../services/apiService"; // Assurez-vous que le chemin est correct
 // Assuming you use react-toastify for notifications

const useReservationsData = () => {
  const [etudiants, setEtudiants] = useState([]);
  const [jours, setJours] = useState([]);
  const [periodes, setPeriodes] = useState([]);
  const [reservationsBrutes, setReservationsBrutes] = useState([]); // Pour stocker les données brutes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 7; // Vous pouvez ajuster cela

  // Dates pour la semaine courante, calculées dynamiquement
  const getReservationDate = useCallback((jourId) => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 pour Dimanche, 1 pour Lundi, etc.
    const currentDayId = dayOfWeek === 0 ? 7 : dayOfWeek; // Adapter pour Jours: 1=Lun, 7=Dim

    let diff = jourId - currentDayId;
    if (diff < 0) {
      diff += 7; // Si le jour est passé cette semaine, prendre celui de la semaine prochaine
    }

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);

    // Retourne la date au format YYYY-MM-DD
    return targetDate.toISOString().split("T")[0];
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [etuRes, jourRes, periRes, resaRes] = await Promise.all([
          API.etudiant.list({ page_size: 500 }),
          API.jour.list({ page_size: 7 }),
          API.periode.list({ page_size: 50 }),
          API.reservation.list({ page_size: 1000 }), // Récupérer toutes les réservations
        ]);

        setEtudiants(etuRes.results);
        setJours(jourRes.results.sort((a, b) => a.id - b.id));
        setPeriodes(periRes.results.sort((a, b) => a.id - b.id));
        setReservationsBrutes(resaRes.results); // Stocker les réservations brutes
      } catch (err) {
        console.error("Erreur lors du chargement des données :", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []); // Dépendances vides pour un seul chargement au montage

  // --- Logique de traitement des réservations pour la Map ---
  const reservationsMap = useMemo(() => {
    const map = new Map();
    reservationsBrutes.forEach((r) => {
      // --- NOUVEAU: Filtrer par statut 'VALIDE' ---
      if (r.statut === 'VALIDE') { // <--- AJOUTEZ CETTE LIGNE
        const reservationDate = new Date(r.date);
        reservationDate.setHours(0, 0, 0, 0);

        const targetJourDate = new Date(getReservationDate(r.jour.id));
        targetJourDate.setHours(0, 0, 0, 0);

        // Si la réservation correspond au jour de la semaine *actuelle*
        if (
          r.jour.id &&
          r.periode.id &&
          r.etudiant?.id && // Utilisez r.etudiant.id pour l'initiateur
          reservationDate.getTime() === targetJourDate.getTime()
        ) {
          if (!map.has(r.etudiant.id)) {
            map.set(r.etudiant.id, new Map());
          }
          const studentReservations = map.get(r.etudiant.id);
          // Utilisez une clé unique pour chaque cellule de réservation (jour-période)
          studentReservations.set(`${r.jour.id}-${r.periode.id}`, r); 
        }
      } // <--- FIN DE LA CONDITION STATUT
    });
    return map;
  }, [reservationsBrutes, getReservationDate]); // Recalculer quand les réservations brutes ou les dates des jours changent

  // --- Logique de filtrage et tri ---
  const filteredEtudiants = useMemo(() => {
    if (!searchTerm) return etudiants;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return etudiants.filter(
      (e) =>
        e.nom.toLowerCase().includes(lowerCaseSearchTerm) ||
        e.prenom.toLowerCase().includes(lowerCaseSearchTerm) ||
        String(e.id).includes(lowerCaseSearchTerm) ||
        e.matricule?.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [etudiants, searchTerm]);

  const sortedEtudiants = useMemo(() => {
    if (!sortBy) return filteredEtudiants;
    return [...filteredEtudiants].sort((a, b) => {
      if (sortBy === "idEtudiant") return a.id - b.id;
      if (sortBy === "nomEtudiant")
        return a.nom.localeCompare(b.nom, undefined, { sensitivity: "base" });
      if (sortBy === "prenomEtudiant")
        return a.prenom.localeCompare(b.prenom, undefined, {
          sensitivity: "base",
        });
      return 0;
    });
  }, [filteredEtudiants, sortBy]);

  const paginatedEtudiants = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return sortedEtudiants.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedEtudiants, page, rowsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedEtudiants.length / rowsPerPage);
  }, [sortedEtudiants]);

  // --- Logique de toggle pour les réservations ---
  const toggleReservation = useCallback(
    async (etudiantId, jourId, periodeId) => {
      const currentReservationsForStudent =
        reservationsMap.get(etudiantId) || new Map();
      const key = `${jourId}-${periodeId}`;
      const existingReservation = currentReservationsForStudent.get(key); // This will be a VALIDE reservation if it exists in the map

      const reservationDate = getReservationDate(jourId); // La date spécifique du jour de la semaine

      try {
        if (existingReservation) {
          // --- CHANGEMENT CRUCIAL: Passer à la soft delete (ANNULE) ---
          // Annuler la réservation existante en changeant son statut
          const payload = {
            statut: 'ANNULE',
            // Include other necessary fields if your backend requires them for PATCH
            // e.g., 'jour': jourId, 'periode': periodeId, 'date': reservationDate, 'etudiant': etudiantId
            // but usually for status change, only statut is enough if ID is in URL
          };
          await API.reservation.partial_update(existingReservation.id, payload);
          toast.success("Réservation annulée !");
        } else {
          // Créer une nouvelle réservation ou réactiver une existante (géré par le backend)
          // Le backend (via ReservationCreateSerializer.create) gérera la réactivation
          // d'une réservation ANNULEE pour le même initiateur/date/periode.
          const newReservationData = {
            etudiant: etudiantId, // C'est l'ID de l'étudiant initiateur
            jour: jourId,
            periode: periodeId,
            date: reservationDate,
            heure: "12:00:00", 
            // statut: "VALIDE", // Le backend mettra par défaut 'VALIDE' ou réactivera
          };
          await API.reservation.create(newReservationData);
          toast.success("Réservation effectuée !");
        }
        
        // Après chaque opération (annulation ou création), rafraîchir les données brutes
        // pour que `reservationsMap` soit recalculée avec les données à jour
        const resaRes = await API.reservation.list({ page_size: 1000 });
        setReservationsBrutes(resaRes.results);

      } catch (err) {
        console.error("Erreur lors de la mise à jour de la réservation :", err);
        toast.error(
          "Erreur: " +
            (err.response?.data?.detail ||
              err.response?.data?.non_field_errors?.[0] ||
              err.message ||
              "Une erreur est survenue.")
        );
      }
    },
    [reservationsMap, getReservationDate]
  );

  const toggleAllForStudent = useCallback(
    async (etudiantId) => {
      const studentReservations = reservationsMap.get(etudiantId) || new Map();
      const allChecked = jours.every((jour) =>
        periodes.every((periode) =>
          studentReservations.has(`${jour.id}-${periode.id}`)
        )
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const actions = []; 

      for (const jour of jours) {
        const dateForJour = new Date(getReservationDate(jour.id));
        dateForJour.setHours(0, 0, 0, 0);
        const isPast = dateForJour < today;

        if (isPast) continue;

        for (const periode of periodes) {
          const key = `${jour.id}-${periode.id}`;
          const existingReservation = studentReservations.get(key); // This will be a VALIDE reservation from the map

          if (allChecked && existingReservation) {
            // Tout est coché (VALIDE), donc on décoche tout (ANNULE)
            actions.push(
                API.reservation.partial_update(existingReservation.id, { statut: 'ANNULE' })
            );
          } else if (!allChecked && !existingReservation) {
            // Pas tout coché (manque des VALIDE), on coche tout (crée/réactive)
            actions.push(
              API.reservation.create({
                etudiant: etudiantId,
                jour: jour.id,
                periode: periode.id,
                date: getReservationDate(jour.id), 
                heure: "12:00:00",
              })
            );
          }
        }
      }

      try {
        await Promise.all(actions);
        // Après toutes les opérations, rafraîchir les données brutes
        const resaRes = await API.reservation.list({ page_size: 1000 });
        setReservationsBrutes(resaRes.results);
        toast.success("Mise à jour des réservations réussie !");
      } catch (err) {
        console.error("Erreur lors du basculement des réservations :", err);
        toast.error(
          "Erreur: " +
            (err.response?.data?.detail ||
              err.response?.data?.non_field_errors?.[0] ||
              err.message ||
              "Une erreur est survenue.")
        );
      }
    },
    [reservationsMap, jours, periodes, getReservationDate]
  );

  const exportToPDF = useCallback(() => {
    const pdf = new jsPDF("landscape");
    pdf.text("Liste des Réservations", 14, 10);
    const head = ["ID", "Nom", "Prénom", ...jours.map((j) => j.nomJour)];
    const body = sortedEtudiants.map((e) => {
      const row = [e.id, e.nom, e.prenom];
      jours.forEach((j) => {
        let s = "";
        periodes.forEach((p) => {
          const key = `${j.id}-${p.id}`; 
          const isReserved = reservationsMap.get(e.id)?.has(key); // Check only active reservations
          s += isReserved ? "✔ " : "✘ ";
        });
        row.push(s.trim());
      });
      return row;
    });
    pdf.autoTable({ head: [head], body, startY: 20 });
    pdf.save("Reservations.pdf");
  }, [sortedEtudiants, jours, periodes, reservationsMap]);

  const handleKeyDown = useCallback(
    (e, etudiantId, jourId, periodeId) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); 
        toggleReservation(etudiantId, jourId, periodeId);
      }
    },
    [toggleReservation]
  );

  return {
    etudiants: paginatedEtudiants,
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
    exportToPDF,
    toggleReservation,
    toggleAllForStudent,
    handleKeyDown,
    getReservationDate,
  };
};

export default useReservationsData;