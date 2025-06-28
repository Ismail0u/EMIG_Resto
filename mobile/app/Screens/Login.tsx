import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View, Image } from 'react-native';
import Modal from 'react-native-modal'; // <-- Assurez-vous que cette importation est bien présente

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Gardé pour désactiver le bouton pendant le chargement
  const [isFullScreenLoading, setIsFullScreenLoading] = useState(false); // Nouvel état pour l'écran de chargement

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setIsFullScreenLoading(true); // Afficher l'écran de chargement plein écran
    setLoading(true); // Désactiver le bouton pour éviter les clics multiples

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Succès', 'Connexion réussie!');
        await AsyncStorage.setItem('access_token', data.access);
        await AsyncStorage.setItem('refreshToken', data.refresh);
          // NOUVEAU : récupérer l'ID de l'étudiant connecté
        const userDetailsResponse = await fetch('http://127.0.0.1:8000/api/user-details/', {
          headers: {
           'Authorization': `Bearer ${data.access}`,
           'Content-Type': 'application/json',
          },
         });

        const userDetails = await userDetailsResponse.json();
          // Stocker l'ID de l'étudiant (reservant_pour)
        if (userDetails?.id) { // Access the 'id' directly from userDetails
  await AsyncStorage.setItem('user_id', String(userDetails.id));
  await AsyncStorage.setItem('user_email', userDetails.email); // Good to store email too
} else {
  Alert.alert('Erreur', "Impossible de récupérer l'identifiant étudiant. (ID manquant)");
  setIsFullScreenLoading(false); // Make sure to hide loading on error
  setLoading(false);
  return;
}
router.replace('/Screens/homepage'); // Use router.replace to prevent going back to login
      } else {
        Alert.alert('Erreur de connexion', data.detail || JSON.stringify(data) || 'Identifiants incorrects.');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      Alert.alert('Erreur', 'Impossible de se connecter. Veuillez vérifier votre connexion ou réessayer.');
    } finally {
      setIsFullScreenLoading(false); // Masquer l'écran de chargement
      setLoading(false); // Réactiver le bouton
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      {/* Conteneur pour le logo et le texte, centré horizontalement */}
      <View className="items-center mb-6">
        {/* Vérifiez le chemin du logo PNG */}
        <Image
          source={require('../icons/emig_logo.png')} // Assurez-vous que ce chemin est correct
          style={{ width: 100, height: 100, marginBottom: 4 }} // Ajustez width et height selon vos besoins
          resizeMode="contain"
        />
        <Text className="text-2xl font-bold text-[#12A2E1]">Bienvenue sur </Text>
        <Text className="text-3xl font-bold text-red-500 mb-6">EMIGResto</Text>
      </View>

      <TextInput
        placeholder="Numéro de matricule ou adresse mail"
        placeholderTextColor="#C1C1C1"
        className="bg-gray-100 p-3 rounded mb-4 w-full max-w-xs"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Mot de passe"
        placeholderTextColor="#C1C1C1"
        secureTextEntry
        className="bg-gray-100 p-3 rounded mb-2 w-full max-w-xs"
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity className="mb-4" onPress={() => {}}>
        <Text className="text-right text-sm text-gray-800">Mot de passe oublié ?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-[#12A2E1] p-3 rounded-xl mb-4 w-full max-w-xs"
        onPress={handleLogin}
        disabled={loading}
      >
        <Text className="text-white text-center font-bold">
          {loading ? 'CONNEXION EN COURS...' : 'SE CONNECTER'}
        </Text>
      </TouchableOpacity>

      <Text className="text-center text-sm text-gray-400">
        Vous n’avez pas de compte ?{' '}
        <Text className="font-bold text-gray-800" onPress={() => router.push('/Screens/Register')}>
          Créer un compte
        </Text>
      </Text>

      {/* <-- MODAL DE CHARGEMENT PLEIN ÉCRAN --> */}
      <Modal
        isVisible={isFullScreenLoading}
        animationIn="fadeIn" // Animation d'apparition
        animationOut="fadeOut" // Animation de disparition
        useNativeDriver={true} // Recommandé pour de meilleures performances
        statusBarTranslucent={true} // <-- C'est la propriété clé à ajouter
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
          <Image
            source={require('../icons/emig_logo.png')} // Votre icône du logo
            style={{ width: 200, height: 200, marginBottom: 20 }} // Taille plus grande
            resizeMode="contain"
          />
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#12A2E1' }}>Chargement...</Text>
        </View>
      </Modal>
    </View>
  );
}