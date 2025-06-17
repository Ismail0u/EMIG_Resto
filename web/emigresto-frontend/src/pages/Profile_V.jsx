import React from "react";
import Header from "../layout/Header";
import { menuItems,userOptions } from "../layout/Layout_V/SidebarData_V";
import Sidebar from "../layout/Sidebar";
import Profile from "../layout/Profile";

const Profile_V = () => {
  const user = {
    profilePicture: "https://via.placeholder.com/150",
    fullName: "Boureima",
    role: "Vendeur de Ticket",
    bio: "rien à dire ",
  };

  return (
    <div className="h-screen flex w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar title="My Dashboard" menuItems={menuItems} userOptions={userOptions} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <Header h_title="Tableau de bord" h_role="vendeur de ticket" h_user="Boureima" />

        {/* Dashboard Content */}
        <div className="flex-1 overflow-hidden p-0 flex items-center justify-center">
          <Profile user={user} editable={true} />
        </div>
      </div>
    </div>
  );
};

export default Profile_V;
