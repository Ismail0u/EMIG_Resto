import React from "react";
import { FiSearch } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";

const Header = ({ h_title, h_user, h_role }) => {
  return (
    <header className="bg-white px-6 py-3 flex justify-between items-center shadow-md rounded-b-md">
      {/* Titre à gauche */}
      <h1 className="text-xl font-semibold text-gray-800">{h_title}</h1>

      {/* Barre de recherche centrée */}
      <div className="relative flex items-center w-64 max-w-xs mx-4">
        <FiSearch className="absolute left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher..."
          className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-full bg-gray-100 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Infos utilisateur à droite */}
      <div className="flex items-center space-x-3">
        <FaUserCircle className="w-8 h-8 text-blue-500" />
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800">{h_user}</p>
          <p className="text-xs text-gray-500">{h_role}</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
