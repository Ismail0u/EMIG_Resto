// src/pages/History.jsx
import SalesTable from "../components/SalesTable";

export default function History() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Titre de la page */}
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Historique des ventes
      </h1>

      {/* Composant tableau affichant les ventes */}
      <SalesTable />
    </div>
  );
}
