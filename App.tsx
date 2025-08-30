import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import { TwintService } from './src/services/TwintService';

import { HomeScreen } from './src/screens/HomeScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AdminScreen } from './src/screens/AdminScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  // Deep-Linking für TWINT-Zahlungsrückkehr
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('Deep Link empfangen:', url);
      
      if (url.startsWith('getraenke-tracker://payment-return')) {
        const twintService = TwintService.getInstance();
        const paymentData = twintService.parsePaymentReturnLink(url);
        
        if (paymentData) {
          console.log('Zahlungsrückkehr verarbeitet:', paymentData);
          
          // Hier könnte man den Zahlungsstatus in der Datenbank aktualisieren
          // und Benachrichtigungen an den entsprechenden Benutzer senden
          
          // Beispiel: Alert anzeigen (in einer echten App würde man das über den Navigation-Stack machen)
          if (paymentData.status === 'completed') {
            console.log(`Zahlung für Benutzer ${paymentData.userId} abgeschlossen: ${paymentData.amount} CHF`);
          }
        }
      }
    };

    // Initialen Deep Link verarbeiten (falls App über Deep Link gestartet wurde)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Deep Links während der App-Laufzeit verarbeiten
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof MaterialIcons.glyphMap;

              if (route.name === 'Home') {
                iconName = 'home';
              } else if (route.name === 'Profile') {
                iconName = 'person';
              } else if (route.name === 'Admin') {
                iconName = 'admin-panel-settings';
              } else {
                iconName = 'help';
              }

              return <MaterialIcons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'Getränke Tracker' }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ title: 'Profil' }}
          />
          <Tab.Screen 
            name="Admin" 
            component={AdminScreen} 
            options={{ title: 'Admin' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
