import React, { useState } from "react";
import { FiEdit, FiX, FiSave } from "react-icons/fi";

const Profile = ({ user }) => {
  const [formData, setFormData] = useState({
    fullName: user.fullName || "",
    email: user.email || "",
    phone: user.phone || "",
    fax: user.fax || "",
    country: user.country || "",
    city: user.city || "",
    postcode: user.postcode || "",
    state: user.state || "",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleEditing = () => setIsEditing((prev) => !prev);

  const handleSave = () => {
    // Ajoute ici ton appel API pour sauvegarder les données
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      {/* Titre principal */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Informations générales</h2>
        <p className="text-gray-600 text-sm">Profil de l'utilisateur et informations organisationnelles</p>
      </div>

      {/* Nom & rôle */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-blue-700">{formData.fullName || "John Doe"}</h3>
        <p className="text-gray-500 text-sm">{user.role || "Fonction inconnue"}</p>
      </div>

      {/* Boutons */}
      <div className="flex gap-4 mb-4">
        {!isEditing ? (
          <button
            onClick={toggleEditing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
          >
            <FiEdit />
            Modifier
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
            >
              <FiSave />
              Enregistrer
            </button>
            <button
              onClick={toggleEditing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md text-sm"
            >
              <FiX />
              Annuler
            </button>
          </>
        )}
      </div>

      {/* Formulaire en grille */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { name: "fullName", label: "Nom complet" },
          { name: "email", label: "Email" },
          { name: "phone", label: "Téléphone" },
          { name: "fax", label: "Fax" },
          { name: "country", label: "Pays" },
          { name: "city", label: "Ville" },
          { name: "postcode", label: "Code postal" },
          { name: "state", label: "État / Région" },
        ].map(({ name, label }) => (
          <div key={name}>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
            <input
              id={name}
              name={name}
              type="text"
              value={formData[name]}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder={isEditing ? label : ""}
              className={`w-full p-2 border rounded-md text-gray-700 focus:outline-none ${
                isEditing
                  ? "border-blue-300 focus:ring-2 focus:ring-blue-400"
                  : "border-gray-200 bg-gray-50 cursor-not-allowed"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
