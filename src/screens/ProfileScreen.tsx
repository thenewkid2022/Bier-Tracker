import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { DatabaseService } from '../services/DatabaseService';
import { useFocusEffect } from '@react-navigation/native';

export const ProfileScreen: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [consumptions, setConsumptions] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  const dbService = DatabaseService.getInstance();

  useEffect(() => {
    loadUsers();
  }, []);

  // Daten neu laden, wenn der Screen fokussiert wird
  useFocusEffect(
    React.useCallback(() => {
      // Benutzerliste und aktuelle Benutzerdaten neu laden
      loadUsers();
    }, [])
  );

  const loadUsers = async () => {
    try {
      const usersData = await dbService.getAllUserProfiles();
      setUsers(usersData);
      
      if (usersData.length > 0) {
        // Aktuellen Benutzer beibehalten, falls er noch existiert
        if (selectedUser && usersData.find(u => u.id === selectedUser.id)) {
          // Aktuellen Benutzer aktualisieren und Daten neu laden
          const updatedUser = usersData.find(u => u.id === selectedUser.id);
          setSelectedUser(updatedUser);
          await loadUserData(updatedUser.id);
        } else if (!selectedUser) {
          // Standardmäßig den ersten Benutzer auswählen
          setSelectedUser(usersData[0]);
          await loadUserData(usersData[0].id);
        }
      } else {
        // Keine Benutzer vorhanden
        setSelectedUser(null);
        setConsumptions([]);
        setTotalSpent(0);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Benutzer:', error);
      Alert.alert('Fehler', 'Benutzer konnten nicht geladen werden.');
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      const userData = await dbService.getUserProfile(userId);
      if (userData) {
        setSelectedUser(userData);
        const userConsumptions = await dbService.getConsumptionsWithDrinkInfo(userId);
        setConsumptions(userConsumptions);
        
        const total = userConsumptions.reduce((sum, c) => sum + c.price, 0);
        setTotalSpent(total);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerdaten:', error);
      Alert.alert('Fehler', 'Benutzerdaten konnten nicht geladen werden.');
    }
  };

  const handleUserSelect = async (user: any) => {
    setSelectedUser(user);
    await loadUserData(user.id);
  };

  const resetBalance = async () => {
    if (!selectedUser) return;
    
    Alert.alert(
      'Balance zurücksetzen',
      `Möchten Sie die Balance von ${selectedUser.name} wirklich auf 0 zurücksetzen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Zurücksetzen',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedUser = { ...selectedUser, balance: 0, monthlyCount: 0 };
              await dbService.saveUserProfile(updatedUser);
              setSelectedUser(updatedUser);
              
              // UI aktualisieren
              const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
              setUsers(updatedUsers);
              
              Alert.alert('Erfolg', 'Balance wurde zurückgesetzt.');
            } catch (error) {
              console.error('Fehler beim Zurücksetzen der Balance:', error);
              Alert.alert('Fehler', 'Balance konnte nicht zurückgesetzt werden.');
            }
          },
        },
      ]
    );
  };

  const deleteConsumption = async (consumptionId: string) => {
    Alert.alert(
      'Einkauf löschen',
      'Möchten Sie diesen Einkauf wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await dbService.deleteConsumption(consumptionId);
              // UI aktualisieren
              const updatedConsumptions = consumptions.filter(c => c.id !== consumptionId);
              setConsumptions(updatedConsumptions);
              
              // Gesamtausgaben neu berechnen
              const total = updatedConsumptions.reduce((sum, c) => sum + c.price, 0);
              setTotalSpent(total);
              
              Alert.alert('Erfolg', 'Einkauf wurde gelöscht.');
            } catch (error) {
              console.error('Fehler beim Löschen des Einkaufs:', error);
              Alert.alert('Fehler', 'Einkauf konnte nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  if (!selectedUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.noUserTitle}>Kein Benutzer verfügbar</Text>
          <Text style={styles.noUserText}>
            Bitte fügen Sie über den Admin-Bereich einen Benutzer hinzu, um das Profil anzuzeigen.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Benutzer-Auswahl */}
        <View style={styles.userSelectorContainer}>
          <View style={styles.selectorHeader}>
            <Text style={styles.selectorTitle}>Benutzer auswählen:</Text>
            <TouchableOpacity 
              style={styles.refreshButton} 
              onPress={() => selectedUser && loadUserData(selectedUser.id)}
            >
              <MaterialIcons name="refresh" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.userSelector}>
            {users.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.userSelectorItem,
                  selectedUser.id === user.id && styles.userSelectorItemSelected
                ]}
                onPress={() => handleUserSelect(user)}
              >
                <Text style={[
                  styles.userSelectorText,
                  selectedUser.id === user.id && styles.userSelectorTextSelected
                ]}>
                  {user.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Benutzer-Header */}
        <View style={styles.userHeader}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="person" size={48} color="#007AFF" />
          </View>
          <Text style={styles.userName}>{selectedUser.name}</Text>
          <Text style={styles.userEmail}>{selectedUser.email}</Text>
        </View>

        {/* Statistiken */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[
              styles.statValue,
              selectedUser.balance < 0 && styles.negativeBalance
            ]}>
              CHF {selectedUser.balance.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>
              {selectedUser.balance >= 0 ? 'Aktuelle Balance' : 'Schuldenstand'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{selectedUser.monthlyCount}</Text>
            <Text style={styles.statLabel}>Getränke diesen Monat</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>CHF {totalSpent.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Gesamt ausgegeben</Text>
          </View>
        </View>

        {/* Aktionen */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={resetBalance}>
            <MaterialIcons name="refresh" size={24} color="#FF3B30" />
            <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>
              Balance zurücksetzen
            </Text>
          </TouchableOpacity>
        </View>

        {/* Letzte Einkäufe */}
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Letzte Einkäufe</Text>
          {consumptions.length === 0 ? (
            <Text style={styles.noDataText}>Noch keine Einkäufe getätigt.</Text>
          ) : (
            consumptions.slice(0, 10).map((consumption) => (
              <View key={consumption.id} style={styles.consumptionItem}>
                <View style={styles.consumptionInfo}>
                  <Text style={styles.consumptionDrink}>
                    {consumption.drinkName}
                  </Text>
                  <Text style={styles.consumptionDate}>
                    {new Date(consumption.timestamp).toLocaleDateString('de-CH')}
                  </Text>
                  <Text style={styles.consumptionPrice}>
                    CHF {consumption.price.toFixed(2)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteConsumptionButton}
                  onPress={() => deleteConsumption(consumption.id)}
                >
                  <MaterialIcons name="delete" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noUserTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 15,
    textAlign: 'center',
  },
  noUserText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  userSelectorContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  userSelector: {
    flexDirection: 'row',
  },
  userSelectorItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  userSelectorItemSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  userSelectorText: {
    fontSize: 14,
    color: '#007AFF',
  },
  userSelectorTextSelected: {
    color: '#FFFFFF',
  },
  userHeader: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#8E8E93',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  negativeBalance: {
    color: '#FF3B30',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  actionsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  recentContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000000',
  },
  noDataText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  consumptionItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  consumptionInfo: {
    flex: 1,
    marginRight: 10,
  },
  consumptionDrink: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  consumptionDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  consumptionPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  deleteConsumptionButton: {
    padding: 5,
  },
});
