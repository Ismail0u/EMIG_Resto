// sheets/ReserveOtherSheet.tsx
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

type ReserveOtherSheetProps = {
  isVisible: boolean;
  toggleBottomSheet: () => void;
  onReservationSuccess: () => void;
};

const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const dayToId: Record<string, number> = {
  'Lun': 1, 'Mar': 2, 'Mer': 3, 'Jeu': 4, 'Ven': 5, 'Sam': 6, 'Dim': 7,
};

const mealToId: Record<string, number> = {
  'PETIT-DÉJEUNER': 3, 'DÉJEUNER': 1, 'DINER': 2,
};

const dayFullNames: Record<string, string> = {
  'Lun': 'LUNDI',
  'Mar': 'MARDI',
  'Mer': 'MERCREDI',
  'Jeu': 'JEUDI',
  'Ven': 'VENDREDI',
  'Sam': 'SAMEDI',
  'Dim': 'DIMANCHE',
};

const getFullDayNames = (days: string[]) => days.map(day => dayFullNames[day] || day).join(', ');

const parseApiError = (responseData: any): string => {
  if (!responseData) return "Erreur inconnue.";
  if (typeof responseData === 'string') return responseData;
  if (responseData.detail) return responseData.detail;
  if (responseData.non_field_errors && Array.isArray(responseData.non_field_errors)) {
    return responseData.non_field_errors.join('\n');
  }
  if (typeof responseData === 'object') {
    const fieldErrors = Object.entries(responseData)
      .map(([field, errors]) => Array.isArray(errors)
        ? `${field} : ${errors.join(', ')}`
        : `${field} : ${errors}`)
      .join('\n');
    if (fieldErrors) return fieldErrors;
  }
  return "Erreur inattendue.";
};

const ReserveOtherSheet: React.FC<ReserveOtherSheetProps> = ({
  isVisible,
  toggleBottomSheet,
  onReservationSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [selectedMeal, setSelectedMeal] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [studentMatricule, setStudentMatricule] = useState(''); // New state for student matricule
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isFailureVisible, setIsFailureVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const resetAll = () => {
    setIsConfirmVisible(false);
    setIsSuccessVisible(false);
    setIsFailureVisible(false);
    setStep(1);
    setSelectedMeal('');
    setSelectedDays([]);
    setStudentMatricule(''); // Reset matricule
    toggleBottomSheet();
  };

  const handleConfirmReservation = async () => {
    setIsConfirmVisible(false);
    setLoading(true);
    setErrorMessage('');

    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        setErrorMessage("Vous devez être connecté pour réserver.");
        setIsFailureVisible(true);
        setLoading(false);
        return;
      }

      const today = new Date();
      const currentDay = today.getDay();
      let allSuccessful = true;
      let encounteredErrors: string[] = [];

      for (const dayName of selectedDays) {
        const dayNumber = dayToId[dayName];
        let daysUntil = (dayNumber % 7) - currentDay;
        if (daysUntil < 0) daysUntil += 7;

        const dateObj = new Date();
        dateObj.setDate(today.getDate() + daysUntil);
        const formattedDate = format(dateObj, 'yyyy-MM-dd');

        // Requête pour récupérer l'étudiant par matricule
        const etudiantResponse = await fetch(`http://127.0.0.1:8000/api/etudiants/?matricule=${studentMatricule}`, {
          headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
         },
         });
        const etudiantData = await etudiantResponse.json();

        if (!etudiantResponse.ok || !etudiantData.results || etudiantData.results.length === 0) {
          allSuccessful = false;
          encounteredErrors.push(`Aucun étudiant trouvé pour le matricule : ${studentMatricule}`);
          continue; // Skip to next day
        }
        const reservantPourId = etudiantData.results[0].id;

        const reservation = {
          jour: dayNumber,
          periode: mealToId[selectedMeal],
          date: formattedDate,
          heure: "12:00:00",
          reservant_pour: reservantPourId,
        };


        const response = await fetch('http://127.0.0.1:8000/api/reservations/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reservation),
        });

        const responseData = await response.json();

        if (!response.ok) {
          allSuccessful = false;
          encounteredErrors.push(`Pour ${dayName} (${selectedMeal.toLowerCase()}): ${parseApiError(responseData)}`);
        }
      }

      if (allSuccessful) {
        setIsSuccessVisible(true);
        onReservationSuccess();
        setTimeout(() => {
          resetAll();
        }, 2500);
      } else {
        setErrorMessage(encounteredErrors.join('\n\n'));
        setIsFailureVisible(true);
      }
    } catch (err: any) {
      console.error("Erreur inattendue:", err);
      setErrorMessage(err.message || 'Une erreur inattendue est survenue !.');
      setIsFailureVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isVisible={isVisible} onBackdropPress={toggleBottomSheet} swipeDirection="down" onSwipeComplete={toggleBottomSheet} style={{ justifyContent: 'flex-end', margin: 0 }}>
        {step === 1 && (
          <View className="bg-white rounded-t-3xl px-6" style={{ height: 380 }}>
            <View className="items-center mb-8">
              <TouchableOpacity onPress={toggleBottomSheet} className="bg-red-500 w-32 h-12 rounded-b-xl items-center justify-center">
                <AntDesign name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <Text className="text-center text-blue-700 font-semibold text-lg mb-8">RÉSERVER POUR :</Text>

            <View className="gap-4">
              {['DÉJEUNER', 'DINER', 'PETIT-DÉJEUNER'].map((meal) => (
                <TouchableOpacity key={meal} onPress={() => { setSelectedMeal(meal); setStep(2); }} className="bg-blue-600 p-4 rounded-xl shadow-lg">
                  <Text className="text-white text-center font-semibold text-base">{meal}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 2 && (
          <View className="bg-white rounded-t-3xl px-6" style={{ height: 350 }}>
            <View className="items-center mb-8">
              <TouchableOpacity onPress={() => setStep(1)} className="bg-red-500 w-32 h-12 rounded-b-xl items-center justify-center">
                <MaterialIcons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <Text className="text-center text-blue-700 font-bold text-base mb-8">CHOISISSEZ LES JOURS :</Text>

            <View className="flex-row flex-wrap justify-center gap-2">
              {days.map((day) => (
                <TouchableOpacity key={day} onPress={() => toggleDay(day)} className="rounded-xl px-2 py-2 border" style={{
                  backgroundColor: selectedDays.includes(day) ? '#2563eb' : '#E5E7EB',
                  borderColor: selectedDays.includes(day) ? '#1E3A8A' : '#D1D5DB',
                }}>
                  <Text style={{ color: selectedDays.includes(day) ? 'white' : '#4B5563', fontWeight: 'bold' }}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={() => selectedDays.length > 0 && setStep(3)} className="bg-blue-600 p-4 rounded-xl shadow-lg mt-10">
              <Text className="text-white text-center font-semibold text-base">CONTINUER</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View className="bg-white rounded-t-3xl px-6" style={{ height: 350 }}>
            <View className="items-center mb-8">
              <TouchableOpacity onPress={() => setStep(2)} className="bg-red-500 w-32 h-12 rounded-b-xl items-center justify-center">
                <MaterialIcons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <Text className="text-center text-blue-700 font-bold text-base mb-8">SAISIR LE MATRICULE DE L'ÉTUDIANT :</Text>

            <TextInput
              className="border border-gray-300 rounded-xl p-4 text-lg text-center mb-8"
              placeholder="Matricule de l'étudiant"
              value={studentMatricule}
              onChangeText={setStudentMatricule}
              keyboardType="default"
              autoCapitalize="none"
            />

            <TouchableOpacity
              onPress={() => studentMatricule.trim() !== '' && setIsConfirmVisible(true)}
              className="bg-blue-600 p-4 rounded-xl shadow-lg"
            >
              <Text className="text-white text-center font-semibold text-base">CONFIRMER</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>

      {/* CONFIRMATION */}
      <Modal isVisible={isConfirmVisible} onBackdropPress={() => setIsConfirmVisible(false)}>
        <View className="bg-white p-6 rounded-2xl w-96">
          <Text className="text-2xl font-bold text-center mb-6">CONFIRMATION</Text>
          <Text className="text-center mb-2 text-lg">Vous avez choisi {selectedMeal.toLowerCase()} pour :</Text>
          <Text className="text-center mb-2 text-lg font-semibold">{getFullDayNames(selectedDays)}</Text>
          <Text className="text-center mb-4 text-lg">Pour le matricule : <Text className="font-semibold">{studentMatricule}</Text></Text>
          <TouchableOpacity onPress={handleConfirmReservation} className="bg-green-500 p-4 rounded-xl mt-2 mb-2">
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-center font-bold text-lg">CONFIRMER</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsConfirmVisible(false)} className="bg-red-500 p-4 rounded-xl">
            <Text className="text-center font-bold text-white text-lg">RETOUR</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* SUCCÈS */}
      <Modal isVisible={isSuccessVisible} onBackdropPress={resetAll}>
        <View className="bg-white p-6 rounded-2xl items-center">
          <AntDesign name="checkcircle" size={64} color="green" />
          <Text className="font-bold text-center mt-3 text-green-600 text-2xl">Réservation effectuée avec succès !</Text>
          <Text className="text-center mt-2 text-gray-700 text-lg">Repas : {selectedMeal}</Text>
          <Text className="text-center mt-2 text-gray-700 text-lg">Jours : {getFullDayNames(selectedDays)}</Text>
          <Text className="text-center mt-2 text-gray-700 text-lg">Pour le matricule : {studentMatricule}</Text>
          <TouchableOpacity onPress={resetAll} className="mt-4 bg-green-500 px-4 py-2 rounded-lg">
            <Text className="text-white font-bold text-lg">OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ÉCHEC */}
      <Modal isVisible={isFailureVisible} onBackdropPress={() => setIsFailureVisible(false)}>
        <View className="bg-white p-6 rounded-2xl items-center">
          <MaterialIcons name="error-outline" size={64} color="red" />
          <Text className="text-lg font-bold text-center mt-3 text-red-600">Réservation échouée !</Text>
          <Text className="text-center text-gray-600 mt-2 whitespace-pre-line">{errorMessage}</Text>
          <TouchableOpacity onPress={() => setIsFailureVisible(false)} className="mt-4 bg-gray-300 px-4 py-2 rounded-lg">
            <Text className="text-gray-800 font-bold">Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

export default ReserveOtherSheet;