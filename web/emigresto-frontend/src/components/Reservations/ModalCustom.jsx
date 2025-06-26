import React, { useEffect, useRef } from 'react';

const ModalCustom = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);

  // Gérer la fermeture lorsque l'utilisateur clique en dehors de la modale ou appuie sur Échap
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscapeKey);
      // Empêcher le défilement du corps derrière la modale
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
      // Rétablir le défilement
      document.body.style.overflow = '';
    }

    // Nettoyage des écouteurs d'événements
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-xl max-w-xl md:max-w-3xl lg:max-w-4xl w-full max-h-[90vh] overflow-y-auto transform scale-100 opacity-100 transition-all duration-300 ease-out"
      >
        {/* En-tête de la modale */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
            aria-label="Fermer"
          >
            &times;
          </button>
        </div>

        {/* Contenu de la modale */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ModalCustom;