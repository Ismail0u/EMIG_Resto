import React from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import DashboardContent from "../../components/layout/layout_r/DashboardContent_R";
import { menuItems,userOptions } from "../../components/layout/layout_r/SidebarData_R";

const Dashboard_R = () => {
  

  return (
    <div className="h-screen flex w-full overflow-hidden">
      {/* Barre latérale */}
      <Sidebar title="My Dashboard" menuItems={menuItems} userOptions={userOptions} />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col h-screen">
        {/* En-tête */}
        <Header h_title="Tableau de bord" h_role="Vendeur de ticket" h_user="Soumana" />

        {/* Contenu du tableau de bord sans débordement */}
        <div className="flex-1 overflow-hidden p-0">
          <DashboardContent />
        </div>
      </div>
    </div>
  );
};

export default Dashboard_R;