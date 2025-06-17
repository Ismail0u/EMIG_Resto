// app/notifications.tsx

import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native'; // Importez ScrollView
import { SafeAreaView } from 'react-native-safe-area-context';

// Importez vos dimensions responsives
import r from '../utils/responsiveDimensions';

// Définir les types de catégorie
type NotificationCategory = 'Tout' | 'Réservation' | 'Achat' | 'Recharge' | 'Autre';

// Données fictives pour les notifications avec une catégorie
const dummyNotifications = [
  { id: '6', title: 'Achat de 2 tickets', message: 'Votre achat de 2 tickets de déjeuner est confirmé.', time: 'il y a 2 secondes', category: 'Achat' as NotificationCategory },
  { id: '1', title: 'Nouvelle réservation confirmée', message: 'Votre réservation pour le déjeuner de demain a été confirmée.', time: 'il y a 5 min', category: 'Réservation' as NotificationCategory },
  { id: '2', title: 'Mise à jour du menu', message: 'Le menu du DINER a été mis à jour pour cette semaine.', time: 'Hier', category: 'Autre' as NotificationCategory },
  { id: '3', title: 'Ticket utilisé', message: 'Un ticket a été utilisé pour le déjeuner le 20 mai.', time: 'il y a 2 jours', category: 'Achat' as NotificationCategory },
  { id: '4', title: 'Rappel de réservation', message: 'N\'oubliez pas votre réservation de petit-déjeuner le 25 mai.', time: 'il y a 4 jours', category: 'Réservation' as NotificationCategory },
  { id: '5', title: 'Nouveau service disponible', message: 'Découvrez notre nouveau service de livraison de repas.', time: 'il y a 1 semaine', category: 'Autre' as NotificationCategory },
  { id: '6', title: 'Achat de 2 tickets', message: 'Votre achat de 2 tickets de déjeuner est confirmé.', time: 'il y a 2 semaines', category: 'Achat' as NotificationCategory },
];

const NotificationItem = ({ title, message, time }: { title: string; message: string; time: string }) => (
  <View className="bg-blue-50 rounded-lg p-4 mt-3 flex-row justify-between items-start shadow-md shadow-black/5 elevation-2">
    <View className="flex-1 mr-3">
      <Text className="text-base font-bold text-gray-800 mb-1">{title}</Text>
      <Text className="text-sm text-gray-600">{message}</Text>
    </View>
    <Text className="text-xs text-gray-500 self-start">{time}</Text>
  </View>
);

export default function NotificationsPage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'home' | 'notif' | 'profile'>('notif');
  // Nouvel état pour la catégorie de notification sélectionnée
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>('Tout');

  // Les catégories disponibles
  const categories: NotificationCategory[] = ['Tout', 'Réservation', 'Achat', 'Recharge', 'Autre'];

  // Filtrer les notifications basées sur la catégorie sélectionnée
  const filteredNotifications = selectedCategory === 'Tout'
    ? dummyNotifications
    : dummyNotifications.filter(notification => notification.category === selectedCategory);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />

      {/* En-tête personnalisé */}
      <View
        className="flex-row items-center justify-between bg-white border-b border-gray-200 shadow-lg shadow-black/5 elevation-3"
        style={{ paddingHorizontal: r.paddingHorizontal, paddingVertical: r.paddingTop }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Feather name="arrow-left" size={r.iconSize} color="#2563eb" />
        </TouchableOpacity>
        <Text
          className="font-bold text-blue-700"
          style={{ fontSize: r.headerGreetingFontSize * 0.9 }}
        >
          Notifications
        </Text>
        <View style={{ width: r.iconSize }} />
      </View>

      {/* Barre de filtres de catégorie */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="py-3 px-2 bg-white border-b border-gray-100 shadow-sm shadow-black/5"
        contentContainerStyle={{ paddingLeft: r.paddingHorizontal - 8, paddingRight: r.paddingHorizontal - 8 }} // Ajustement du padding pour les boutons
      >
        {categories.map((category) => (
      <TouchableOpacity
  key={category}
  onPress={() => setSelectedCategory(category)}
  className={`py-2 rounded-xl mx-1 ${
    selectedCategory === category ? 'bg-blue-600' : 'bg-gray-200'
  }`}
  style={{
    width: 85,
    height:40, // ← Taille fixe pour tous
    alignItems: 'center', 
    justifyContent: 'center',
  }}
>
  <Text
    className={`${
      selectedCategory === category ? 'text-white font-semibold' : 'text-gray-700'
    }`}
  >
    {category}
  </Text>
</TouchableOpacity>



        ))}
      </ScrollView>

      <FlatList
        data={filteredNotifications} // Utilise les notifications filtrées
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            title={item.title}
            message={item.message}
            time={item.time}
          />
        )}
        contentContainerStyle={{ paddingHorizontal: r.paddingHorizontal, paddingBottom: r.bottomNavBarHeight + r.paddingBottomForScroll + r.paddingTop / 2 }} // Ajustement pour laisser de la place à la bottom nav
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center mt-12">
            <Text className="text-base text-gray-600">Aucune notification pour le moment dans cette catégorie.</Text>
          </View>
        }
      />

      {/* BARRE DE NAVIGATION INFÉRIEURE */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingVertical: r.bottomNavPaddingVertical,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 5,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <TouchableOpacity
          className="items-center"
          onPress={() => {
            // Pas de navigation ici, on est déjà sur la page des notifications
            // selectedTab est déjà 'notif' par défaut pour cette page
          }}
        >
          <Feather name="bell" size={r.bottomNavIconSize} color={selectedTab === 'notif' ? '#3B82F6' : '#4b5563'} />
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => {
            setSelectedTab('home');
            router.push('/');
          }}
        >
          <Feather name="home" size={r.bottomNavIconSize} color={selectedTab === 'home' ? '#3B82F6' : '#4b5563'} />
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center"
          onPress={() => {
            setSelectedTab('profile');
            // router.push('/profile'); // Décommentez si vous avez une page de profil
          }}
        >
          <Feather name="user" size={r.bottomNavIconSize} color={selectedTab === 'profile' ? '#3B82F6' : '#4b5563'} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}