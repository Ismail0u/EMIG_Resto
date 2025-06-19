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
  const [etudiantId, setEtudiantId] = useState('')
  const [typeTicket, setTypeTicket] = useState('PETIT')
  const [quantity, setQuantity] = useState(1)
  const [totalPrice, setTotalPrice] = useState(0)

  const TICKET_PRICES = { PETIT: 80, DEJ: 125 }

  const { data: etuData, isLoading: etuLoading } = useQuery({
    queryKey: ['etudiants'],
    queryFn: () => API.etudiant.list({ page_size: 1000 }),
  })

  useEffect(() => {
    setTotalPrice(quantity * TICKET_PRICES[typeTicket])
  }, [typeTicket, quantity])

  // Mutation: create payment then tickets one by one
  const sellMutation = useMutation({
    mutationFn: async () => {
      if (!etudiantId) throw new Error('Étudiant non sélectionné')
      if (quantity < 1) throw new Error('Quantité invalide')

      // 1) Créer le paiement pour l'étudiant
      const paiement = await API.paiement.create({
        montant: totalPrice,
        mode_paiement: 'CASH',
        etudiant_id: etudiantId,
      })

      // 2) Créer les tickets individuellement
      const tickets = []
      for (let i = 0; i < quantity; i++) {
        const ticket = await API.ticket.create({
          etudiant_id: etudiantId,
          type_ticket: typeTicket,
        })
        tickets.push(ticket)
      }

      return { paiement, tickets }
    },
    onSuccess: ({ paiement, tickets }) => {
      const etu = etuData.results.find(e => e.id === etudiantId)
      toast.success(`🎫 ${tickets.length} tickets créés pour ${etu.nom}`)

      // Générer PDF pour le premier ticket
      const first = tickets[0]
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text('REÇU DE PAIEMENT - EMIGResto', 20, 20)
      doc.setFontSize(12)
      doc.text(`Étudiant : ${etu.nom} ${etu.prenom}`, 20, 40)
      doc.text(`Type : ${first.type_ticket}`, 20, 50)
      doc.text(`Quantité : ${tickets.length}`, 20, 60)
      doc.text(`Prix unitaire : ${first.prix} FCFA`, 20, 70)
      doc.text(`Montant total : ${first.prix * tickets.length} FCFA`, 20, 80)
      doc.text(`Date : ${new Date(first.date_vente).toLocaleString()}`, 20, 90)
      doc.text(`QR Code : ${first.qr_code}`, 20, 100)
      doc.setFontSize(10)
      doc.text('Fait par : Le magasinier', 20, 120)
      doc.save(`recu_ticket_${first.id}.pdf`)

      qc.invalidateQueries(['paiements', 'tickets'])
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
    sellMutation.mutate()
  }

  if (etuLoading) return <Spinner />

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md space-y-6">
      <h2 className="text-3xl font-bold text-center text-blue-700">Vente de Ticket</h2>

      <div className="flex justify-between bg-blue-100 text-blue-800 p-4 rounded-lg font-semibold">
        <span>Total à payer :</span>
        <span>{totalPrice.toLocaleString()} FCFA</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Étudiant</label>
        <StudentSelect
          value={etudiantId}
          onChange={setEtudiantId}
          options={etuData.results}
          getOptionLabel={e => `${e.nom} ${e.prenom}`}
          getOptionValue={e => e.id}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type de ticket</label>
        <select
          value={typeTicket}
          onChange={e => setTypeTicket(e.target.value)}
          className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600"
        >
          <option value="PETIT">Petit-déjeuner (80 FCFA)</option>
          <option value="DEJ">Déjeuner/Dîner (125 FCFA)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
        <input
          type="number"
          min={1}
          max={50}
          value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
          className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <button
        type="submit"
        disabled={sellMutation.isLoading}
        className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {sellMutation.isLoading ? <Spinner size="sm" /> : `Vendre (${totalPrice.toLocaleString()} FCFA)`}
      </button>
    </form>
  )
}

