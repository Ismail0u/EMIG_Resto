import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

Modal.setAppElement('#root');

export default function CommunicationPanel() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageType, setMessageType] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [dynamicFields, setDynamicFields] = useState({
    date: '',
    reason: '',
    newMenuDetails: '',
    menuPeriod: '',
  });

  const getTemplate = (type) => {
    const formattedDate = dynamicFields.date
      ? format(new Date(dynamicFields.date), 'dd MMMM', { locale: fr })
      : '[Date du jour spécial]';

    switch (type) {
      case 'no_reservation_holiday':
        return `Chers étudiants,

Nous vous informons qu'il n'y aura pas de service de restauration et donc pas de réservations possibles pour le ${formattedDate} en raison de ${dynamicFields.reason || '[Raison : ex. jour férié, événement spécial]'}.

Le déjeuner sera exceptionnellement pris en charge pour tous les étudiants inscrits à la cantine ce jour-là.

Merci de votre compréhension.`;
      case 'menu_change':
        return `Avis important !

En raison de circonstances imprévues, le menu prévu pour le ${dynamicFields.menuPeriod || '[Date du changement]'} est modifié. Le nouveau menu sera :

${dynamicFields.newMenuDetails || '[Détails du nouveau menu, ex: Petit-déjeuner : Crêpes et jus de fruits...]'}

Nous nous excusons pour le désagrément.`;
      case 'send_menu':
        return `Bonjour à tous,

Voici le menu pour le ${dynamicFields.menuPeriod || '[Période: ex. aujourd\'hui, cette semaine]'} :

[Détails complets du menu]

Bon appétit !`;
      case 'custom':
        return '';
      default:
        return '';
    }
  };

  const openModal = (type) => {
    setMessageType(type);
    setDynamicFields({ date: '', reason: '', newMenuDetails: '', menuPeriod: '' });
    let title = '';
    switch (type) {
      case 'no_reservation_holiday':
        title = 'Annulation de réservations (jour spécial)';
        break;
      case 'menu_change':
        title = 'Changement de menu';
        break;
      case 'send_menu':
        title = 'Envoi du menu';
        break;
      case 'custom':
        title = 'Message personnalisé';
        break;
      default:
        title = 'Nouveau Message';
    }
    setModalTitle(title);
    setMessageContent(getTemplate(type));
    setIsModalOpen(true);
    setFeedbackMessage(null);
  };

  const handleDynamicFieldChange = (field, value) => {
    setDynamicFields((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (isModalOpen && messageType !== 'custom') {
      setMessageContent(getTemplate(messageType));
    }
  }, [dynamicFields, messageType, isModalOpen]);

  const handleSendMessage = () => {
    console.log(`Envoi du message (${messageType}):`, messageContent);
    console.log("Champs dynamiques:", dynamicFields);
    setFeedbackMessage({ type: 'success', text: 'Message envoyé avec succès ! (Simulation)' });
    setTimeout(() => {
      setIsModalOpen(false);
      setFeedbackMessage(null);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xs font-semibold text-gray-800 mt-2 mb-2">Outils de Communication Rapide</h2>

      {feedbackMessage && (
        <div
          className={`mb-3 p-2 rounded text-xs ${
            feedbackMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {feedbackMessage.text}
        </div>
      )}

      <div className="flex flex-col gap-2 flex-grow">
        <button
          onClick={() => openModal('no_reservation_holiday')}
          className="bg-red-100 hover:bg-red-200 text-red-800 font-semibold p-1.5 rounded shadow-sm text-xs"
        >
          Prise en charge du déjeuner
        </button>
        <button
          onClick={() => openModal('menu_change')}
          className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold p-1.5 rounded shadow-sm text-xs"
        >
          Signaler un changement de menu
        </button>
        <button
          onClick={() => openModal('send_menu')}
          className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold p-1.5 rounded shadow-sm text-xs"
        >
          Envoyer le menu
        </button>
        <button
          onClick={() => openModal('custom')}
          className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold p-1.5 rounded shadow-sm text-xs"
        >
          Message personnalisé
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel={modalTitle}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-3 right-3 text-red-600 hover:text-red-800 text-2xl font-bold"
          aria-label="Fermer"
        >
          ×
        </button>

        <h3 className="text-lg font-semibold mb-3 text-gray-800">{modalTitle}</h3>

        {messageType === 'no_reservation_holiday' && (
          <div className="mb-3">
            <label className="block text-gray-700 text-sm font-medium mb-1">Date du jour spécial:</label>
            <input
              type="date"
              value={dynamicFields.date}
              onChange={(e) => handleDynamicFieldChange('date', e.target.value)}
              className="border rounded w-full py-1.5 px-2 text-gray-700 text-sm"
            />
            <label className="block text-gray-700 text-sm font-medium mt-2 mb-1">Raison:</label>
            <input
              type="text"
              value={dynamicFields.reason}
              onChange={(e) => handleDynamicFieldChange('reason', e.target.value)}
              className="border rounded w-full py-1.5 px-2 text-gray-700 text-sm"
              placeholder="Ex: jour férié"
            />
          </div>
        )}

        {(messageType === 'menu_change' || messageType === 'send_menu') && (
          <div className="mb-3">
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Période du menu / Date du changement:
            </label>
            <input
              type="text"
              value={dynamicFields.menuPeriod}
              onChange={(e) => handleDynamicFieldChange('menuPeriod', e.target.value)}
              className="border rounded w-full py-1.5 px-2 text-gray-700 text-sm"
              placeholder="Ex: Lundi 25 Décembre"
            />
            {messageType === 'menu_change' && (
              <>
                <label className="block text-gray-700 text-sm font-medium mt-2 mb-1">Nouveaux détails du menu:</label>
                <textarea
                  value={dynamicFields.newMenuDetails}
                  onChange={(e) => handleDynamicFieldChange('newMenuDetails', e.target.value)}
                  rows="4"
                  className="border rounded w-full py-1.5 px-2 text-gray-700 text-sm resize-y"
                  placeholder="Ex: Petit-déjeuner: Crêpes..."
                ></textarea>
              </>
            )}
          </div>
        )}

        <label className="block text-gray-700 text-sm font-medium mb-1">Contenu du message:</label>
        <textarea
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          className="border rounded w-full py-1.5 px-2 text-gray-700 text-sm resize-y h-40"
          placeholder="Écrivez votre message ici..."
        ></textarea>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-1.5 px-3 rounded text-sm"
          >
            Annuler
          </button>
          <button
            onClick={handleSendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded text-sm"
          >
            Envoyer
          </button>
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.75);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          .modal-content {
            position: relative;
            background: white;
            border-radius: 8px;
            padding: 16px;
            max-width: 480px;
            width: 90%;
            outline: none;
            overflow: auto;
            max-height: 90vh;
          }
        `}</style>
      </Modal>
    </div>
  );
}
