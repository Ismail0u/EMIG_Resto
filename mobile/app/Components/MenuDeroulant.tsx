// menu_deroulant.tsx
import Entypo from '@expo/vector-icons/Entypo';
import React, { useRef, useState } from 'react';
import { Animated, LayoutAnimation, Platform, Text, TouchableOpacity, UIManager, View } from 'react-native';
import Modal from 'react-native-modal'; // Import Modal
import r from '../utils/responsiveDimensions';

// Ensure this is defined or imported in menu_deroulant.tsx if RepasBox relies on it
const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// Full day names mapping
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

// New type for selected days to cancel
interface SelectedDaysToCancel {
  [mealType: string]: string[];
}

const RepasBox = ({
  titre,
  joursActifs,
  deleteMode,
  onDayPress,
  selectedDaysToCancel,
}: {
  titre: string;
  joursActifs: string[];
  deleteMode: boolean;
  onDayPress?: (mealType: string, day: string) => void;
  selectedDaysToCancel?: string[]; // Only for this specific meal type
}) => {
  const isDaySelectedForCancellation = (day: string) => {
    return selectedDaysToCancel?.includes(day);
  };

  return (
    <View style={{ marginBottom: r.repasBoxMarginBottom }}>
      <Text
        style={{
          fontSize: r.repasBoxTitleFontSize,
          marginBottom: r.repasBoxTitleMarginBottom,
          marginTop: r.repasBoxTitleMarginTop,
        }}
        className="text-white text-center font-bold"
      >
        {titre}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: r.jourBoxPaddingH / 2 }}>
        {jours.map((jour) => {
          const isActive = joursActifs.includes(jour);
          const isSelected = deleteMode && isDaySelectedForCancellation(jour);

          return (
            <TouchableOpacity
              key={jour}
              onPress={() => deleteMode && isActive && onDayPress && onDayPress(titre, jour)}
              activeOpacity={deleteMode && isActive ? 0.7 : 1}
              style={{
                borderRadius: r.jourBoxRadius,
                paddingHorizontal: r.jourBoxPaddingH,
                paddingVertical: r.jourBoxPaddingV,
                marginHorizontal: r.jourBoxMarginH,
                backgroundColor: deleteMode && isActive
                  ? (isSelected ? '#ef4444' : '#22c55e') // Red if selected for cancellation, Green if active in delete mode
                  : isActive
                  ? '#22c55e' // Original red for active if not in delete mode or not selected
                  : 'rgba(255,255,255,0.4)',
                position: 'relative',
              }}
            >
              <Text
                style={{
                  fontSize: r.jourFontSize,
                  textAlign: 'center',
                  color: '#ffffff', // Always white text for better visibility
                  fontWeight: isActive ? 'bold' : 'normal',
                }}
              >
                {jour}
              </Text>
              {deleteMode && isActive && !isSelected && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.2)', // Translucent overlay for the cross
                    borderRadius: r.jourBoxRadius,
                  }}
                >
                  <Entypo name="cross" size={r.jourFontSize * 1.5} color="rgba(255,255,255,0.7)" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MenuDeroulantProps {
  reservations: { [key: string]: string[] };
  onCancelReservations: (reservationsToCancel: SelectedDaysToCancel) => void;
}

export default function MenuDeroulant({ reservations, onCancelReservations }: MenuDeroulantProps) {
  const [expanded, setExpanded] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedDaysToCancel, setSelectedDaysToCancel] = useState<SelectedDaysToCancel>({});
  const [isConfirmCancelVisible, setIsConfirmCancelVisible] = useState(false);
  const [isSuccessCancelVisible, setIsSuccessCancelVisible] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
    Animated.timing(animation, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const toggleDeleteMode = () => {
    // If entering delete mode, expand the menu
    if (!deleteMode && !expanded) {
      toggleExpand();
    } else if (deleteMode && Object.keys(selectedDaysToCancel).length === 0) {
      // If exiting delete mode and nothing selected, collapse if it was expanded due to delete mode
      if (expanded) {
        toggleExpand();
      }
    }
    setSelectedDaysToCancel({}); // Reset selected days when toggling delete mode
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDeleteMode((prev) => !prev);
  };

  const handleDayPress = (mealType: string, day: string) => {
    setSelectedDaysToCancel((prev) => {
      const currentSelection = prev[mealType] || [];
      const isAlreadySelected = currentSelection.includes(day);

      if (isAlreadySelected) {
        return {
          ...prev,
          [mealType]: currentSelection.filter((d) => d !== day),
        };
      } else {
        return {
          ...prev,
          [mealType]: [...currentSelection, day],
        };
      }
    });
  };

  const showConfirmCancelModal = () => {
    setIsConfirmCancelVisible(true);
  };

  const confirmCancellation = () => {
    setIsConfirmCancelVisible(false);
    onCancelReservations(selectedDaysToCancel); // Call the parent's cancellation logic
    setIsSuccessCancelVisible(true); // Show success modal

    // Automatically hide success modal and reset after a short delay
    setTimeout(() => {
      setIsSuccessCancelVisible(false);
      setSelectedDaysToCancel({}); // Clear selection after cancellation
      setDeleteMode(false); // Exit delete mode
      if (expanded) { // Collapse if it was expanded for deletion
        toggleExpand();
      }
    }, 2500); // 2.5 seconds
  };

  const cancelCancellationProcess = () => {
    setIsConfirmCancelVisible(false);
    // Optionally, clear selected days here if the user cancels the confirmation
    // setSelectedDaysToCancel({});
  };

  // Function to get all selected day full names for the confirmation message
  const getSelectedFullDayNames = () => {
    const allSelectedDays: string[] = [];
    for (const mealType in selectedDaysToCancel) {
      if (selectedDaysToCancel.hasOwnProperty(mealType)) {
        allSelectedDays.push(...selectedDaysToCancel[mealType]);
      }
    }
    const uniqueSelectedDays = Array.from(new Set(allSelectedDays)); // Get unique days
    return getFullDayNames(uniqueSelectedDays);
  };

  const hasSelectedDays = Object.values(selectedDaysToCancel).some((arr) => arr.length > 0);

  const menuHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, r.proportionalExpandedHeight],
  });

  return (
    <View
      style={{
        backgroundColor: '#2563eb',
        borderRadius: r.borderRadiusExpandable,
        padding: r.expandablePadding,
        marginTop: r.expandableMarginTop,
        marginHorizontal: r.expandableMarginHorizontal,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
      }}
    >
      {/* Trash/Cross Icon */}
      <TouchableOpacity
        onPress={toggleDeleteMode}
        style={{ position: 'absolute', top: r.expandablePadding, right: r.expandablePadding, zIndex: 1 }}
      >
        {deleteMode ? (
          <Entypo name="cross" size={r.iconSize} color="white" /> // Cross icon when in delete mode
        ) : (
          <Entypo name="trash" size="18px" color="white" /> // Trash icon by default
        )}
      </TouchableOpacity>

      <RepasBox
        titre="Déjeuner"
        joursActifs={reservations['Déjeuner'] || []}
        deleteMode={deleteMode}
        onDayPress={handleDayPress}
        selectedDaysToCancel={selectedDaysToCancel['Déjeuner']}
      />
      <Animated.View style={{ height: menuHeight, overflow: 'hidden' }}>
        <RepasBox
          titre="Diner"
          joursActifs={reservations['Diner'] || []}
          deleteMode={deleteMode}
          onDayPress={handleDayPress}
          selectedDaysToCancel={selectedDaysToCancel['Diner']}
        />
        <RepasBox
          titre="Petit-Déjeuner"
          joursActifs={reservations['Petit-Déjeuner'] || []}
          deleteMode={deleteMode}
          onDayPress={handleDayPress}
          selectedDaysToCancel={selectedDaysToCancel['Petit-DÉJEUNER']}
        />
      </Animated.View>

      <TouchableOpacity
        onPress={hasSelectedDays ? showConfirmCancelModal : toggleExpand}
        style={{ alignItems: 'center', marginTop: r.repasBoxTitleMarginTop }}
      >
        {deleteMode && hasSelectedDays ? (
          <Text style={{ color: 'red', fontSize: r.jourFontSize, fontWeight: 'bold' }}>
            ANNULER LES RÉSERVATIONS
          </Text>
        ) : expanded ? (
          <Entypo name="chevron-up" size={r.iconSize} color="white" />
        ) : (
          <Entypo name="chevron-down" size={r.iconSize} color="white" />
        )}
      </TouchableOpacity>

      {/* Confirmation Modal */}
      <Modal isVisible={isConfirmCancelVisible} onBackdropPress={() => setIsConfirmCancelVisible(false)}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 15, alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 }}>
            CONFIRMATION D'ANNULATION
          </Text>
          <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
            Voulez-vous vraiment annuler les réservations pour les jours sélectionnés :{' '}
            <Text style={{ fontWeight: 'bold' }}>{getSelectedFullDayNames()}</Text> ?
          </Text>
          <TouchableOpacity
            onPress={confirmCancellation}
            style={{
              backgroundColor: '#ef4444', // Red for confirm cancellation
              paddingVertical: 12,
              paddingHorizontal: 30,
              borderRadius: 10,
              marginBottom: 10,
              width: '80%',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>CONFIRMER</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={cancelCancellationProcess}
            style={{
              backgroundColor: '#9ca3af', // Gray for cancel
              paddingVertical: 12,
              paddingHorizontal: 30,
              borderRadius: 10,
              width: '80%',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>ANNULER</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal isVisible={isSuccessCancelVisible} onBackdropPress={() => setIsSuccessCancelVisible(false)}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 15, alignItems: 'center' }}>
          <Entypo name="check" size={60} color="green" />
          <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginTop: 10, color: 'green' }}>
            Annulation réussie !
          </Text>
          <TouchableOpacity
            onPress={() => setIsSuccessCancelVisible(false)}
            style={{
              marginTop: 20,
              backgroundColor: '#22c55e', // Green for OK
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>OK</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}