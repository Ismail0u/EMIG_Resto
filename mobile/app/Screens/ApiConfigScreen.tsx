// src/screens/ApiConfigScreen.tsx
import React, { useEffect, useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import { getApiUrl,setApiUrl } from '../config';

const ApiConfigScreen: React.FC = () => {
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    const fetchUrl = async () => {
      const currentUrl = await getApiUrl();
      setUrl(currentUrl);
    };
    fetchUrl();
  }, []);

  const saveUrl = async () => {
    if (!url.startsWith('http')) {
      Alert.alert('❌ URL invalide', 'L’URL doit commencer par http ou https');
      return;
    }

    await setApiUrl(url);
    Alert.alert('✅ Succès', 'URL API sauvegardée');
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Adresse du backend Django :</Text>
      <TextInput
        value={url}
        onChangeText={setUrl}
        placeholder="http://192.168.43.227:8000"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 6,
          padding: 10,
          marginBottom: 12,
        }}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button title="Sauvegarder l’URL" onPress={saveUrl} />
    </View>
  );
};

export default ApiConfigScreen;
