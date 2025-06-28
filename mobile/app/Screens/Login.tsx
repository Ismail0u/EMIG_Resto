import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, Pressable, View, Image, Platform } from 'react-native';
import Modal from 'react-native-modal';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFullScreenLoading, setIsFullScreenLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setIsFullScreenLoading(true);

    // Données à envoyer - ajout de debug
    const loginData = { email, password };
    console.log('📤 Données envoyées:', loginData);

    try {
      // Étape 1: Authentification avec plus de debug
      console.log('🚀 Tentative de connexion à:', 'http://127.0.0.1:8000/api/auth/token/');
      
      const response = await fetch('http://127.0.0.1:8000/api/auth/token/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(loginData),
      });

      console.log('📊 Status de la réponse:', response.status);
      console.log('📊 Headers de la réponse:', response.headers);

      // Lire la réponse comme texte d'abord pour débugger
      const responseText = await response.text();
      console.log('📄 Réponse brute du serveur:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ Données parsées:', data);
      } catch (parseError) {
        console.error('❌ Erreur de parsing JSON:', parseError);
        throw new Error(`Réponse invalide du serveur: ${responseText}`);
      }

      if (!response.ok) {
        // Log détaillé de l'erreur
        console.error('❌ Erreur serveur:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        
        // Messages d'erreur plus spécifiques
        if (response.status === 400) {
          throw new Error(data.detail || data.message || 'Données invalides. Vérifiez vos identifiants.');
        } else if (response.status === 401) {
          throw new Error('Identifiants incorrects.');
        } else if (response.status === 404) {
          throw new Error('Service de connexion non trouvé.');
        } else {
          throw new Error(data.detail || `Erreur serveur (${response.status})`);
        }
      }

      console.log('✅ Connexion réussie, tokens reçus');

      // Étape 2: Récupération des détails utilisateur
      console.log('🔍 Récupération des détails utilisateur...');
      
      const userDetailsResponse = await fetch('http://127.0.0.1:8000/api/user-details/', {
        headers: {
          'Authorization': `Bearer ${data.access}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      console.log('📊 Status user-details:', userDetailsResponse.status);

      if (!userDetailsResponse.ok) {
        const errorText = await userDetailsResponse.text();
        console.error('❌ Erreur user-details:', errorText);
        throw new Error('Impossible de récupérer les détails utilisateur.');
      }

      const userDetails = await userDetailsResponse.json();
      console.log('👤 Détails utilisateur:', userDetails);

      if (!userDetails?.id) {
        console.error('❌ ID utilisateur manquant dans:', userDetails);
        throw new Error('Identifiant utilisateur manquant.');
      }

      // Étape 3: Stockage des données
      console.log('💾 Stockage des données...');
      await AsyncStorage.setItem('access_token', data.access);
      await AsyncStorage.setItem('refreshToken', data.refresh);
      await AsyncStorage.setItem('user_id', String(userDetails.id));
      await AsyncStorage.setItem('user_email', userDetails.email);

      console.log('✅ Données stockées avec succès');

      // Étape 4: Navigation
      console.log('🧭 Navigation vers homepage...');
      router.replace('/Screens/homepage');
      
      setTimeout(() => {
        setIsFullScreenLoading(false);
      }, 500);

    } catch (error) {
      console.error('💥 Erreur complète:', error);
      setIsFullScreenLoading(false);
      
      Alert.alert(
        'Erreur de connexion', 
        error.message || 'Impossible de se connecter. Vérifiez votre connexion.'
      );
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      {/* Conteneur pour le logo et le texte */}
      <View className="items-center mb-6">
        <Image
          source={require('../icons/emig_logo.png')}
          style={{ width: 100, height: 100, marginBottom: 4 }}
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

      <Pressable 
        className="mb-4" 
        onPress={() => {}}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <Text className="text-right text-sm text-gray-800">Mot de passe oublié ?</Text>
      </Pressable>

      <Pressable
        className="bg-[#12A2E1] p-3 rounded-xl mb-4 w-full max-w-xs"
        onPress={handleLogin}
        disabled={isFullScreenLoading}
        style={({ pressed }) => ({
          opacity: pressed || isFullScreenLoading ? 0.7 : 1
        })}
      >
        <Text className="text-white text-center font-bold">
          {isFullScreenLoading ? 'CONNEXION EN COURS...' : 'SE CONNECTER'}
        </Text>
      </Pressable>

      <Text className="text-center text-sm text-gray-400">
        Vous n'avez pas de compte ?{' '}
        <Text 
          className="font-bold text-gray-800" 
          onPress={() => router.push('/Screens/Register')}
        >
          Créer un compte
        </Text>
      </Text>

      {/* Modal de chargement - sans useNativeDriver pour éviter les warnings */}
      <Modal
        isVisible={isFullScreenLoading}
        animationIn="fadeIn"
        animationOut="fadeOut"
        useNativeDriver={Platform.OS !== 'web'} // Désactiver sur web
        statusBarTranslucent={true}
        backdropOpacity={1}
      >
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: 'white' 
        }}>
          <Image
            source={require('../icons/emig_logo.png')}
            style={{ width: 200, height: 200, marginBottom: 20 }}
            resizeMode="contain"
          />
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            color: '#12A2E1' 
          }}>
            Chargement...
          </Text>
        </View>
      </Modal>
    </View>
  );
}