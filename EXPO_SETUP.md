# 🚀 Expo Setup & App Store Upload Anleitung

Diese Anleitung führt Sie durch die komplette Einrichtung von Expo für Ihren BierLounge Tracker und den Upload zum App Store.

## 📋 Voraussetzungen

### 1. Apple Developer Account
- **Apple Developer Program** Mitgliedschaft (99$ pro Jahr)
- **App Store Connect** Zugang
- **Zertifikate und Profile** bereit

### 2. Expo Account
- **Expo Account** auf [expo.dev](https://expo.dev) erstellen
- **EAS CLI** installiert

### 3. Entwicklungsumgebung
- **Node.js** (Version 18+)
- **Git** für Versionskontrolle
- **Code-Editor** (VS Code empfohlen)

## 🔧 Schritt 1: Expo-Projekt einrichten

### 1.1 EAS CLI installieren
```bash
npm install -g @expo/cli
npm install -g eas-cli
```

### 1.2 Bei Expo anmelden
```bash
eas login
```

### 1.3 Projekt konfigurieren
```bash
eas build:configure
```

Wählen Sie:
- **Platform**: iOS
- **Build Type**: Production
- **Distribution**: App Store

## 🏗️ Schritt 2: Build-Konfiguration

### 2.1 eas.json anpassen
```json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "production": {
      "ios": {
        "resourceClass": "m-medium",
        "distribution": "store",
        "buildConfiguration": "Release"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "ihre-email@example.com",
        "ascAppId": "ihre-app-store-connect-app-id",
        "appleTeamId": "ihre-team-id"
      }
    }
  }
}
```

### 2.2 app.json konfigurieren
```json
{
  "expo": {
    "name": "BierLounge Tracker",
    "slug": "bierlounge-tracker",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.ihrname.bierlounge-tracker",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSUserNotificationUsageDescription": "Diese App verwendet Benachrichtigungen für wichtige Updates.",
        "NSCameraUsageDescription": "Diese App benötigt Zugriff auf die Kamera für QR-Codes.",
        "NSPhotoLibraryUsageDescription": "Diese App speichert Berichte in Ihren Fotos."
      }
    }
  }
}
```

## 🍎 Schritt 3: Apple Developer Setup

### 3.1 App ID erstellen
1. **Apple Developer Portal** öffnen
2. **Certificates, Identifiers & Profiles**
3. **Identifiers > +**
4. **App IDs** wählen
5. **App** auswählen
6. **Bundle ID** eingeben: `com.ihrname.bierlounge-tracker`
7. **Capabilities** aktivieren:
   - Push Notifications
   - Associated Domains (falls benötigt)

### 3.2 Distribution Certificate erstellen
1. **Certificates > +**
2. **iOS Distribution (App Store and Ad Hoc)**
3. **CSR-Datei** erstellen und hochladen
4. **Zertifikat herunterladen** (.cer)
5. **Zu .p12 konvertieren** (mit Keychain Access)

### 3.3 Provisioning Profile erstellen
1. **Profiles > +**
2. **iOS App Store**
3. **App ID** auswählen
4. **Zertifikat** auswählen
5. **Profil herunterladen** (.mobileprovision)

### 3.4 App Store Connect API Key
1. **Users and Access > Keys**
2. **+ (neuer Schlüssel)**
3. **App Manager** Rolle
4. **Schlüssel herunterladen** (.p8)
5. **Key ID** und **Issuer ID** notieren

## 🔑 Schritt 4: EAS Secrets konfigurieren

### 4.1 Secrets hochladen
```bash
# Zertifikat
eas secret:create --scope project --name EXPO_IOS_DIST_P12 --type file --value path/to/certificate.p12

# Provisioning Profile
eas secret:create --scope project --name EXPO_IOS_DIST_PROVISIONING_PROFILE --type file --value path/to/profile.mobileprovision

# Zertifikat-Passwort (falls gesetzt)
eas secret:create --scope project --name EXPO_IOS_DIST_P12_PASSWORD --type env --value "ihr-passwort"

# App Store Connect API
eas secret:create --scope project --name EXPO_APPLE_APP_SPECIFIC_PASSWORD --type env --value "ihr-app-spezifisches-passwort"
```

### 4.2 Umgebungsvariablen setzen
```bash
eas secret:create --scope project --name APPLE_TEAM_ID --type env --value "ihre-team-id"
eas secret:create --scope project --name APPLE_APP_ID --type env --value "ihre-app-id"
```

## 🚀 Schritt 5: iOS Build erstellen

### 5.1 Build starten
```bash
eas build --platform ios --profile production
```

### 5.2 Build überwachen
```bash
eas build:list
eas build:view
```

**Wichtige Hinweise:**
- Builds dauern 10-20 Minuten
- Kosten: ca. 0.01$ pro Build-Minute
- Builds werden in der Cloud ausgeführt

## 📱 Schritt 6: App Store Connect vorbereiten

### 6.1 Neue App erstellen
1. **App Store Connect** öffnen
2. **My Apps > +**
3. **New App** wählen
4. **Plattform**: iOS
5. **Name**: BierLounge Tracker
6. **Bundle ID**: `com.ihrname.bierlounge-tracker`
7. **SKU**: Eindeutige ID (z.B. `bierlounge-tracker-2024`)

### 6.2 App-Informationen ausfüllen
- **App-Name**: BierLounge Tracker
- **Untertitel**: Getränke-Tracking für Ihre Lounge
- **Beschreibung**: Detaillierte App-Beschreibung
- **Schlüsselwörter**: bier, getränke, tracking, lounge
- **Kategorie**: Utilities oder Food & Drink

### 6.3 Screenshots vorbereiten
- **iPhone 6.7"**: 1290 x 2796 px
- **iPhone 6.5"**: 1242 x 2688 px
- **iPhone 5.5"**: 1242 x 2208 px
- **iPad Pro 12.9"**: 2048 x 2732 px

## 📤 Schritt 7: App hochladen

### 7.1 Build herunterladen
```bash
eas build:download --platform ios
```

### 7.2 App Store Connect hochladen
```bash
eas submit --platform ios
```

**Alternativ manuell:**
1. **App Store Connect > My Apps**
2. **Ihre App** auswählen
3. **TestFlight** Tab
4. **+ (Build hinzufügen)**
5. **IPA-Datei** hochladen

## ✅ Schritt 8: App Review

### 8.1 TestFlight Testing
1. **Build** in TestFlight hochladen
2. **Externe Tester** einladen
3. **Feedback** sammeln
4. **Bugs** beheben

### 8.2 App Store Review
1. **App Store** Tab
2. **Submit for Review**
3. **Review-Prozess** abwarten (1-7 Tage)
4. **Genehmigung** erhalten

## 🔧 Häufige Probleme & Lösungen

### Build-Fehler
```bash
# Build-Cache löschen
eas build:clean

# Neuen Build starten
eas build --platform ios --clear-cache
```

### Zertifikat-Probleme
- **Gültigkeit prüfen**: Zertifikate laufen nach 1 Jahr ab
- **Passwort**: Falls .p12-Passwort vergessen, neues Zertifikat erstellen
- **Team ID**: Korrekte Team ID in eas.json verwenden

### Provisioning Profile
- **Bundle ID**: Muss exakt mit app.json übereinstimmen
- **Geräte**: Nur für Development-Profile relevant
- **Aktualisierung**: Nach Zertifikat-Änderungen erforderlich

## 💰 Kostenübersicht

### EAS Build
- **iOS Build**: ~0.01$ pro Minute
- **Durchschnitt**: 0.15-0.30$ pro Build
- **Monatlich**: 1-5$ bei regelmäßigen Builds

### Apple Developer
- **Jährliche Gebühr**: 99$
- **App Store Connect**: Inklusive
- **TestFlight**: Inklusive

## 📚 Nützliche Befehle

### Build-Management
```bash
# Build-Status prüfen
eas build:list

# Build-Logs anzeigen
eas build:view

# Build abbrechen
eas build:cancel

# Build-Cache löschen
eas build:clean
```

### Projekt-Management
```bash
# Projekt-Status
eas project:info

# Secrets auflisten
eas secret:list

# Secret löschen
eas secret:delete
```

## 🎯 Nächste Schritte

### Nach dem ersten Upload
1. **TestFlight** für Beta-Testing nutzen
2. **Feedback** von Testern sammeln
3. **Updates** regelmäßig veröffentlichen
4. **Analytics** einrichten (falls gewünscht)

### Langfristige Optimierung
1. **Performance** überwachen
2. **Crash Reports** analysieren
3. **User Feedback** einarbeiten
4. **Neue Features** planen

---

**Viel Erfolg mit Ihrer BierLounge Tracker App! 🍺**

Bei Fragen oder Problemen:
- **Expo Documentation**: [docs.expo.dev](https://docs.expo.dev)
- **EAS Documentation**: [docs.expo.dev/eas](https://docs.expo.dev/eas)
- **Apple Developer**: [developer.apple.com](https://developer.apple.com)
