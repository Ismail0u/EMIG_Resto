import React, { useState } from "react";
import { Link } from "react-router-dom";
import logoAppli from "../../src/assets/images/emig_logo.png"

const Sidebar = ({ menuItems, userOptions }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [hoveredMenu, setHoveredMenu] = useState(null);

  return (
    <div
      className={`h-screen bg-blue-600 text-white transition-all duration-300 flex flex-col ${
        isOpen ? "w-46" : "w-12"
      }`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Logo et Nom */}
      <div className="flex items-center justify-center py-4">
        <img
          src={logoAppli}
          alt="Logo EMIG"
          className={`transition-all duration-300 ${
            isOpen ? "w-8 h-8 mr-2" : "w-8 h-8"
          }`}
        />
        {isOpen && (
          <h1 className="text-lg font-bold flex space-x-1">
            <span className="text-blue-800">Emig</span>
            <span className="text-red-400">Resto</span>
          </h1>
        )}
      </div>

      {/* Menu principal */}
      <div className="p-4">
        <ul className="space-y-4">
          {menuItems.map((item, index) => (
            <li
              key={index}
              className="flex flex-col"
              onMouseEnter={() => setHoveredMenu(index)}
              onMouseLeave={() => setHoveredMenu(null)}
            >
              <Link
                to={item.path}
                className="flex items-center"
                onClick={() => setIsOpen(true)}
              >
                <span className="h-5 w-5 mr-3 flex-shrink-0">{item.icon}</span>
                <span
                  className={`transition-opacity duration-500 whitespace-nowrap ${
                    isOpen ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ wordBreak: "break-word" }}
                >
                  {item.name}
                </span>
              </Link>

              {/* Sous-menu */}
              {hoveredMenu === index && item.subItems && (
                <ul
                  className="pl-5 mt-2 space-y-2"
                  style={{ minWidth: "160px" }}
                >
                  {item.subItems.map((subItem, subIndex) => (
                    <li key={subIndex} className="flex items-center">
                      <Link
                        to={subItem.path}
                        className="flex items-center"
                        onClick={() => setIsOpen(true)}
                      >
                        <span className="h-2 w-4 mr-1 flex-shrink-0">
                          {subItem.icon}
                        </span>
                        <span
                          className={`transition-opacity duration-500 break-words ${
                            isOpen ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          {subItem.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <hr className="border-gray-400 mx-5 my-3" />

      {/* Options utilisateur */}
      <div className="mt-auto p-4">
        <ul className="space-y-4">
          {userOptions.map((option, index) => (
            <li key={index} className="flex items-center">
              <Link
                to={option.path}
                className="flex items-center"
                onClick={() => setIsOpen(true)}
              >
                <span className="h-5 w-5 mr-3 flex-shrink-0">
                  {option.icon}
                </span>
                <span
                  className={`transition-opacity duration-500 whitespace-nowrap ${
                    isOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {option.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
