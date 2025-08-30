import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { DatabaseService } from '../services/DatabaseService';
import { TwintPaymentRequest } from '../components/TwintPaymentRequest';
import { TwintAdminConfig } from '../components/TwintAdminConfig';
import { DrinkIcon } from '../components/DrinkIcon';
// Einfache ID-Generierung ohne externe Abhängigkeiten
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

export const AdminScreen: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [drinks, setDrinks] = useState<any[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddDrink, setShowAddDrink] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newDrinkName, setNewDrinkName] = useState('');
  const [newDrinkPrice, setNewDrinkPrice] = useState('');
  const [newDrinkStock, setNewDrinkStock] = useState('');
  const [newDrinkIcon, setNewDrinkIcon] = useState('beer');
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [showTwintConfig, setShowTwintConfig] = useState(false);
  const [showTwintModal, setShowTwintModal] = useState(false);
  const [selectedUserForTwint, setSelectedUserForTwint] = useState<any>(null);

  // Standard PIN-Code: 1234 (kann später geändert werden)
  const ADMIN_PIN = '1234';

  const dbService = DatabaseService.getInstance();

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handlePinSubmit = () => {
    if (pinCode === ADMIN_PIN) {
      setIsAuthenticated(true);
      setPinCode('');
    } else {
      Alert.alert('Fehler', 'Falscher PIN-Code. Bitte versuchen Sie es erneut.');
      setPinCode('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinCode('');
  };

  const loadData = async () => {
    try {
      const [usersData, drinksData, statusData] = await Promise.all([
        dbService.getAllUserProfiles(),
        dbService.getAllDrinks(),
        dbService.getDatabaseStatus(),
      ]);
      setUsers(usersData);
      setDrinks(drinksData);
      setDbStatus(statusData);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    }
  };

  const addUser = async () => {
    if (!newUserName.trim()) {
      Alert.alert('Fehler', 'Bitte geben Sie einen Namen ein.');
      return;
    }

    try {
      const newUser = {
        id: generateId(),
        name: newUserName.trim(),
        email: newUserEmail.trim() || undefined,
        balance: 0.0,
        monthlyCount: 0,
      };

      console.log('Füge neuen Benutzer hinzu:', newUser); // Debug-Log
      
      await dbService.saveUserProfile(newUser);
      
      // Daten neu laden statt lokalen State zu aktualisieren
      await loadData();
      
      // Formular zurücksetzen
      setNewUserName('');
      setNewUserEmail('');
      setShowAddUser(false);
      
      Alert.alert('Erfolg', 'Benutzer wurde hinzugefügt.');
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Benutzers:', error);
      Alert.alert('Fehler', 'Benutzer konnte nicht hinzugefügt werden.');
    }
  };

  const addDrink = async () => {
    if (!newDrinkName.trim() || !newDrinkPrice || !newDrinkStock) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle Felder aus.');
      return;
    }

    const price = parseFloat(newDrinkPrice);
    const stock = parseInt(newDrinkStock);

    if (isNaN(price) || price <= 0 || isNaN(stock) || stock < 0) {
      Alert.alert('Fehler', 'Bitte geben Sie gültige Werte ein.');
      return;
    }

    try {
      const newDrink = {
        id: generateId(),
        name: newDrinkName.trim(),
        price: price,
        stock: stock,
        iconKey: newDrinkIcon, // Ausgewählter Icon
      };

      console.log('Füge neues Getränk hinzu:', newDrink); // Debug-Log
      
      await dbService.saveDrink(newDrink);
      
      // Daten neu laden statt lokalen State zu aktualisieren
      await loadData();
      
      // Formular zurücksetzen
      setNewDrinkName('');
      setNewDrinkPrice('');
      setNewDrinkStock('');
      setNewDrinkIcon('beer'); // Icon auf Standard zurücksetzen
      setShowAddDrink(false);
      
      Alert.alert('Erfolg', 'Getränk wurde hinzugefügt.');
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Getränks:', error);
      Alert.alert('Fehler', 'Getränk konnte nicht hinzugefügt werden.');
    }
  };

  const deleteUser = async (userId: string) => {
    Alert.alert(
      'Benutzer löschen',
      'Möchten Sie diesen Benutzer wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await dbService.deleteUser(userId);
              // UI aktualisieren
              const updatedUsers = users.filter(u => u.id !== userId);
              setUsers(updatedUsers);
              Alert.alert('Erfolg', 'Benutzer wurde gelöscht.');
            } catch (error) {
              console.error('Fehler beim Löschen des Benutzers:', error);
              Alert.alert('Fehler', 'Benutzer konnte nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  const deleteDrink = async (drinkId: string) => {
    Alert.alert(
      'Getränk löschen',
      'Möchten Sie dieses Getränk wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await dbService.deleteDrink(drinkId);
              // UI aktualisieren
              const updatedDrinks = drinks.filter(d => d.id !== drinkId);
              setDrinks(updatedDrinks);
              Alert.alert('Erfolg', 'Getränk wurde gelöscht.');
            } catch (error) {
              console.error('Fehler beim Löschen des Getränks:', error);
              Alert.alert('Fehler', 'Getränk konnte nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  const resetAllData = async () => {
    Alert.alert(
      'Alle Daten zurücksetzen',
      'Möchten Sie wirklich alle Daten zurücksetzen? Dies kann nicht rückgängig gemacht werden!',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Zurücksetzen',
          style: 'destructive',
          onPress: async () => {
            try {
              await dbService.resetMockData();
              await loadData();
              Alert.alert('Erfolg', 'Alle Daten wurden zurückgesetzt.');
            } catch (error) {
              console.error('Fehler beim Zurücksetzen der Daten:', error);
              Alert.alert('Fehler', 'Daten konnten nicht zurückgesetzt werden.');
            }
          },
        },
      ]
    );
  };

  const handleTwintPaymentRequest = async (userId: string, amount: number, message: string) => {
    try {
      // Hier könnte man die Zahlungsanfrage in der Datenbank speichern
      // oder an einen externen Service senden
      console.log(`TWINT-Zahlungsanfrage für Benutzer ${userId}: ${amount} CHF - ${message}`);
      
      // Optional: Benutzer-Balance aktualisieren, wenn Zahlung bestätigt wird
      // await dbService.updateUserBalance(userId, 0);
      
    } catch (error) {
      console.error('Fehler beim Verarbeiten der TWINT-Zahlungsanfrage:', error);
    }
  };

  // PIN-Code-Anmeldeseite
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginContainer}>
          <View style={styles.loginCard}>
            <MaterialIcons name="admin-panel-settings" size={64} color="#007AFF" />
            <Text style={styles.loginTitle}>Admin-Zugang</Text>
            <Text style={styles.loginSubtitle}>Bitte geben Sie den PIN-Code ein</Text>
            
            <TextInput
              style={styles.pinInput}
              value={pinCode}
              onChangeText={setPinCode}
              placeholder="PIN-Code eingeben"
              keyboardType="numeric"
              secureTextEntry={true}
              maxLength={4}
              textAlign="center"
            />
            
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handlePinSubmit}
              disabled={pinCode.length !== 4}
            >
              <Text style={styles.loginButtonText}>Anmelden</Text>
            </TouchableOpacity>
            
            <Text style={styles.pinHint}>Standard PIN: 1234</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header mit Logout-Button */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin-Bereich</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
              <MaterialIcons name="refresh" size={24} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <MaterialIcons name="logout" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Datenbank-Status */}
        {dbStatus && (
          <View style={styles.dbStatusContainer}>
            <Text style={styles.dbStatusTitle}>Datenbank-Status</Text>
            <View style={styles.dbStatusInfo}>
              <Text style={styles.dbStatusText}>
                Status: {dbStatus.isInitialized ? '✅ Aktiv' : '❌ Fehler'}
              </Text>
              <Text style={styles.dbStatusText}>
                Benutzer: {dbStatus.tableCounts.users} | Getränke: {dbStatus.tableCounts.drinks} | Konsum: {dbStatus.tableCounts.consumptions}
              </Text>
            </View>
          </View>
        )}

        {/* Übersicht */}
        <View style={styles.overviewContainer}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{users.length}</Text>
            <Text style={styles.overviewLabel}>Benutzer</Text>
          </View>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewValue}>{drinks.length}</Text>
            <Text style={styles.overviewLabel}>Getränke</Text>
          </View>
        </View>

        {/* Benutzer-Verwaltung */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Benutzer-Verwaltung</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddUser(!showAddUser)}
            >
              <MaterialIcons name="add" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {showAddUser && (
            <View style={styles.addForm}>
              <TextInput
                style={styles.input}
                placeholder="Benutzername"
                value={newUserName}
                onChangeText={setNewUserName}
              />
              <TextInput
                style={styles.input}
                placeholder="E-Mail (optional)"
                value={newUserEmail}
                onChangeText={setNewUserEmail}
                keyboardType="email-address"
              />
              <View style={styles.formButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddUser(false)}>
                  <Text style={styles.cancelButtonText}>Abbrechen</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={addUser}>
                  <Text style={styles.saveButtonText}>Hinzufügen</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {users.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userCardHeader}>
                <View style={styles.userAvatar}>
                  <MaterialIcons name="person" size={24} color="#007AFF" />
                </View>
                <View style={styles.userCardInfo}>
                  <Text style={styles.userCardName}>{user.name}</Text>
                  <Text style={styles.userCardEmail}>
                    {user.email || 'Keine E-Mail'}
                  </Text>
                </View>
                <View style={styles.userCardBalance}>
                  <Text style={styles.balanceLabel}>Offener Betrag</Text>
                  <Text style={[
                    styles.balanceAmount,
                    user.balance > 0 && styles.balanceAmountPositive
                  ]}>
                    CHF {user.balance.toFixed(2)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.userCardDetails}>
                <View style={styles.userCardStat}>
                  <MaterialIcons name="local-drink" size={16} color="#8E8E93" />
                  <Text style={styles.userCardStatText}>
                    {user.monthlyCount} Getränke diesen Monat
                  </Text>
                </View>
                
                {user.balance > 0 && (
                  <View style={styles.userCardStat}>
                    <MaterialIcons name="payment" size={16} color="#34C759" />
                    <Text style={styles.userCardStatText}>
                      Zahlung ausstehend
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.userCardActions}>
                {user.balance > 0 && (
                  <TouchableOpacity
                    style={styles.twintButton}
                    onPress={() => {
                      // TWINT-Modal öffnen
                      const twintComponent = (
                        <TwintPaymentRequest
                          userId={user.id}
                          userName={user.name}
                          currentBalance={user.balance}
                          onPaymentRequestSent={(amount, message) => 
                            handleTwintPaymentRequest(user.id, amount, message)
                          }
                        />
                      );
                      // Hier würden wir das Modal öffnen
                      // Für jetzt öffnen wir es direkt
                      setShowTwintModal(true);
                      setSelectedUserForTwint(user);
                    }}
                  >
                    <MaterialIcons name="payment" size={18} color="#FFFFFF" />
                    <Text style={styles.twintButtonText}>TWINT Zahlung</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteUser(user.id)}
                >
                  <MaterialIcons name="delete" size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Getränke-Verwaltung */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Getränke-Verwaltung</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddDrink(!showAddDrink)}
            >
              <MaterialIcons name="add" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {showAddDrink && (
            <View style={styles.addForm}>
              <TextInput
                style={styles.input}
                placeholder="Getränkename"
                value={newDrinkName}
                onChangeText={setNewDrinkName}
              />
              <TextInput
                style={styles.input}
                placeholder="Preis (CHF)"
                value={newDrinkPrice}
                onChangeText={setNewDrinkPrice}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Bestand"
                value={newDrinkStock}
                onChangeText={setNewDrinkStock}
                keyboardType="numeric"
              />
              
              {/* Icon-Auswahl */}
              <View style={styles.iconSelectionContainer}>
                <Text style={styles.iconSelectionLabel}>Icon auswählen:</Text>
                <View style={styles.iconGrid}>
                                     {[
                     { key: 'beer', name: 'sports-bar', label: 'Bier' },
                     { key: 'wine', name: 'wine-bar', label: 'Wein' },
                     { key: 'coffee', name: 'coffee', label: 'Kaffee' },
                     { key: 'water', name: 'opacity', label: 'Wasser' },
                     { key: 'soda', name: 'local-cafe', label: 'Limonade' },
                     { key: 'cocktail', name: 'local-bar', label: 'Cocktail' },
                   ].map((icon) => (
                    <TouchableOpacity
                      key={icon.key}
                      style={[
                        styles.iconOption,
                        newDrinkIcon === icon.key && styles.iconOptionSelected
                      ]}
                      onPress={() => setNewDrinkIcon(icon.key)}
                    >
                      <MaterialIcons 
                        name={icon.name as any} 
                        size={24} 
                        color={newDrinkIcon === icon.key ? '#FFFFFF' : '#007AFF'} 
                      />
                      <Text style={[
                        styles.iconOptionLabel,
                        newDrinkIcon === icon.key && styles.iconOptionLabelSelected
                      ]}>
                        {icon.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.formButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddDrink(false)}>
                  <Text style={styles.cancelButtonText}>Abbrechen</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={addDrink}>
                  <Text style={styles.saveButtonText}>Hinzufügen</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {drinks.map((drink) => (
            <View key={drink.id} style={styles.drinkCard}>
              <View style={styles.drinkCardHeader}>
                <View style={styles.drinkIcon}>
                  <DrinkIcon iconKey={drink.iconKey} size={24} />
                </View>
                <View style={styles.drinkCardInfo}>
                  <Text style={styles.drinkCardName}>{drink.name}</Text>
                  <Text style={styles.drinkCardPrice}>
                    CHF {drink.price.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.drinkCardStock}>
                  <Text style={styles.stockLabel}>Bestand</Text>
                  <Text style={[
                    styles.stockAmount,
                    drink.stock <= 5 && styles.stockAmountLow
                  ]}>
                    {drink.stock}
                  </Text>
                </View>
              </View>
              
              <View style={styles.drinkCardActions}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteDrink(drink.id)}
                >
                  <MaterialIcons name="delete" size={18} color="#FF3B30" />
                  <Text style={styles.deleteButtonText}>Löschen</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* TWINT-Konfiguration */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>TWINT-Konfiguration</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowTwintConfig(true)}
            >
              <MaterialIcons name="settings" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionDescription}>
            Konfigurieren Sie Ihre privaten TWINT-Daten für Zahlungsanfragen.
          </Text>
        </View>

        {/* TWINT-Admin-Konfiguration Modal */}
        <TwintAdminConfig
          isVisible={showTwintConfig}
          onClose={() => setShowTwintConfig(false)}
          onConfigSaved={() => {
            setShowTwintConfig(false);
            // Hier könnte man weitere Aktionen nach dem Speichern ausführen
          }}
        />

        {/* TWINT-Zahlungsanfrage Modal */}
        {showTwintModal && selectedUserForTwint && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>TWINT-Zahlungsanfrage</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowTwintModal(false)}
                >
                  <MaterialIcons name="close" size={24} color="#8E8E93" />
                </TouchableOpacity>
              </View>
              <TwintPaymentRequest
                userId={selectedUserForTwint.id}
                userName={selectedUserForTwint.name}
                currentBalance={selectedUserForTwint.balance}
                onPaymentRequestSent={(amount, message) => {
                  handleTwintPaymentRequest(selectedUserForTwint.id, amount, message);
                  setShowTwintModal(false);
                }}
              />
            </View>
          </View>
        )}

        {/* Daten zurücksetzen */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.resetButton} onPress={resetAllData}>
            <MaterialIcons name="refresh" size={24} color="#FF3B30" />
            <Text style={styles.resetButtonText}>Alle Daten zurücksetzen</Text>
          </TouchableOpacity>
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
  // PIN-Code Anmeldeseite Styles
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
    maxWidth: 350,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 24,
    textAlign: 'center',
  },
  pinInput: {
    backgroundColor: '#F2F2F7',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    fontWeight: '600',
    width: '100%',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  pinHint: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFE5E5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dbStatusContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  dbStatusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  dbStatusInfo: {
    alignItems: 'center',
  },
  dbStatusText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  overviewContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  addButton: {
    padding: 8,
  },
  addForm: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#8E8E93',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  userCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userCardInfo: {
    flex: 1,
    marginRight: 12,
  },
  userCardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  userCardEmail: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  userCardBalance: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  balanceAmountPositive: {
    color: '#34C759',
  },
  userCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userCardStatText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  userCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  twintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  twintButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFE5E5',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  modalCloseButton: {
    padding: 4,
  },
  drinkCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  drinkCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  drinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  drinkCardInfo: {
    flex: 1,
    marginRight: 12,
  },
  drinkCardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  drinkCardPrice: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 2,
  },
  drinkCardStock: {
    alignItems: 'flex-end',
  },
  stockLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  stockAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  stockAmountLow: {
    color: '#FF9500',
  },
  drinkCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  resetButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
  },
  // Icon-Auswahl Styles
  iconSelectionContainer: {
    marginBottom: 16,
  },
  iconSelectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    minWidth: 80,
  },
  iconOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  iconOptionLabel: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    textAlign: 'center',
  },
  iconOptionLabelSelected: {
    color: '#FFFFFF',
  },
});
