
// src/pages/Dashboard.jsx
import { useQuery } from '@tanstack/react-query'
import { FaMoneyBillWave, FaTicketAlt } from 'react-icons/fa'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import DashboardCard from '../components/DashboardCard'
import { API } from '../services/apiService'

export default function DashboardVendeur() {
  // React Query pour dashboard stats
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const [paiementsRes, ticketsRes] = await Promise.all([
        API.paiement.list(),
        API.ticket.list(),
      ])
      const ventes = paiementsRes.results || []
      const tickets = ticketsRes.results || []
      const caTotal = ventes.reduce((sum, v) => sum + Number(v.montant), 0)
      const qtTotal = tickets.length // chaque objet ticket = 1 vendu
      return { caTotal, qtTotal }
    },
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) return <div className="text-center py-10">Chargement...</div>
  if (isError) return <div className="text-red-600 p-4">Erreur de chargement.</div>

  const { caTotal, qtTotal } = data

  return (
    <div className="container mx-auto py-10 px-4 space-y-10">
      {/* Cards résumé */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <DashboardCard
          title="Chiffre d’affaires total"
          value={`${caTotal.toLocaleString()} FCFA`}
          icon={<FaMoneyBillWave className="text-green-600" />}  
        />
        <DashboardCard
          title="Tickets vendus"
          value={qtTotal}
          icon={<FaTicketAlt className="text-blue-500" />}
        />
      </div>

      {/* Graph */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Statistiques générales</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={[
              { name: 'Chiffre d’affaires', value: caTotal },
              { name: 'Tickets vendus', value: qtTotal },
            ]}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `${value}`} />
            <Legend />
            <Bar dataKey="value" fill="#3B82F6" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}