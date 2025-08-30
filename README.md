# 🍺 Getränke Tracker - React Native + Expo

Eine moderne Getränke-Tracking-App für iOS und Android, entwickelt mit React Native und Expo.

## ✨ Features

- **Getränke-Verwaltung**: Bestand und Preise verwalten
- **Benutzer-Tracking**: Individuelle Konsum-Statistiken
- **Echtzeit-Updates**: Sofortige Bestandsaktualisierung
- **Responsive Design**: Optimiert für alle Bildschirmgrößen
- **AsyncStorage-Datenbank**: Lokale Datenspeicherung für Expo Go
- **TWINT-Integration**: Direkte Zahlungsanfragen für offene Beträge
- **Push-Benachrichtigungen**: Wichtige Updates direkt aufs Gerät
- **Moderne UI**: iOS-ähnliches Design mit Material Design

## 🚀 Schnellstart

### Voraussetzungen

- Node.js (Version 18 oder höher)
- npm oder yarn
- Expo CLI
- iOS Simulator (für iOS-Entwicklung)
- Android Studio (für Android-Entwicklung)

### Installation

1. **Repository klonen**
```bash
git clone https://github.com/yourusername/getraenke-tracker.git
cd getraenke-tracker
```

2. **Dependencies installieren**
```bash
npm install
# oder
yarn install
```

3. **Expo CLI installieren (falls noch nicht vorhanden)**
```bash
npm install -g @expo/cli
```

4. **App starten**
```bash
npm start
# oder
expo start
```

## 📱 Plattformen

- ✅ **iOS** - Vollständig unterstützt
- ✅ **Android** - Vollständig unterstützt
- ✅ **Web** - Grundlegende Unterstützung
- ✅ **Windows** - Entwicklung und Testing

## 🏗️ Projektstruktur

```
src/
├── components/          # Wiederverwendbare UI-Komponenten
│   └── DrinkIcon.tsx   # Getränke-Icons
├── models/             # Datenmodelle und Interfaces
│   ├── Drink.ts        # Getränke-Model
│   ├── UserProfile.ts  # Benutzer-Model
│   └── Consumption.ts  # Konsum-Model
├── screens/            # App-Bildschirme
│   ├── HomeScreen.tsx  # Hauptbildschirm
│   ├── ProfileScreen.tsx # Benutzerprofil
│   └── AdminScreen.tsx # Administrationsbereich
├── services/           # Business Logic und APIs
│   ├── DatabaseService.ts    # AsyncStorage-Datenbank
│   └── NotificationService.ts # Push-Benachrichtigungen
└── utils/              # Hilfsfunktionen
```

## 🔧 Konfiguration

### App-Konfiguration

Die App-Konfiguration erfolgt über `app.json`:

```json
{
  "expo": {
    "name": "Getränke Tracker",
    "slug": "getraenke-tracker",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.getraenke.tracker"
    },
    "android": {
      "package": "com.getraenke.tracker"
    }
  }
}
```

### EAS Build-Konfiguration

Die Build-Konfiguration ist in `eas.json` definiert:

```json
{
  "build": {
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  }
}
```

## 🚀 Deployment

### iOS App Store

1. **EAS Build konfigurieren**
```bash
eas build:configure
```

2. **iOS Build erstellen**
```bash
eas build --platform ios
```

3. **App Store Connect hochladen**
```bash
eas submit --platform ios
```

### Android Google Play Store

1. **Android Build erstellen**
```bash
eas build --platform android
```

2. **Google Play Console hochladen**
```bash
eas submit --platform android
```

## 🧪 Testing

### Lokales Testing

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web Browser
npm run web
```

### Unit Tests

```bash
npm test
```

## 📊 Datenbank

Die App verwendet **AsyncStorage** für lokale Datenspeicherung in Expo Go:

- **user_profiles**: Benutzerinformationen und Statistiken
- **drinks**: Getränke-Bestand und Preise
- **consumptions**: Konsum-Historie

### Datenbank-Features

- ✅ **AsyncStorage-Integration** für Expo Go Kompatibilität
- ✅ **Automatische Demo-Daten** werden beim ersten Start geladen
- ✅ **Referentielle Integrität** beim Löschen von Benutzern/Getränken
- ✅ **Datenbank-Status-Monitoring** im Admin-Bereich
- ✅ **Persistierung** - Daten bleiben nach App-Neustart erhalten
- ✅ **In-Memory-Caching** für bessere Performance

### Technische Details

- **Expo Go**: Verwendet AsyncStorage für lokale Datenspeicherung
- **Echte Builds**: Kann auf SQLite umgestellt werden
- **Fallback-System**: Automatischer Fallback auf Mock-Daten bei Fehlern
- **Daten-Synchronisation**: Alle Änderungen werden sofort gespeichert

### Speicherort

- **Expo Go**: AsyncStorage im Geräte-Speicher
- **iOS Build**: `/var/mobile/Containers/Data/Application/[APP-ID]/Documents/getraenke.db`
- **Android Build**: `/data/data/[PACKAGE-NAME]/databases/getraenke.db`

## 💳 TWINT-Integration

Die App unterstützt **TWINT-Zahlungsanfragen** für offene Beträge:

### TWINT-Features

- ✅ **Direkte Zahlungsanfragen** vom Admin an Benutzer
- ✅ **Admin-Konfiguration** für private TWINT-Daten
- ✅ **QR-Code-Generierung** für TWINT-App
- ✅ **Betrag-Validierung** nach TWINT-Limits
- ✅ **Nachrichten-Support** bis 140 Zeichen
- ✅ **Automatische Betrag-Vorschläge** basierend auf offener Balance
- ✅ **Deep-Linking** für Zahlungsrückkehr zur App
- ✅ **Fallback-Web-Integration** wenn TWINT-App nicht verfügbar
- ✅ **Automatische TWINT-App-Erkennung**

### Admin-Konfiguration

Der Admin kann seine **privaten TWINT-Daten** konfigurieren:

- **IBAN** (optional) - Für direkte Überweisungen
- **Telefonnummer** (optional) - Für TWINT-Identifikation
- **Standard-Nachricht** - Wird allen Zahlungsanfragen vorangestellt
- **Anzeigename** - Wird in der App als Admin angezeigt

### Verwendung

1. **Admin-Bereich öffnen** - TWINT-Konfiguration
2. **Private TWINT-Daten eingeben** - IBAN, Telefonnummer, etc.
3. **Konfiguration speichern** - Daten werden lokal gespeichert
4. **TWINT-Button klicken** - Neben jedem Benutzer
5. **Betrag wird vorgeschlagen** - Standardmäßig offene Balance
6. **Nachricht kann angepasst** werden (optional)
7. **QR-Code wird generiert** - Mit Admin-Daten
8. **TWINT-App öffnet sich** - Direkt mit Zahlungsanfrage

### Deep-Linking

Die App unterstützt automatische Rückkehr nach TWINT-Zahlungen:

```
getraenke-tracker://payment-return?userId=123&amount=25.50&status=completed
```

### TWINT-Format

```
twint://pay?amount=XX.XX&message=XXX&iban=CH93 0076 2011 6238 5295 7
```

### Technische Details

- **QR-Code-Generierung**: react-native-qrcode-svg
- **TWINT-URL-Format**: Standard TWINT-Protokoll mit IBAN
- **Admin-Konfiguration**: AsyncStorage für lokale Speicherung
- **Deep-Linking**: Expo Linking für Zahlungsrückkehr
- **Fallback-System**: Automatischer Wechsel zu Web-Version
- **Betrag-Limits**: 0.01 - 999,999.99 CHF
- **Nachrichten-Limit**: 140 Zeichen
- **IBAN-Validierung**: Schweizer IBAN-Format
- **Kompatibilität**: Alle TWINT-fähigen Geräte
- **URL-Schema**: getraenke-tracker:// und twint://

## 🔔 Benachrichtigungen

## 🎨 UI/UX Design

- **Design-System**: iOS Cupertino + Material Design
- **Farbschema**: Moderne, barrierefreie Farben
- **Typografie**: Klare, lesbare Schriftarten
- **Responsive**: Optimiert für alle Bildschirmgrößen

## 🔒 Sicherheit

- Lokale Datenspeicherung
- Keine externen API-Calls (außer Firebase)
- Sichere Datenbank-Operationen

## 📈 Performance

- **Lazy Loading**: Komponenten werden bei Bedarf geladen
- **Optimierte Datenbankabfragen**: Effiziente SQL-Statements
- **Memory Management**: Saubere Cleanup-Funktionen

## 🐛 Bekannte Probleme

- iOS Simulator: Gelegentliche Performance-Probleme
- Android: Bestimmte Geräte-spezifische Anpassungen erforderlich

## 🤝 Beitragen

1. Fork des Repositories
2. Feature-Branch erstellen (`git checkout -b feature/AmazingFeature`)
3. Änderungen committen (`git commit -m 'Add some AmazingFeature'`)
4. Branch pushen (`git push origin feature/AmazingFeature`)
5. Pull Request erstellen

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe `LICENSE` für weitere Details.

## 📞 Support

Bei Fragen oder Problemen:

- **Issues**: GitHub Issues verwenden
- **Discussions**: GitHub Discussions für allgemeine Fragen
- **Wiki**: Projekt-Wiki für detaillierte Dokumentation

## 🙏 Danksagungen

- **Expo Team** für das großartige Framework
- **React Native Community** für die Unterstützung
- **Alle Mitwirkenden** an diesem Projekt

---

**Entwickelt mit ❤️ für die Getränke Community**
