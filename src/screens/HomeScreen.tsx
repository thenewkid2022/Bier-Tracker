import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { DrinkIcon } from '../components/DrinkIcon';
import { DatabaseService } from '../services/DatabaseService';

const { width } = Dimensions.get('window');

const generateId = () => Math.random().toString(36).substr(2, 9);

export const HomeScreen: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [drinks, setDrinks] = useState<any[]>([]);
  const [isWide, setIsWide] = useState(width >= 900);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const dbService = DatabaseService.getInstance();

  useEffect(() => {
    initializeApp();
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setIsWide(window.width >= 900);
    });

    return () => subscription?.remove();
  }, []);

  // Daten neu laden, wenn der Screen wieder sichtbar wird
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 2000); // Alle 2 Sekunden aktualisieren

    return () => clearInterval(interval);
  }, []);

  const initializeApp = async () => {
    try {
      await loadInitialData();
    } catch (error) {
      console.error('Fehler beim Initialisieren der App:', error);
    }
  };

  const refreshData = async () => {
    if (isRefreshing) return; // Verhindert mehrfache gleichzeitige Updates
    
    try {
      setIsRefreshing(true);
      const [usersData, drinksData] = await Promise.all([
        dbService.getAllUserProfiles(),
        dbService.getAllDrinks(),
      ]);

      setUsers(usersData);
      setDrinks(drinksData);
      
      // Aktuellen Benutzer beibehalten, falls er noch existiert
      if (selectedUser && !usersData.find(u => u.id === selectedUser.id)) {
        setSelectedUser(usersData[0] || null);
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Daten:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadInitialData = async () => {
    try {
      const [usersData, drinksData] = await Promise.all([
        dbService.getAllUserProfiles(),
        dbService.getAllDrinks(),
      ]);

      setUsers(usersData);
      setDrinks(drinksData);

      // Benutzer auswählen, falls vorhanden
      if (usersData.length > 0) {
        setSelectedUser(usersData[0]);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    }
  };

  const handleDrinkPurchase = async (drink: any) => {
    if (!selectedUser) {
      Alert.alert('Fehler', 'Bitte wählen Sie zuerst einen Benutzer aus.');
      return;
    }

    if (drink.stock <= 0) {
      Alert.alert('Ausverkauft', 'Dieses Getränk ist leider nicht mehr verfügbar.');
      return;
    }

    try {
      // Getränk kaufen
      const updatedDrink = { ...drink, stock: drink.stock - 1 };
      await dbService.saveDrink(updatedDrink);

      // Benutzer-Guthaben aktualisieren
      const updatedUser = {
        ...selectedUser,
        balance: selectedUser.balance - drink.price,
        monthlyCount: selectedUser.monthlyCount + 1,
      };
      await dbService.saveUserProfile(updatedUser);

      // Verbrauch aufzeichnen
      const consumption = {
        id: generateId(),
        userId: selectedUser.id,
        drinkId: drink.id,
        drinkName: drink.name,
        price: drink.price,
        timestamp: new Date().toISOString(),
      };
      await dbService.addConsumption(consumption);

      // Lokale Daten aktualisieren
      setDrinks(prev => prev.map(d => d.id === drink.id ? updatedDrink : d));
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? updatedUser : u));
      setSelectedUser(updatedUser);

      const newBalance = selectedUser.balance - drink.price;
      const balanceMessage = newBalance >= 0 
        ? `Ihr Guthaben: CHF ${newBalance.toFixed(2)}`
        : `Ihr Schuldenstand: CHF ${Math.abs(newBalance).toFixed(2)}`;
      
      Alert.alert(
        'Erfolg', 
        `${drink.name} wurde erfolgreich gekauft!\n\n${balanceMessage}`,
        [
          { text: 'OK', style: 'default' }
        ]
      );
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
              onPress={() => setSelectedUser(user)}
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
          disabled={isRefreshing}
        >
          <MaterialIcons 
            name="refresh" 
            size={20} 
            color={isRefreshing ? "#8E8E93" : "#007AFF"} 
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {renderUserSelector()}
      {renderDrinksGrid()}
      
      {!selectedUser && (
        <View style={styles.noUserContainer}>
          <Text style={styles.noUserTitle}>Kein Benutzer ausgewählt</Text>
          <Text style={styles.noUserText}>
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
});