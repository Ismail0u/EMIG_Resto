import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, Pressable, View, Image, Platform } from 'react-native';
import Modal from 'react-native-modal';
import { getApiUrl } from '../config';

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
    const loginData = { email, password };

    try {
      const baseUrl = await getApiUrl();
      console.log('🚀 Connexion à:', `${baseUrl}/api/auth/token/`);

      const response = await fetch(`${baseUrl}/api/auth/token/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(loginData),
      });

      const responseText = await response.text();
      console.log('📄 Réponse brute:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ Données parsées:', data);
      } catch (parseError) {
        console.error('❌ JSON invalide:', parseError);
        throw new Error(`Réponse invalide du serveur: ${responseText}`);
      }

      if (!response.ok) {
        console.error('❌ Erreur HTTP:', response.status, data);
        if (response.status === 400) {
          throw new Error(data.detail || data.message || 'Identifiants invalides.');
        } else if (response.status === 401) {
          throw new Error('Identifiants incorrects.');
        } else if (response.status === 404) {
          throw new Error('Service non trouvé.');
        } else {
          throw new Error(data.detail || `Erreur serveur (${response.status})`);
        }
      }

      console.log('✅ Connexion réussie, récupération des infos...');

      const userDetailsResponse = await fetch(`${baseUrl}/api/user-details/`, {
        headers: {
          'Authorization': `Bearer ${data.access}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      const userDetailsText = await userDetailsResponse.text();
      if (!userDetailsResponse.ok) {
        console.error('❌ user-details erreur:', userDetailsText);
        throw new Error('Impossible de récupérer les informations utilisateur.');
      }

      const userDetails = JSON.parse(userDetailsText);
      console.log('👤 Utilisateur:', userDetails);

      if (!userDetails?.id) {
        throw new Error('ID utilisateur manquant.');
      }

      console.log('💾 Sauvegarde des tokens...');
      await AsyncStorage.setItem('access_token', data.access);
      await AsyncStorage.setItem('refreshToken', data.refresh);
      await AsyncStorage.setItem('user_id', String(userDetails.id));
      await AsyncStorage.setItem('user_email', userDetails.email);

      router.replace('/Screens/homepage');
      setTimeout(() => setIsFullScreenLoading(false), 500);

    } catch (error: any) {
      console.error('💥 Erreur login:', error);
      setIsFullScreenLoading(false);
      Alert.alert('Erreur de connexion', error.message || 'Vérifiez votre connexion réseau.');
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
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

      <Pressable onPress={() => router.push('/Screens/ApiConfigScreen')}>
        <Text className="text-sm text-gray-600 mt-6 underline">
          Configurer l'URL du serveur
        </Text>
      </Pressable>

      <Modal
        isVisible={isFullScreenLoading}
        animationIn="fadeIn"
        animationOut="fadeOut"
        useNativeDriver={Platform.OS !== 'web'}
        statusBarTranslucent
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
