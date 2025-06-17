// src/utils/pdfUtils.js
import jsPDF from 'jspdf'

export function generateTicketPDF(ticket) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.setTextColor(33, 37, 41)
  doc.text('REÇU DE PAIEMENT - EMIGResto', 20, 20)

  doc.setFontSize(12)
  doc.setTextColor(50)
  doc.text(`Numéro du ticket : #${ticket.id}`, 20, 40)
  doc.text(`Nom de l'étudiant : ${ticket.etudiant_nom}`, 20, 50)
  doc.text(`Type de ticket : ${ticket.type_ticket}`, 20, 60)
  doc.text(`Quantité : ${ticket.quantite}`, 20, 70)
  doc.text(`Prix unitaire : ${ticket.prix_unitaire} FCFA`, 20, 80)
  doc.text(`Montant total : ${ticket.total} FCFA`, 20, 90)
  doc.text(`Date : ${ticket.date}`, 20, 100)

  doc.text('Fait par : Le magasinier du restaurant', 20, 120)

  doc.save(`recu_ticket_${ticket.id}.pdf`)
}
