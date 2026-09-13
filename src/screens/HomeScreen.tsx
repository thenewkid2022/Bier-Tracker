import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useShallow } from 'zustand/react/shallow';
import { DrinkIcon } from '../components/DrinkIcon';
import { useAppStore } from '../state/appStore';
import { getPlatformStyle, isAndroid } from '../utils/platformStyles';
import type { Drink } from '../domain/schemas';

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const { users, drinks, selectedUserId, hydrate, selectUser, purchaseDrink, isHydrating } =
    useAppStore(
      useShallow((s) => ({
        users: s.users,
        drinks: s.drinks,
        selectedUserId: s.selectedUserId,
        hydrate: s.hydrate,
        selectUser: s.selectUser,
        purchaseDrink: s.purchaseDrink,
        isHydrating: s.isHydrating,
      }))
    );
  const selectedUser = selectedUserId ? users.find((u) => u.id === selectedUserId) ?? null : null;
  const [isWide, setIsWide] = useState(width >= 900);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    hydrate().catch((error) => console.error('Fehler beim Hydraten der Daten:', error));
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsWide(window.width >= 900);
    });

    return () => subscription?.remove();
  }, []);

  const refreshData = async () => {
    await hydrate();
  };

  const handleDrinkPurchase = async (drink: Drink) => {
    if (!selectedUser) {
      Alert.alert('Fehler', 'Bitte wählen Sie zuerst einen Benutzer aus.');
      return;
    }

    if (drink.stock <= 0) {
      Alert.alert('Ausverkauft', 'Dieses Getränk ist leider nicht mehr verfügbar.');
      return;
    }

    // Modal für Mengenauswahl öffnen
    setSelectedDrink(drink);
    setSelectedQuantity(1);
    setQuantityModalVisible(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedDrink || !selectedUser) return;

    const maxQuantity = Math.min(selectedDrink.stock, 10); // Maximal 10 Getränke auf einmal
    const quantity = Math.min(selectedQuantity, maxQuantity);
    const totalPrice = selectedDrink.price * quantity;

    try {
      const newBalance = selectedUser.balance - totalPrice;
      const balanceMessage = newBalance < 0
        ? `Ihr offener Betrag: CHF ${Math.abs(newBalance).toFixed(2)}`
        : `Ihre Balance: CHF ${newBalance.toFixed(2)}`;

      await purchaseDrink({ userId: selectedUser.id, drinkId: selectedDrink.id, quantity });
      
      Alert.alert(
        'Erfolg', 
        `${quantity}x ${selectedDrink.name} wurde erfolgreich gekauft!\n\n${balanceMessage}`,
        [
          { text: 'OK', style: 'default' }
        ]
      );

      // Modal schließen
      setQuantityModalVisible(false);
      setSelectedDrink(null);
      setSelectedQuantity(1);
    } catch (error) {
      console.error('Fehler beim Kaufen des Getränks:', error);
      Alert.alert('Fehler', 'Beim Kaufen des Getränks ist ein Fehler aufgetreten.');
    }
  };

  const renderUserSelector = () => (
    <View style={styles.userSelectorContainer}>
      <Text style={styles.sectionTitle}>Benutzer auswählen</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.userList}>
          {users.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={[
                styles.userItem,
                selectedUser?.id === user.id && styles.userItemSelected,
              ]}
              onPress={() => selectUser(user.id)}
            >
              <Text style={[
                styles.userName,
                selectedUser?.id === user.id && styles.userNameSelected,
              ]}>
                {user.name}
              </Text>
              <Text style={[
                styles.userBalance,
                user.balance < 0 && styles.negativeBalance
              ]}>
                CHF {user.balance.toFixed(2)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderDrinksGrid = () => (
    <View style={styles.drinksContainer}>
      <View style={styles.drinksHeader}>
        <Text style={styles.sectionTitle}>Verfügbare Getränke</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={refreshData}
          disabled={isHydrating}
        >
          <MaterialIcons 
            name="refresh" 
            size={20} 
            color={isHydrating ? "#8E8E93" : "#007AFF"} 
          />
        </TouchableOpacity>
      </View>
      <View style={[styles.drinksGrid, isWide && styles.drinksGridWide]}>
        {drinks.map((drink) => (
          <TouchableOpacity
            key={drink.id}
            style={[
              styles.drinkItem,
              drink.stock <= 0 && styles.drinkItemOutOfStock,
            ]}
            onPress={() => handleDrinkPurchase(drink)}
            disabled={drink.stock <= 0}
          >
            <DrinkIcon iconKey={drink.iconKey} size={40} />
            <Text style={styles.drinkName}>{drink.name}</Text>
            <Text style={styles.drinkPrice}>CHF {drink.price.toFixed(2)}</Text>
            <Text style={[
              styles.drinkStock,
              drink.stock <= 5 && styles.drinkStockLow
            ]}>
              {drink.stock <= 0 ? 'Ausverkauft' : `${drink.stock} verfügbar`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderQuantityModal = () => (
    <Modal
      visible={quantityModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setQuantityModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Menge auswählen</Text>
            <TouchableOpacity 
              onPress={() => setQuantityModalVisible(false)}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          
          {selectedDrink && (
            <View style={styles.drinkInfoContainer}>
              <DrinkIcon iconKey={selectedDrink.iconKey} size={60} />
              <Text style={styles.drinkNameLarge}>{selectedDrink.name}</Text>
              <Text style={styles.drinkPriceLarge}>CHF {selectedDrink.price.toFixed(2)}</Text>
              <Text style={styles.drinkStockInfo}>
                {selectedDrink.stock} verfügbar
              </Text>
            </View>
          )}

          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Menge:</Text>
            <View style={styles.quantityInputContainer}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                disabled={selectedQuantity <= 1}
              >
                <MaterialIcons name="remove" size={20} color="#007AFF" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.quantityInput}
                value={selectedQuantity.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 1;
                  setSelectedQuantity(Math.max(1, Math.min(num, Math.min(selectedDrink?.stock || 1, 10))));
                }}
                keyboardType="numeric"
                textAlign="center"
                maxLength={2}
              />
              
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setSelectedQuantity(Math.min(selectedDrink?.stock || 1, selectedQuantity + 1, 10))}
                disabled={selectedQuantity >= Math.min(selectedDrink?.stock || 1, 10)}
              >
                <MaterialIcons name="add" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>

          {selectedDrink && (
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Gesamtpreis:</Text>
              <Text style={styles.totalPrice}>CHF {(selectedDrink.price * selectedQuantity).toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelModalButton}
              onPress={() => setQuantityModalVisible(false)}
            >
              <Text style={styles.cancelModalButtonText}>Abbrechen</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleConfirmPurchase}
            >
              <Text style={styles.confirmButtonText}>Kaufen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {renderUserSelector()}
      {renderDrinksGrid()}
      
      {!selectedUser && (
        <View style={styles.noUserContainer}>
          <Text style={styles.noUserTitle}>Kein Benutzer ausgewählt</Text>
          <Text style={styles.noUserTitle}>
            Bitte fügen Sie über den Admin-Bereich einen Benutzer hinzu, um Getränke kaufen zu können.
          </Text>
        </View>
      )}
      
      {selectedUser && drinks.length === 0 && (
        <View style={styles.noDrinksContainer}>
          <Text style={styles.noDrinksTitle}>Keine Getränke verfügbar</Text>
          <Text style={styles.noDrinksText}>
            Bitte fügen Sie über den Admin-Bereich Getränke hinzu.
          </Text>
        </View>
      )}

      {renderQuantityModal()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  loadingText: {
    fontSize: 18,
    color: '#8E8E93',
  },
  userSelectorContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 15,
  },
  userList: {
    flexDirection: 'row',
    gap: 15,
  },
  userItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    minWidth: 120,
    alignItems: 'center',
  },
  userItemSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 5,
  },
  userNameSelected: {
    color: '#007AFF',
  },
  userBalance: {
    fontSize: 14,
    color: '#8E8E93',
  },
  drinksContainer: {
    marginBottom: 30,
  },
  drinksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  drinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  drinksGridWide: {
    justifyContent: 'space-between',
  },
  drinkItem: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  drinkItemOutOfStock: {
    opacity: 0.5,
  },
  drinkName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  drinkPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  drinkStock: {
    fontSize: 14,
    color: '#8E8E93',
  },
  drinkStockLow: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  negativeBalance: {
    color: '#FF3B30',
    fontWeight: '600',
  },
  noUserContainer: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  noUserTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
    textAlign: 'center',
  },
  noUserText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 20,
  },
  noDrinksContainer: {
    backgroundColor: '#D1ECF1',
    borderColor: '#BEE5EB',
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  noDrinksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0C5460',
    marginBottom: 10,
    textAlign: 'center',
  },
  noDrinksText: {
    fontSize: 14,
    color: '#0C5460',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    padding: 4,
  },
  drinkInfoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  drinkNameLarge: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  drinkPriceLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  drinkStockInfo: {
    fontSize: 14,
    color: '#8E8E93',
  },
  quantityContainer: {
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 10,
    textAlign: 'center',
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  quantityButton: {
    ...getPlatformStyle('button'),
    width: 40,
    height: 40,
    borderRadius: isAndroid ? 20 : 20,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isAndroid ? 48 : 40,
    minWidth: isAndroid ? 48 : 40,
  },
  quantityInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelModalButton: {
    ...getPlatformStyle('button'),
    flex: 1,
    backgroundColor: '#8E8E93',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: isAndroid ? 4 : 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isAndroid ? 48 : undefined,
  },
  cancelModalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: isAndroid ? 16 : 14,
  },
  confirmButton: {
    ...getPlatformStyle('button'),
    flex: 1,
    backgroundColor: '#00D4AA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: isAndroid ? 4 : 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isAndroid ? 48 : undefined,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: isAndroid ? 16 : 14,
  },
});