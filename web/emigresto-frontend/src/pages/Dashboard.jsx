import { useEffect, useState } from "react";
import { FaMoneyBillWave, FaTicketAlt } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DashboardCard from "../components/DashboardCard";
import { API } from "../services/apiService";

export default function DashboardVendeur() {
  const [totalSales, setTotalSales] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [paiementRes, ticketRes] = await Promise.all([
          API.paiement.list(),
          API.ticket.list(),
        ]);

        const ventes = paiementRes.results || [];
        const tickets = ticketRes.results || [];

        const caTotal = ventes.reduce((sum, v) => sum + v.montant, 0);
        const qtTotal = tickets.reduce((sum, t) => sum + t.quantite, 0);

        setTotalSales(caTotal);
        setTotalTickets(qtTotal);

        setChartData([
          { name: "Chiffre d’affaires", value: caTotal },
          { name: "Tickets vendus", value: qtTotal },
        ]);
      } catch (err) {
        console.error("Erreur chargement des données dashboard :", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-600 py-10">Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-10 px-4">
      {/* Résumé Chiffres */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <DashboardCard
          title="Chiffre d’affaires total"
          value={`${totalSales.toLocaleString()} FCFA`}
          icon={<FaMoneyBillWave className="text-green-600" />}
        />
        <DashboardCard
          title="Tickets vendus"
          value={totalTickets}
          icon={<FaTicketAlt className="text-blue-500" />}
        />
      </div>

      {/* Graphique barres */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-700">Statistiques générales</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={chartData}
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
  );
}
