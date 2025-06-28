import React from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import { menuItems, userOptions } from "../../components/layout/layout_r/SidebarData_R";
import EtudiantForm from "../../components/Etudiant/EtudiantFormulaire"; // Assure-toi que le chemin est correct

const ListeEtudiant = () => {
  return (
    <div className="h-screen flex w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar title="My Dashboard" menuItems={menuItems} userOptions={userOptions} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <Header h_title="Liste des étudiants" h_role="Vendeur de ticket" h_user="Soumana" />

        {/* Contenu principal : le formulaire / tableau d'étudiants */}
        <div className="flex-1 overflow-auto p-4">
          <EtudiantForm />
        </div>
      </div>
    </div>
  );
};

export default ListeEtudiant;
