import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [matricule, setMatricule] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [sexe, setSexe] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('ETUDIANT');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom, prenom, matricule, email, telephone, password, sexe, role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Succès", "Compte créé avec succès.");
        router.push('/Screens/Login');
      } else {
        console.log("Erreur côté backend:", data);
        Alert.alert("Erreur", "Création échouée : " + JSON.stringify(data));
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      Alert.alert("Erreur", "Impossible de joindre le serveur.");
    }
  };

  const renderRadioButton = (label: string, value: string) => (
    <TouchableOpacity
      className="flex-row items-center mb-2"
      onPress={() => setSexe(value)}
    >
      <View className="w-5 h-5 rounded-full border-2 border-gray-500 mr-2 items-center justify-center">
        {sexe === value && <View className="w-3 h-3 rounded-full bg-[#12A2E1]" />}
      </View>
      <Text className="text-gray-800">{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white justify-center px-6">
      <Text className="text-2xl font-bold text-[#12A2E1] mb-6">Créer un nouveau compte</Text>

      <TextInput placeholder="Nom" value={nom} onChangeText={setNom} className="bg-gray-100 p-3 rounded mb-4" placeholderTextColor="#c1c1c1" />
      <TextInput placeholder="Prénom" value={prenom} onChangeText={setPrenom} className="bg-gray-100 p-3 rounded mb-4" placeholderTextColor="#c1c1c1" />
      <TextInput placeholder="Numéro de matricule" value={matricule} onChangeText={setMatricule} className="bg-gray-100 p-3 rounded mb-4" placeholderTextColor="#c1c1c1" />
      <TextInput placeholder="Adresse mail" value={email} onChangeText={setEmail} className="bg-gray-100 p-3 rounded mb-4" placeholderTextColor="#c1c1c1" />
      <TextInput placeholder="Numéro de téléphone" value={telephone} onChangeText={setTelephone} className="bg-gray-100 p-3 rounded mb-4" placeholderTextColor="#c1c1c1" />
  {/* MODIFIÉ ICI : Nouvelle structure pour les boutons radio */}
        <View className="flex-row items-center mb-4">
          <Text className="text-gray-700 font-semibold mr-4 mb-1">Sexe :</Text>
          <View className="flex-row"> {/* Conteneur pour les boutons radio eux-mêmes */}
            {renderRadioButton('Féminin  ', 'F')} {/* Ordre changé */}
            {renderRadioButton('Masculin', 'M')}
          </View>
        </View>

      <TextInput placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry className="bg-gray-100 p-3 rounded mb-4" placeholderTextColor="#c1c1c1" />
      <TextInput placeholder="Confirmer le mot de passe" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry className="bg-gray-100 p-3 rounded mb-4" placeholderTextColor="#c1c1c1" />

      <TouchableOpacity className="bg-[#12A2E1] p-3 rounded-xl mb-4" onPress={handleRegister}>
        <Text className="text-white text-center font-bold">CRÉER UN COMPTE</Text>
      </TouchableOpacity>

      <Text className="text-center text-sm">
        Vous avez déjà un compte ?{' '}
        <Text className="font-bold text-[#12A2E1]" onPress={() => router.push('/Screens/Login')}>
          Se connecter
        </Text>
      </Text>
    </View>
  );
}
