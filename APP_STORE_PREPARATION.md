# 🏪 App Store Vorbereitung - Getränke Tracker

## 📱 App-Informationen

**App Name**: Getränke Tracker  
**Bundle ID**: `com.thenewkid2022.bierlounge-tracker`  
**Version**: 1.0.0  
**Build Number**: 1  
**Platform**: iOS (iPhone + iPad)  
**Sprache**: Deutsch  

## 🚀 Schritt 1: Apple Developer Account

### Voraussetzungen:
- ✅ Apple Developer Program Mitgliedschaft (99$/Jahr)
- ✅ Zugriff auf App Store Connect: https://appstoreconnect.apple.com
- ✅ Apple ID mit Administrator-Rechten

### Einrichtung:
1. https://developer.apple.com besuchen
2. "Enroll" → "Start Your Enrollment"
3. Persönliche/Unternehmens-Informationen eingeben
4. Zahlung (99$/Jahr) durchführen
5. Auf Aktivierung warten (24-48 Stunden)

## 🏪 Schritt 2: App Store Connect

### Neue App erstellen:
1. App Store Connect öffnen
2. "My Apps" → "+" → "New App"
3. **Platform**: iOS
4. **Name**: "Getränke Tracker"
5. **Bundle ID**: `com.thenewkid2022.bierlounge-tracker`
6. **SKU**: `bierlounge-tracker2024` (eindeutige ID)
7. **User Access**: "Full Access"

## 📝 Schritt 3: App Store Metadaten

### App-Informationen:
- **Primary Language**: Deutsch
- **Category**: "Lifestyle" oder "Utilities"
- **Content Rights**: "No" (alle Rechte besitzen Sie)

### App-Name & Beschreibung:
```
App Name: Getränke Tracker
Subtitle: Getränke-Verwaltung & TWINT-Integration

Description:
Eine moderne App zur Verwaltung von Getränke-Beständen und -Konsum.

Features:
• Getränke-Verwaltung mit Bestand und Preisen
• Individuelle Konsum-Statistiken und Tracking
• TWINT-Integration für direkte Zahlungsanfragen
• QR-Code-Scanner für schnelle Eingabe
• Benutzerfreundliche, intuitive Oberfläche
• Vollständige iPad-Unterstützung
• Lokale Datenspeicherung für Datenschutz
• Push-Benachrichtigungen für wichtige Updates

Perfekt für:
• Vereine und Clubs
• Private Feiern
• Kleine Veranstaltungen
• Getränke-Management im Alltag
```

### Keywords:
```
getränke, bier, tracker, verwaltung, twint, qr-code, konsum, bestand, preise, verein, feier, veranstaltung, bierlounge
```

## 📸 Schritt 4: Screenshots (ERFORDERLICH)

### Benötigte Größen:
- **iPhone 6.7" Display**: 1290 x 2796 px
- **iPhone 6.5" Display**: 1242 x 2688 px  
- **iPhone 5.5" Display**: 1242 x 2208 px
- **iPad Pro 12.9" Display**: 2048 x 2732 px

### Screenshot-Inhalte:
1. **Hauptbildschirm**: Getränke-Liste mit Bestand
2. **Admin-Bereich**: Getränke hinzufügen/bearbeiten
3. **TWINT-Zahlung**: Zahlungsanfrage mit QR-Code
4. **QR-Code-Scanner**: Kamera-Interface
5. **Benutzerprofil**: Konsum-Statistiken
6. **Getränke-Details**: Einzelansicht mit Preisen

## 🔧 Schritt 5: EAS Build & Upload

### EAS CLI installieren:
```bash
npm install -g @expo/eas-cli
```

### EAS konfigurieren:
```bash
eas build:configure
```

### Production Build erstellen:
```bash
eas build --platform ios --profile production
```

### Zu App Store Connect hochladen:
```bash
eas submit --platform ios
```

## 📋 Schritt 6: App Store Review

### TestFlight-Build hochladen:
1. Build in App Store Connect hochladen
2. "TestFlight" Tab öffnen
3. Build für interne Tests freigeben
4. Externe Tester hinzufügen (optional)

### Review-Informationen:
- **Demo Account**: Falls erforderlich
- **Test Instructions**: 
  ```
  1. App öffnen
  2. Getränke hinzufügen (Admin-Bereich)
  3. TWINT-Zahlungsanfrage testen
  4. QR-Code-Scanner testen
  5. Benutzerprofil und Statistiken prüfen
  ```
- **Contact Information**: Ihre Kontaktdaten

## ⚠️ Wichtige Hinweise

### Bundle ID:
- **Aktuell**: `com.thenewkid2022.bierlounge-tracker`
- **Kann geändert werden** vor dem ersten Upload
- **Nach Upload**: Bundle ID ist fest und kann nicht mehr geändert werden

### App Store Guidelines:
- Alle Features müssen funktionieren
- TWINT-Integration muss getestet werden
- Datenschutz-Erklärung bereithalten
- Keine Test-Content in Screenshots

### Timeline:
- **Apple Developer Account**: 24-48 Stunden
- **App Store Review**: 1-7 Tage
- **TestFlight**: Sofort nach Genehmigung
- **App Store**: Nach Genehmigung + manueller Freigabe

## 🎯 Nächste Schritte

1. **Apple Developer Account einrichten**
2. **App Store Connect öffnen**
3. **Neue App mit Bundle ID `com.thenewkid2022.bierlounge-tracker` erstellen**
4. **Metadaten und Screenshots vorbereiten**
5. **Ersten Build erstellen und hochladen**

## 📞 Support

Bei Fragen zur App Store Einreichung:
- Apple Developer Support: https://developer.apple.com/contact/
- App Store Connect Help: https://help.apple.com/app-store-connect/
