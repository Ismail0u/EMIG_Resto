// src/hooks/useReservationsData.js (Exemple de construction de reservationsMap)

import { useState, useEffect, useMemo, useCallback } from "react";
import { jsPDF } from "jspdf";
import { toast } from "react-hot-toast";
import autoTable from "jspdf-autotable"; 
import { API } from "../services/apiService"; // Assurez-vous que le chemin est correct

const useReservationsData = () => {
  const [etudiants, setEtudiants] = useState([]);
  const [jours, setJours] = useState([]);
  const [periodes, setPeriodes] = useState([]);
  const [reservationsBrutes, setReservationsBrutes] = useState([]); // Nouveau: pour stocker les données brutes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 7; // Vous pouvez ajuster cela

  // Dates pour la semaine courante, calculées dynamiquement
  const getReservationDate = useCallback((jourId) => {
    const today = new Date();
    // Obtenir le jour « numérique » 1=Lundi … 7=Dimanche
    const todayIsoDay = today.getDay() === 0 ? 7 : today.getDay(); 
  
    // Calculer la date du Lundi de la semaine courante
    const monday = new Date(today);
    monday.setDate(today.getDate() - (todayIsoDay - 1));
  
    // Ajouter (jourId-1) jours pour arriver au jour voulu
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + (jourId - 1));
  
    // Retourne YYYY-MM-DD
    return targetDate.toISOString().split('T')[0];
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
          API.reservation.list({ page_size: 1000,}),// Récupérer toutes les réservations
        ]);
        console.log("Etudiants chargés :", etuRes.results);
        console.log("Réservations brutes :", resaRes.results);
        setEtudiants(etuRes.results);
        setJours(jourRes.results.sort((a, b) => a.id - b.id)); // S'assurer que les jours sont triés par ID
        setPeriodes(periRes.results.sort((a, b) => a.id - b.id)); // S'assurer que les périodes sont triées par ID
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
        const reservationDate = new Date(r.date);
        reservationDate.setHours(0, 0, 0, 0);

        const targetJourDate = new Date(getReservationDate(r.jour.id));
        targetJourDate.setHours(0, 0, 0, 0);
        if (r.statut !== 'VALIDE') return;   // optionnel : ne garder que les VALIDE
        const keyId = r.reservant_pour.id;

        // Si la réservation correspond au jour de la semaine *actuelle*
        /*if (
          r.jour.id &&
          r.periode.id &&
          r.reservant_pour?.id && // Utilisez r.etudiant.id pour l'initiateur
          reservationDate.getTime() === targetJourDate.getTime()
        ) { */
          if (!map.has(keyId)) {
            map.set(keyId, new Map());
          }
          // Utilisez une clé unique pour chaque cellule de réservation (jour-période)
          map.get(keyId).set(`${r.jour.id}-${r.periode.id}`, r); 
        //}
    });
    console.log("🔍 reservationsMap entries:", [...map.entries()]);
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
      // Adapter ici si vos clés de tri sont différentes
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
      const existingReservation = currentReservationsForStudent.get(key);

      const reservationDate = getReservationDate(jourId); // La date spécifique du jour de la semaine

      try {
        if (existingReservation) {
          // Annuler la réservation existante
          await API.reservation.delete(existingReservation.id);
          // Mettre à jour l'état local après suppression
          setReservationsBrutes((prev) =>
            prev.filter((r) => r.id !== existingReservation.id)
          );
          toast.success("Réservation annulée !");
        } else {
          // Créer une nouvelle réservation
          const newReservationData = {
            reservant_pour: etudiantId, // C'est l'ID de l'étudiant initiateur
            jour: jourId,
            periode: periodeId,
            date: reservationDate,
            heure: "12:00:00", // Ou une heure par défaut si non pertinente
            statut: "VALIDE",
          };
          const resp = await API.reservation.create(newReservationData);
          // Mettre à jour l'état local après création
          setReservationsBrutes((prev) => [...prev, resp]); // Assurez-vous que `resp` contient l'objet réservation complet
          toast.success("Réservation effectuée !");
        }
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

      // Récupérer la date actuelle pour le jour de la semaine
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const actions = []; // Pour stocker les promesses de suppression/création

      for (const jour of jours) {
        const dateForJour = new Date(getReservationDate(jour.id));
        dateForJour.setHours(0, 0, 0, 0);
        const isPast = dateForJour < today;

        if (isPast) continue; // Ne pas modifier les réservations passées

        for (const periode of periodes) {
          const key = `${jour.id}-${periode.id}`;
          const existingReservation = studentReservations.get(key);

          if (allChecked && existingReservation) {
            // Tout est coché, donc on décoche tout (supprime)
            actions.push(API.reservation.delete(existingReservation.id));
          } else if (!allChecked && !existingReservation) {
            // Pas tout coché, on coche tout (crée)
            actions.push(
              API.reservation.create({
                reservant_pour: etudiantId,
                jour: jour.id,
                periode: periode.id,
                date: getReservationDate(jour.id), // Date spécifique pour ce jour
                heure: "12:00:00",
                statut: "VALIDE",
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
    const pdf = new jsPDF("landscape")
    pdf.text("Liste des Réservations", 14, 10)
  
    // En-tête du tableau : ID, nom, prénom + chaque jour
    const head = [
      ["ID", "Nom", "Prénom", ...jours.map((j) => j.nomJour)]
    ]
  
    // Corps du tableau
    const body = sortedEtudiants.map((e) => {
      const row = [e.id, e.nom, e.prenom]
  
      jours.forEach((j) => {
        let s = ""
        periodes.forEach((p) => {
          const key = `${j.id}-${p.id}`; // Clé correcte pour la map de l'étudiant
          const isReserved = reservationsMap.get(e.id)?.has(key);
          s += isReserved ? "O" : "X";
        });
        row.push(s.trim());
      });
      return row;
    });
    autoTable(pdf, {
          head,
          body,
          startY: 20,});
    pdf.save("Reservations.pdf");
  }, [sortedEtudiants, jours, periodes, reservationsMap]);

  const handleKeyDown = useCallback(
    (e, etudiantId, jourId, periodeId) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); // Empêche le défilement de la page avec la barre d'espace
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