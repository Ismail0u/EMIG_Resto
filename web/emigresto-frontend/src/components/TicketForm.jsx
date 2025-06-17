// src/components/TicketForm.jsx
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { API } from '../services/apiService'
import Spinner from './Spinner'
import StudentSelect from './StudentSelect'
import jsPDF from 'jspdf'

export default function TicketForm() {
  const qc = useQueryClient()

  // Chargement de la liste des étudiants pour le select
  const { data: etuData, isLoading: etuLoading } = useQuery({
    queryKey: ['etudiants'],
    queryFn: () => API.etudiant.list({ page_size: 1000 })
  })

  const [etudiantId, setEtudiantId] = useState('')
  const [typeTicket, setTypeTicket] = useState('PETIT')
  const [quantity, setQuantity] = useState(1)
  const [totalPrice, setTotalPrice] = useState(0)

  // Recalcul du total à payer
  useEffect(() => {
    setTotalPrice(quantity * (typeTicket === 'PETIT' ? 80 : 125))
  }, [typeTicket, quantity])

  // Mutation DRF : créer un Paiement puis un Ticket
  const sellMutation = useMutation({
    mutationFn: async () => {
      // 1) Création du paiement
      const paiement = await API.paiement.create({
        montant: totalPrice,
        mode_paiement: 'CASH',
        // Note : DRF ignore le champ 'etudiant' en lecture seule, 
        // il associe l'étudiant du ticket sur la vue côté back.
      })
      // 2) Création du ticket
      const ticket = await API.ticket.create({
        etudiant: etudiantId,
        type_ticket: typeTicket,
        quantite: quantity,
        paiement: paiement.id
      })
      return { paiement, ticket }
    },
    onSuccess: ({ paiement, ticket }) => {
      // Invalidate pour rafraîchir les listes
      qc.invalidateQueries(['paiements'])
      qc.invalidateQueries(['tickets'])
      toast.success(`🎉 Ticket #${ticket.id} généré pour ${ticket.etudiant.nom}`)

      // Génération du PDF avec les champs du serializer
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text('REÇU DE PAIEMENT - EMIGResto', 20, 20)

      doc.setFontSize(12)
      doc.text(`Ticket #${ticket.id}`, 20, 40)
      doc.text(`Étudiant : ${ticket.etudiant.nom} ${ticket.etudiant.prenom}`, 20, 50)
      doc.text(`Type : ${ticket.type_ticket}`, 20, 60)
      doc.text(`Quantité : ${ticket.quantite}`, 20, 70)
      doc.text(`Prix unitaire : ${ticket.prix} FCFA`, 20, 80)          // 'prix' calculé par le serializer
      doc.text(`Montant total : ${ticket.prix * ticket.quantite} FCFA`, 20, 90)
      doc.text(`Date : ${new Date(ticket.date_vente).toLocaleString()}`, 20, 100)
      doc.text(`QR Code : ${ticket.qr_code}`, 20, 110)

      doc.setFontSize(10)
      doc.text('Fait par : Le magasinier', 20, 130)
      doc.save(`recu_ticket_${ticket.id}.pdf`)

      // Reset du formulaire
      setEtudiantId('')
      setTypeTicket('PETIT')
      setQuantity(1)
    },
    onError: err => {
      toast.error(err.message || 'Erreur lors de la vente')
    }
  })

  const handleSubmit = e => {
    e.preventDefault()
    if (!etudiantId) return toast.error('Sélectionnez un étudiant')
    if (quantity < 1 || quantity > 50)
      return toast.error('Quantité doit être entre 1 et 50')
    sellMutation.mutate()
  }

  if (etuLoading) return <Spinner />

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6"
    >
      <h2 className="text-3xl font-bold text-center text-blue-700">
        Vente de Ticket
      </h2>

      {/* Affichage du total recalculé */}
      <div className="flex justify-between bg-blue-100 text-blue-800 p-4 rounded-lg font-semibold">
        <span>Total à payer :</span>
        <span>{totalPrice.toLocaleString()} FCFA</span>
      </div>

      {/* Sélecteur d'étudiant */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Étudiant
        </label>
        <StudentSelect
          value={etudiantId}
          onChange={id => setEtudiantId(id)}
          options={etuData.results}
          getOptionLabel={e => `${e.nom} ${e.prenom}`}
          getOptionValue={e => e.id}
          required
        />
      </div>

      {/* Type de ticket */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type de ticket
        </label>
        <select
          value={typeTicket}
          onChange={e => setTypeTicket(e.target.value)}
          className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600"
        >
          <option value="PETIT">Petit-déjeuner (80 FCFA)</option>
          <option value="DEJ">Déjeuner/Dîner (125 FCFA)</option>
        </select>
      </div>

      {/* Quantité */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantité
        </label>
        <input
          type="number"
          min={1}
          max={50}
          value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
          className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Bouton de vente */}
      <button
        type="submit"
        disabled={sellMutation.isLoading}
        className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {sellMutation.isLoading ? (
          <>
            <Spinner size="sm" />
            <span>Enregistrement...</span>
          </>
        ) : (
          <span>Vendre ({totalPrice.toLocaleString()} FCFA)</span>
        )}
      </button>
    </form>
  )
}
