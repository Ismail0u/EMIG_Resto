// Components/sheets/RechargeSheet.tsx
import { AntDesign, MaterialIcons } from '@expo/vector-icons'; // Importez MaterialIcons pour l'icône de succès
import React, { useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';

type ReloadBottomSheetProps = {
  isVisible: boolean;
  toggleBottomSheet: () => void;
};

const CODE_LENGTH = 8;
const DUMMY_RECHARGE_AMOUNT = 5000; // Montant fictif pour la démo

const ReloadBottomSheet: React.FC<ReloadBottomSheetProps> = ({
  isVisible,
  toggleBottomSheet,
}) => {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const inputsRef = useRef<TextInput[]>([]);

  // Nouveaux états pour le modal de succès et le montant rechargé
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [rechargedAmount, setRechargedAmount] = useState(0);
  const [isFailureVisible, setIsFailureVisible] = useState(false);


  const handleChange = (text: string, idx: number) => {
    const char = text.slice(-1);
    const newCode = [...code];
    newCode[idx] = char;
    setCode(newCode);
    if (char && idx < CODE_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    idx: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && code[idx] === '' && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handleRecharge = () => {
    const fullCode = code.join('');
    // Logique de validation du code (très simplifiée pour l'exemple)
    if (fullCode === '12345678') { // Exemple de code valide
      setRechargedAmount(DUMMY_RECHARGE_AMOUNT); // Définir le montant rechargé
      setIsSuccessVisible(true); // Afficher le modal de succès
      setCode(Array(CODE_LENGTH).fill('')); // Réinitialiser le code après succès
      inputsRef.current[0]?.focus(); // Re-focus sur le premier input
    } else {
      setIsFailureVisible(true); // Afficher le modal d'échec
    }
  };

  // Fonction pour réinitialiser tous les modaux et fermer la bottom sheet
  const resetAllModalsAndBottomSheet = () => {
    setIsSuccessVisible(false);
    setIsFailureVisible(false);
    toggleBottomSheet();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={toggleBottomSheet}
      swipeDirection="down"
      onSwipeComplete={toggleBottomSheet}
      style={{ justifyContent: 'flex-end', margin: 0 }}
    >
     <View className="bg-white rounded-t-3xl px-6" style={{ height: 350 }}>
        {/* Bouton de fermeture directement collé en haut */}
        <View className="items-center">
          <TouchableOpacity
            onPress={toggleBottomSheet}
            className="bg-red-500 w-32 h-12 rounded-b-xl items-center justify-center shadow mb-8"
          >
            <AntDesign name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Titre */}
        <Text className="text-center text-blue-700 font-semibold text-lg mb-10">
          SAISISSEZ LE CODE{'\n'}DE RECHARGEMENT
        </Text>

        {/* Inputs du code */}
        <View className="flex-row justify-between ">
          {Array.from({ length: CODE_LENGTH }).map((_, idx) => (
            <TextInput
              key={idx}
              ref={el => {
                if (el) inputsRef.current[idx] = el;
              }}
              value={code[idx]}
              onChangeText={text => handleChange(text, idx)}
              onKeyPress={e => handleKeyPress(e, idx)}
              maxLength={1}
              keyboardType="number-pad"
              className="w-9 h-12 border border-gray-300 rounded-md text-center text-lg "
            />
          ))}
        </View>

        {/* Bouton Recharger */}
        <TouchableOpacity
          onPress={handleRecharge} // Appelle la nouvelle fonction
         className="bg-blue-600 p-4 rounded-xl shadow-lg mt-8"
        >
          <Text className="text-white text-center font-bold text-lg">
            Recharger
          </Text>
        </TouchableOpacity>
      </View>

      {/* POP-UP DE SUCCÈS - Inspirée de ReservationSheet.tsx */}
      <Modal isVisible={isSuccessVisible} onBackdropPress={() => setIsSuccessVisible(false)} onSwipeComplete={() => setIsSuccessVisible(false)} swipeDirection="down">
        <View className="bg-white p-6 rounded-2xl items-center">
          <MaterialIcons name="check-circle" size={64} color="green" />
          <Text className="text-lg font-bold text-center mt-3 text-green-600">
            Recharge effectuée avec succès !
          </Text>
          <Text className="text-center mt-2 text-gray-700 text-lg">
            Montant rechargé : FCFA {rechargedAmount.toLocaleString('fr-FR')}
          </Text>
          <TouchableOpacity onPress={resetAllModalsAndBottomSheet} className="mt-4 bg-green-500 px-4 py-2 rounded-lg">
            <Text className="text-white font-bold text-lg">OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* POP-UP D'ÉCHEC - Inspirée de ReservationSheet.tsx */}
      <Modal isVisible={isFailureVisible} onBackdropPress={() => setIsFailureVisible(false)} onSwipeComplete={() => setIsFailureVisible(false)} swipeDirection="down">
        <View className="bg-white p-6 rounded-2xl items-center">
          <MaterialIcons name="error-outline" size={64} color="red" />
          <Text className="text-lg font-bold text-center mt-3 text-red-600">
            Échec de la recharge !
          </Text>
          <Text className="text-center text-gray-600 mt-2">
            Veuillez vérifier le code et réessayer.
          </Text>
          <TouchableOpacity onPress={() => setIsFailureVisible(false)} className="mt-4 bg-gray-500 px-4 py-2 rounded-lg">
            <Text className="text-white font-bold text-lg">OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </Modal>
  );
};

export default ReloadBottomSheet;