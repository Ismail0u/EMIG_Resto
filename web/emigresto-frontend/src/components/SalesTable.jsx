import { useEffect, useState } from "react";
import { API } from "../services/apiService";
import Spinner from "./Spinner";

export default function SalesTable() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSales() {
      try {
        const res = await API.paiement.list();
        setSales(res.results || []);
      } catch (err) {
        setError("Erreur lors du chargement des ventes.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSales();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full bg-white rounded-2xl shadow-lg">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="px-4 py-3 text-left">Étudiant</th>
            <th className="px-4 py-3 text-left">Montant</th>
            <th className="px-4 py-3 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {sales.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center py-6 text-gray-500">
                Aucune vente enregistrée.
              </td>
            </tr>
          ) : (
            sales.map((s) => (
              <tr key={s.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-700">
                  {s.etudiant ? `${s.etudiant.nom} ${s.etudiant.prenom}` : "—"}
                </td>
                <td className="px-4 py-2 text-green-600 font-semibold">
                  {s.montant.toLocaleString()} FCFA
                </td>
                <td className="px-4 py-2 text-gray-600">
                  {new Date(s.date).toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
