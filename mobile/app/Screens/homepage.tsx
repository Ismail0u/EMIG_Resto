// homepage.tsx
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import ReloadBottomSheet from '../sheets/RechargeSheet';
import ReserveBottomSheet from '../sheets/ReservationSheet';
import TicketBottomSheet from '../sheets/TicketSheet';
import ReserveOtherSheet from '../sheets/ReserveOtherSheet'; // Import the new sheet
import r from '../utils/responsiveDimensions';
// Import the new MenuDeroulant component
import MenuDeroulant from '../Components/MenuDeroulant';

const bgColors: {
  [key: string]: {
    start: string;
    end: string;
    iconColor?: string;
  };
} = {
  primary100: { start: '#e0f2fe', end: '#bfdbfe' },
  primary200: { start: '#bfdbfe', end: '#93c5fd' },
  primary300: { start: '#93c5fd', end: '#60a5fa' },
  primary400: { start: '#60a5fa', end: '#3b82f6' },
  primary500: { start: '#3b82f6', end: '#2563eb' },
  primary600: { start: '#2563eb', end: '#1d4ed8' },
  primary700: { start: '#1d4ed8', end: '#1e40af' },
  VeryLightRed: { start: '#FFF0F5', end: '#FFE8EE', iconColor: '#DC143C' },
  VeryLightYellow: { start: '#FFFFF0', end: '#FFFACD', iconColor: '#DAA520' },
  VeryLightGreen: { start: '#F0FFF0', end: '#E0FFEB', iconColor: '#228B22' },
  VeryLightPurple: { start: '#F8F8FF', end: '#F0F0FF', iconColor: '#8A2BE2' },
  VeryLightBlue: { start: '#F0F8FF', end: '#E6F0FF', iconColor: '#1E90FF' },
  // Adding a new blue theme for "Reserve for another"
  CustomBlue: { start: '#ADD8E6', end: '#87CEEB', iconColor: '#4682B4' },
};

const OptionBox = ({
  iconName,
  titre,
  sousTitre,
  bgColor,
  onPress,
  iconColor,
}: {
  iconName: keyof typeof FontAwesome.glyphMap;
  titre: string;
  sousTitre?: string;
  bgColor: keyof typeof bgColors;
  onPress?: () => void;
  iconColor: string;
}) => {
  const colors = bgColors[bgColor];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        width: r.optionBoxWidth,
        height: r.optionBoxHeight,
        borderRadius: r.optionBoxRadius,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
      }}
    >
      <LinearGradient
        colors={[colors.start, colors.end]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: r.optionBoxRadius,
          padding: r.optionBoxPadding,
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: r.iconBorderRadius,
            padding: r.iconPadding,
            marginBottom: r.iconMarginBottom,
            alignItems: 'center',
            justifyContent: 'center',
            width: r.iconCircleSize,
            height: r.iconCircleSize,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          <FontAwesome name={iconName} size={r.iconSize} color={iconColor} />
        </View>
        <Text
          style={{
            color: iconColor,
            fontWeight: '600',
            textAlign: 'center',
            fontSize: 20,
          }}
        >
          {titre}
        </Text>
        {sousTitre && (
          <Text className="text-blue-900 text-center text-xs mt-1" numberOfLines={2} ellipsizeMode="tail">
            {sousTitre}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Homepage() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'home' | 'notif' | 'profile'>('home');
  const [isModalVisible, setModalVisible] = useState(false);
  const [isTicketModalVisible, setTicketModalVisible] = useState(false);
  const [isReserveModalVisible, setReserveModalVisible] = useState(false);
  const [isReloadModalVisible, setReloadModalVisible] = useState(false);
  // NEW: State for "Reserve for Another" modal
  const [isReserveOtherModalVisible, setReserveOtherModalVisible] = useState(false);

  const [userData, setUserData] = useState<{
    prenom: string;
    solde: number;
    nombre_tickets: number
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // MOVED HERE: useState for reservations
  const [reservations, setReservations] = useState<{ [key: string]: string[] }>({});


  const toggleTicketModal = () => setTicketModalVisible(!isTicketModalVisible);
  const toggleReserveModal = () => setReserveModalVisible(!isReserveModalVisible);
  const toggleReloadModal = () => setReloadModalVisible(!isReloadModalVisible);
  // NEW: Toggle function for "Reserve for Another" modal
  const toggleReserveOtherModal = () => setReserveOtherModalVisible(!isReserveOtherModalVisible);

  const toggleBottomSheet = () => setModalVisible((prev) => !isModalVisible);

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('access_token');

      if (!token) {
        router.replace('/Screens/Login');
        return;
      }
      console.log("Token being sent:", token);
      const response = await fetch('http://127.0.0.1:8000/api/user-details/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          await AsyncStorage.removeItem('access_token');
          router.replace('/Screens/Login');
          return;
        }
        throw new Error('Échec du chargement des données');
      }

      const data = await response.json();
      setUserData(data);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [router]);


const jourToAbbreviation: { [key: string]: string } = {
  'Lundi': 'Lun',
  'Mardi': 'Mar',
  'Mercredi': 'Mer',
  'Jeudi': 'Jeu',
  'Vendredi': 'Ven',
  'Samedi': 'Sam',
  'Dimanche': 'Dim',
};

const fetchReservations = useCallback(async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    if (!token) return;

   const response = await fetch('http://127.0.0.1:8000/api/reservations/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération des réservations');

    const responseData = await response.json();

    // Ajout sécurité car l’API Django retourne {count, next, previous, results}
    if (!responseData.results || !Array.isArray(responseData.results)) {
      console.error("Format inattendu :", responseData);
      return;
    }

    const repasMap: { [key: string]: string[] } = {
      'Petit-Déjeuner': [],
      'Déjeuner': [],
      'Diner': []
    };

    // CORRECTED: Iterate over responseData.results
    responseData.results.forEach((reservation: any) => {
  const periode = reservation.periode?.nomPeriode;
  const fullJourName = reservation.jour?.nomJour; // Get the full day name from API

  console.log(`Processing reservation: Periode: ${periode}, Full Day: ${fullJourName}`); // NEW LOG

  // Convert full day name to abbreviation
  const abbreviatedJour = jourToAbbreviation[fullJourName];

  console.log(`Converted to Abbreviated Day: ${abbreviatedJour}`); // NEW LOG

  if (periode && repasMap[periode] && abbreviatedJour && !repasMap[periode].includes(abbreviatedJour)) {
    repasMap[periode].push(abbreviatedJour);
    console.log(`Added ${abbreviatedJour} to ${periode}. Current ${periode} days: ${repasMap[periode]}`); // NEW LOG
  } else {
    console.log(`Did not add: Periode: ${periode}, Abbreviated Day: ${abbreviatedJour}. Condition failed: ${!periode || !repasMap[periode] || !abbreviatedJour || repasMap[periode].includes(abbreviatedJour)}`); // NEW LOG
  }
});

    console.log("Final repasMap after processing:", repasMap); // Keep this for verification
    setReservations(repasMap);
  } catch (error) {
    console.error("Erreur chargement des réservations:", error);
  }
}, []);
// NOUVELLE FONCTION DE RAPPEL POUR LA MISE À JOUR DES RÉSERVATIONS
  const handleReservationSuccess = useCallback(() => {
    console.log("Reservation successful! Re-fetching reservations...");
    fetchReservations(); // Appel à la fonction qui rafraîchit les données
  }, [fetchReservations]); // Dépend de fetchReservations pour garantir qu'elle est toujours à jour


  useEffect(() => {
  fetchUserData();
  fetchReservations();
}, [fetchUserData, fetchReservations]);


  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500 text-lg">{error}</Text>
        <TouchableOpacity
          className="mt-4 bg-blue-500 px-4 py-2 rounded"
          onPress={() => router.replace('/Screens/Login')}
        >
          <Text className="text-white">Se connecter</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white relative">
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: '#2563eb',
            borderBottomLeftRadius: r.borderRadiusExpandable,
            borderBottomRightRadius: r.borderRadiusExpandable,
            paddingHorizontal: r.headerPaddingHorizontal,
            paddingVertical: r.headerPaddingVertical,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 8,
          }}
        >
          <View style={{ marginBottom: r.headerGreetingMarginBottom }}>
            <Text style={{ fontSize: r.headerGreetingFontSize }} className="text-white">
              Bonjour {userData?.prenom || 'Utilisateur'},
            </Text>
          </View>
          <View style={{ marginBottom: r.headerAccountMarginBottom }}>
            <Text style={{ fontSize: r.headerAccountTitleFontSize, marginBottom: r.headerAccountTextOpacityMarginBottom }} className="text-white opacity-80">COMPTE</Text>
            <Text style={{ fontSize: r.headerAccountAmountFontSize, marginBottom: r.headerAccountAmountMarginBottom }} className="text-white font-bold">
              FCFA {userData?.solde?.toLocaleString('fr-FR') || '0'}
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: 'white',
            marginHorizontal: r.ticketsBoxMarginHorizontal,
            paddingVertical: r.ticketsBoxPaddingVertical,
            paddingHorizontal: r.ticketsBoxPaddingHorizontal,
            borderRadius: r.ticketsBoxRadius,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            marginTop: r.ticketsBoxMarginTop,
            zIndex: 10,
          }}
        >
          <Text
            style={{
              color: '#6b7280',
              fontSize: r.ticketsBoxTextFontSize,
              textAlign: 'center',
              letterSpacing: r.ticketsBoxTextTracking,
            }}
          >
            TICKETS RESTANTS
          </Text>
          <Text
            style={{
              color: 'black',
              fontWeight: 'bold',
              fontSize: r.ticketsBoxAmountFontSize,
              textAlign: 'center',
              marginTop: r.ticketsBoxSpaceY / 2,
            }}
          >
            {userData?.nombre_tickets || '0'} TICKETS
          </Text>
        </View>

        <Text
          style={{
            textAlign: 'center',
            color: '#9ca3af',
            marginTop: r.reservationTitleMarginTop,
            fontSize: r.reservationTitleFontSize,
            textTransform: 'uppercase',
            letterSpacing: r.reservationTitleLetterSpacing,
          }}
        >
          Réservation de la semaine
        </Text>

        {/* Use the new MenuDeroulant component here */}
        <MenuDeroulant reservations={reservations} onCancelReservations={() => {}} />

        <Animated.View
          style={{
            marginTop: 20, // This was `marginTopAnimation` previously, now it can be a fixed value or adjusted
            paddingHorizontal: r.paddingHorizontal,
            paddingTop: r.paddingTop,
          }}
        >
         <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: r.optionBoxSpacing }}>
            <OptionBox
              iconName="ticket"
              titre="ACHETER DES TICKETS"
              sousTitre=""
              bgColor="VeryLightYellow"
              onPress={toggleTicketModal}
              iconColor={bgColors.VeryLightYellow.iconColor || '#000000'}
            />
            <OptionBox
              iconName="calendar"
              titre="FAIRE UNE RÉSERVATION"
              sousTitre=""
              bgColor="VeryLightGreen"
              onPress={toggleReserveModal}
              iconColor={bgColors.VeryLightGreen.iconColor || '#000000'}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: r.optionBoxSpacing }}>
            <OptionBox
              iconName ="credit-card"
              titre="RECHARGER MON COMPTE"
              sousTitre=""
              bgColor="VeryLightRed"
              onPress={toggleReloadModal}
              iconColor={bgColors.VeryLightRed.iconColor || '#000000'}
            />
            {/* NEW: Option for "Réserver pour un autre" */}
            <OptionBox
              iconName="users"
              titre="RÉSERVER POUR AUTRUI"
              sousTitre=""
              bgColor="VeryLightBlue" // Using the new custom blue theme
              onPress={toggleReserveOtherModal} // Call the new toggle function
              iconColor={bgColors.VeryLightBlue.iconColor || '#000000'}
            />
          </View>
        </Animated.View>
        <View style={{ height: r.bottomNavBarHeight + r.paddingBottomForScroll }} />
      </ScrollView>

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
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 5,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        }}
      >
         <TouchableOpacity
          className="items-center"
          onPress={() => {
            setSelectedTab('notif');
            router.push('/Screens/notificationPage');
          }}
        >
          <Feather name="bell" size={r.bottomNavIconSize} color={selectedTab === 'notif' ? '#3B82F6' : 'lightgray'} />
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => setSelectedTab('home')}>
          <Feather name="home" size={r.bottomNavIconSize} color={selectedTab === 'home' ? '#3B82F6' : 'lightgray'} />
        </TouchableOpacity>
        <TouchableOpacity className="items-center" onPress={() => setSelectedTab('profile')}>
          <Feather name="user" size={r.bottomNavIconSize} color={selectedTab === 'profile' ? '#3B82F6' : 'lightgray'} />
        </TouchableOpacity>
      </View>
      <TicketBottomSheet isVisible={isTicketModalVisible} toggleBottomSheet={toggleTicketModal} />
      <ReserveBottomSheet
        isVisible={isReserveModalVisible}
        toggleBottomSheet={toggleReserveModal}
        onReservationSuccess={handleReservationSuccess}
      />
      <ReloadBottomSheet isVisible={isReloadModalVisible} toggleBottomSheet={toggleReloadModal} />
      {/* NEW: Render the ReserveOtherSheet component */}
      <ReserveOtherSheet
        isVisible={isReserveOtherModalVisible}
        toggleBottomSheet={toggleReserveOtherModal}
        onReservationSuccess={handleReservationSuccess} // Re-use the existing success handler
      />
    </View>
  );
}