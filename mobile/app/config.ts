// src/config/config.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'API_BASE_URL';
//const DEFAULT_BASE_URL = 'http://192.168.43.227:8000'; // fallback local
const DEFAULT_BASE_URL = 'http://127.0.0.1:8000';

export const getApiUrl = async (): Promise<string> => {
  try {
    const savedUrl = await AsyncStorage.getItem(STORAGE_KEY);
    return savedUrl || DEFAULT_BASE_URL;
  } catch (error) {
    console.error('Erreur lors de la lecture de l’URL API :', error);
    return DEFAULT_BASE_URL;
  }
};

export const setApiUrl = async (url: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, url);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l’URL API :', error);
  }
};
