// src/components/SalesTable.jsx
import { useQuery } from '@tanstack/react-query'
import { API } from '../services/apiService'
import Spinner from './Spinner'

export default function SalesTable() {
  // React Query gère le cache, la mise à jour à chaque navigation et le focus
  const { data: ventes, isLoading, isError } = useQuery({
    queryKey: ['paiements'],
    queryFn: () => API.paiement.list().then(res => res.results || []),
    staleTime: 5 * 60 * 1000, // 5 min
    retry: 1,
  })

  if (isLoading) return <Spinner />
  if (isError) return <div className="text-red-600 p-4">Erreur lors du chargement des ventes.</div>

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full bg-white rounded-2xl shadow-lg">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="px-4 py-3 text-left">Étudiant</th>
            <th className="px-4 py-3 text-left">Montant</th>
            <th className="px-4 py-3 text-left">Mode</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">QR Code</th>
          </tr>
        </thead>
        <tbody>
          {ventes.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-6 text-gray-500">
                Aucune vente enregistrée.
              </td>
            </tr>
          ) : (
            ventes.map(s => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{`${s.etudiant.nom} ${s.etudiant.prenom}`}</td>
                <td className="px-4 py-2 text-green-600">{Number(s.montant).toLocaleString()} FCFA</td>
                <td className="px-4 py-2 uppercase">{s.mode_paiement}</td>
                <td className="px-4 py-2">{new Date(s.date).toLocaleString('fr-FR')}</td>
                <td className="px-4 py-2 font-mono text-sm">{s.etudiant.ticket_quota}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
