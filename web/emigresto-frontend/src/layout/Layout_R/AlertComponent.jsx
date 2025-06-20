import React, { useEffect, useState } from 'react'
import { API } from '../../services/apiService'

export default function AlertComponent() {
  const [alerts, setAlerts] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true); // Ajout de l'état de chargement


  useEffect(() => {
    setLoading(true); // Commencer le chargement
    setError(null);    // Réinitialiser les erreurs

    // L'API actuelle renvoie 'statut', mais l'ancien snippet utilisait 'status'.
    // Je vais utiliser 'statut' comme dans CalendarComponent.
    API.reservation.list({ page_size: 1000 }) // S'assurer de récupérer suffisamment de réservations
      .then(res => {
        const msgs = res.results
          .map(r => {
            const mat = r.etudiant?.matricule || 'Inconnu'
            // Assurez-vous que le statut est bien 'ANNULE' et 'VALIDE' comme dans l'API
            // L'ancien snippet utilisait 'annulée' et 'confirmée', je me base sur tes derniers fichiers.
            if (r.statut === 'ANNULE') return `❌ Réservation annulée pour ${r.etudiant?.nom} ${r.etudiant?.prenom} (${mat})`
            if (r.statut === 'VALIDE') return `✅ Réservation confirmée pour ${r.etudiant?.nom} ${r.etudiant?.prenom} (${mat})`
            return null
          })
          .filter(Boolean) // Supprime les null
        setAlerts(msgs)
        setLoading(false); // Fin du chargement
      })
      .catch(() => {
        setError("❗ Impossible de charger les alertes.")
        setLoading(false); // Fin du chargement avec erreur
      })
  }, [])


  // Gérer les états de chargement et d'erreur avant de rendre le contenu
  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">Chargement des alertes...</div>;
  }

  if (error) {
    // Si une erreur se produit, nous voulons que ce message soit visible et stylé
    // sans déborder. Le div parent de la carte gérera le padding et le shadow.
    return (
      <div className="flex-1 flex items-center justify-center text-red-500 text-sm">
        {error}
      </div>
    );
  }

  // Si pas d'alertes, on peut afficher un message ou rien du tout.
  // J'opte pour un message, centré dans l'espace disponible.
  if (!alerts.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
        Aucune alerte pour le moment.
      </div>
    );
  }

  return (
    // Ce div n'a plus les styles externes (p-4, bg-*, shadow).
    // Il prendra la hauteur de son parent (la carte du dashboard)
    // et utilisera flex-col pour organiser son contenu verticalement.
    <div className="flex flex-col h-full bg-yellow-50 border-l-4 border-yellow-500 rounded-lg"> {/* Les styles visuels de l'alerte sont ici */}
      <h2 className="text-lg font-semibold text-yellow-800 mb-2 p-4 flex-shrink-0">Alertes Réservations</h2> {/* Ajout de p-4 pour le padding interne du titre */}

      {/* La liste des alertes est maintenant dans un conteneur défilant. */}
      {/* Ajout de px-4 et pb-4 pour le padding du contenu défilant */}
      <ul className="list-disc pl-9 space-y-1 flex-1 overflow-y-auto px-4 pb-4"> {/* pl-9 pour compenser le p-4 du parent */}
        {alerts.map((msg, i) => (
          <li key={i} className="text-gray-700 text-sm">
            {msg}
          </li>
        ))}
      </ul>
    </div>
  )
}