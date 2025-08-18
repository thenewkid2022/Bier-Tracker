# BierLounge Tracker 🍺

Eine moderne, touch-freundliche Flutter-App für iOS-Geräte (iPhone und iPad) zur Verwaltung von Getränkekonsum, Zahlungen und Inventar in einer Community-Garage-Lounge.

## ✨ Features

### 🏠 Kernfunktionen
- **Benutzerverwaltung**: Einfache Registrierung und Auswahl von Benutzern
- **Konsum-Tracking**: Große, touch-freundliche Getränke-Icons in einem adaptiven Grid
- **Saldo-Verwaltung**: Automatische Berechnung und Anzeige des aktuellen Kontostands
- **TWINT-Integration**: Direkte Zahlungsanfragen über die TWINT-App
- **Offline-Funktionalität**: Lokale Datenspeicherung mit Hive
- **Cloud-Sync**: Optionale Firebase-Integration für Datensynchronisation

### 🎯 Zusätzliche Features
- **Getränkeverwaltung**: Hinzufügen/Bearbeiten von Getränken mit Preisen und Lagerbestand
- **Inventar-Tracking**: Automatische Bestandsverwaltung mit Niedrigbestand-Warnungen
- **Admin-Modus**: Passwortgeschützter Bereich für Verwaltungsaufgaben
- **PDF-Reports**: Monatliche Auswertungen mit detaillierten Statistiken
- **Benachrichtigungen**: Lokale Benachrichtigungen für wichtige Ereignisse

### 🎉 Spaß-Features
- **Achievements**: Badges und Titel basierend auf Konsum (z.B. "Beer King 👑")
- **Leaderboard**: Monatliche Rangliste mit lustigen Titeln
- **Zufällige Tipps**: Motivierende Nachrichten nach jedem Getränk

## 🚀 Entwicklung auf Windows

### Voraussetzungen
1. **Flutter SDK** installieren (https://flutter.dev/docs/get-started/install/windows)
2. **Android Studio** oder **VS Code** mit Flutter-Plugin
3. **Git** für Versionskontrolle

### Setup
```bash
# Repository klonen
git clone <repository-url>
cd bierlounge_tracker

# Dependencies installieren
flutter pub get

# Flutter Doctor ausführen
flutter doctor

# App starten (Web für schnelles Testing)
flutter run -d chrome

# Oder Android Emulator
flutter run -d android
```

### Entwicklungstipps
- **Web-Target**: Verwende `flutter run -d chrome` für schnelles Testing der UI
- **Android-Emulator**: Für bessere Performance und native Features
- **Hot Reload**: Funktioniert auf beiden Plattformen
- **iOS-Simulator**: Nur auf macOS verfügbar (für finale Tests)

## 🍎 iOS-Deployment

### Voraussetzungen
- **macOS** mit **Xcode** (nicht auf Windows verfügbar)
- **CocoaPods** installiert
- **Apple Developer Account** (für App Store)

### Setup
```bash
# iOS-spezifische Dependencies installieren
cd ios
pod install
cd ..

# iOS-Simulator starten
flutter run -d ios

# Release-Build erstellen
flutter build ios --release
```

### iOS-spezifische Konfiguration

#### Info.plist für TWINT-Integration
```xml
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>twint-extended</string>
    <string>twint-issuer1</string>
    <string>twint-issuer2</string>
    <!-- Weitere TWINT-Schemes nach Bedarf -->
</array>
```

#### TWINT-Entwickler-Setup
1. **Twint Developer Portal** besuchen
2. **Merchant-Account** erstellen
3. **API-Credentials** erhalten
4. **Deeplink-Spezifikation** einholen
5. In `lib/services/payment_service.dart` echte Parameter einsetzen

## 🏗️ Projektstruktur

```
lib/
├── main.dart                 # App-Einstiegspunkt
├── models/                   # Datenmodelle
│   ├── user_profile.dart     # Benutzerprofile
│   ├── drink.dart           # Getränke
│   └── consumption.dart     # Konsum-Einträge
├── screens/                  # App-Bildschirme
│   ├── home_cupertino.dart  # Hauptbildschirm (Cupertino)
│   ├── admin_screen.dart    # Admin-Bereich
│   └── profile_screen.dart  # Benutzerprofile
├── services/                 # Business Logic
│   ├── hive_service.dart    # Lokale Datenspeicherung
│   ├── payment_service.dart # TWINT-Integration
│   ├── report_service.dart  # PDF-Generierung
│   ├── notification_service.dart # Benachrichtigungen
│   └── sync_service.dart    # Firebase-Sync
└── widgets/                  # Wiederverwendbare UI-Komponenten
    └── drink_icon.dart      # Getränke-Icons
```

## 🎨 UI/UX-Design

### Design-Prinzipien
- **Cupertino-Theme**: Native iOS-Feeling
- **Touch-freundlich**: Mindestens 44pt für Buttons (iOS-Standard)
- **Adaptive Layouts**: Optimiert für iPhone und iPad
- **Moderne Farben**: 
  - Primär: `CupertinoColors.activeBlue`
  - Sekundär: `CupertinoColors.activeGreen`
  - Hintergründe: `CupertinoColors.systemBackground`

### Responsive Design
- **iPhone**: Kompakte Layouts mit 3-spaltigen Grids
- **iPad**: Weite Layouts mit 6-spaltigen Grids und Side-by-Side-Ansichten
- **Adaptive Navigation**: Automatische Anpassung basierend auf Bildschirmbreite

## 🔒 Sicherheit

### Admin-Zugang
- **Passwort**: `bieradmin` (für MVP - in Produktion ändern!)
- **Funktionen**: Getränke verwalten, Lager aufstocken, Benutzer zurücksetzen

### Datenschutz
- **Lokale Speicherung**: Alle Daten bleiben auf dem Gerät
- **Verschlüsselung**: Hive bietet optionale Verschlüsselung
- **Keine sensiblen Daten**: Nur Getränke, Preise und Konsum-Historie

## 📱 Plattform-Unterstützung

### Primär
- **iOS**: Vollständig unterstützt mit nativer Cupertino-UI
- **iPhone**: Optimiert für alle Bildschirmgrößen
- **iPad**: Adaptive Layouts mit erweiterten Funktionen

### Entwicklung
- **Windows**: Vollständige Entwicklung möglich
- **Android**: Funktioniert, aber nicht optimiert
- **Web**: Für UI-Testing und Entwicklung

## 🚧 Bekannte Einschränkungen

### Windows-Entwicklung
- **iOS-Simulator**: Nicht verfügbar (nur auf macOS)
- **iOS-Builds**: Erfordern macOS + Xcode
- **TWINT-Testing**: App-Switching nur auf echten iOS-Geräten testbar

### TWINT-Integration
- **Entwickler-Account**: Erfordert Merchant-Vertrag bei Twint
- **API-Credentials**: Müssen über Twint Developer Portal bezogen werden
- **Deeplink-Spezifikation**: Kann sich je nach Händler unterscheiden

## 🔧 Troubleshooting

### Häufige Probleme

#### Flutter Doctor Fehler
```bash
flutter doctor --android-licenses
flutter clean
flutter pub get
```

#### iOS Build-Fehler
```bash
cd ios
pod deintegrate
pod install
cd ..
flutter clean
flutter pub get
```

#### Hive-Datenbank-Probleme
```bash
# App-Daten zurücksetzen (nur für Entwicklung!)
flutter clean
flutter pub get
```

## 📚 Weitere Ressourcen

- [Flutter Documentation](https://flutter.dev/docs)
- [Cupertino Widgets](https://api.flutter.dev/flutter/cupertino/cupertino-library.html)
- [Hive Database](https://docs.hivedb.dev/)
- [TWINT Developer Portal](https://www.twint.ch/entwickler/)

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch
3. Committe deine Änderungen
4. Erstelle einen Pull Request

## 📄 Lizenz

Dieses Projekt ist für den internen Gebrauch in der BierLounge bestimmt.

---

**Entwickelt mit ❤️ für die BierLounge Community**
