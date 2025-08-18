# Windows Development Guide für BierLounge Tracker 🪟

## 🎯 Übersicht

Dieser Guide erklärt, wie du die BierLounge Tracker App auf Windows entwickeln und testen kannst. Obwohl die App primär für iOS entwickelt wurde, ist eine vollständige Entwicklung auf Windows möglich.

## ✅ Was funktioniert auf Windows

### Vollständig unterstützt
- **Flutter Development**: Alle Flutter-Features
- **Hot Reload**: Sofortige UI-Updates
- **Debugging**: Vollständiges Debugging
- **Code-Editing**: Alle IDEs und Editoren
- **Version Control**: Git und alle Git-Tools
- **Package Management**: `flutter pub get`, `flutter pub upgrade`

### Teilweise unterstützt
- **UI Testing**: Web und Android Emulator
- **Performance Testing**: Android Emulator
- **Cross-Platform Testing**: Web für UI-Verhalten

### Nicht verfügbar
- **iOS Simulator**: Nur auf macOS verfügbar
- **iOS Builds**: Erfordert Xcode (macOS)
- **iOS Deployment**: App Store Connect nur auf macOS
- **TWINT App-Switching**: Nur auf echten iOS-Geräten testbar

## 🚀 Setup auf Windows

### 1. Flutter SDK installieren

#### Option A: Flutter Installer
1. Lade den [Flutter Installer](https://docs.flutter.dev/get-started/install/windows) herunter
2. Führe die `.exe` aus
3. Folge dem Setup-Assistenten

#### Option B: Manuell
```bash
# Flutter Repository klonen
git clone https://github.com/flutter/flutter.git
cd flutter

# Flutter zu PATH hinzufügen
# Füge C:\path\to\flutter\bin zu deinen Umgebungsvariablen hinzu
```

### 2. Dependencies installieren

#### Android Studio
1. Lade [Android Studio](https://developer.android.com/studio) herunter
2. Installiere Android Studio
3. Installiere Android SDK
4. Erstelle einen Android Virtual Device (AVD)

#### VS Code (Alternative)
1. Installiere [VS Code](https://code.visualstudio.com/)
2. Installiere Flutter Extension
3. Installiere Dart Extension

### 3. Flutter Doctor
```bash
# Überprüfe deine Installation
flutter doctor

# Behebe alle gemeldeten Probleme
flutter doctor --android-licenses
```

## 🧪 Testing auf Windows

### Web Testing (Empfohlen für UI)
```bash
# App im Browser starten
flutter run -d chrome

# Vorteile:
# - Schnellster Start
# - Hot Reload funktioniert perfekt
# - Alle UI-Features testbar
# - Keine Emulator-Performance-Probleme

# Nachteile:
# - Keine nativen iOS-Features
# - TWINT-Integration funktioniert nicht
# - Einige Platform-spezifische APIs nicht verfügbar
```

### Android Emulator Testing
```bash
# Android Emulator starten
flutter run -d android

# Vorteile:
# - Bessere Performance als Web
# - Native Android-Features
# - Realistische Touch-Interaktionen
# - Bessere Performance-Tests

# Nachteile:
# - Langsamer Start
# - Emulator-Performance-Probleme möglich
# - Keine iOS-spezifischen Features
```

### Verfügbare Targets anzeigen
```bash
# Alle verfügbaren Geräte anzeigen
flutter devices

# Beispiel-Ausgabe:
# 2 connected devices:
# Chrome (web-javascript) • chrome • web-javascript • Google Chrome 120.0.6099.109
# Android SDK built for x86 (mobile) • android-x86 • android-x86-64 • Android 13 (API 33)
```

## 🔧 Entwicklungsworkflow

### 1. Projekt starten
```bash
# Repository klonen
git clone <repository-url>
cd bierlounge_tracker

# Dependencies installieren
flutter pub get

# App starten (Web für schnelles Testing)
flutter run -d chrome
```

### 2. Code-Änderungen
```bash
# Hot Reload (funktioniert auf allen Plattformen)
# Drücke 'r' im Terminal für Hot Reload
# Drücke 'R' für Hot Restart
# Drücke 'q' zum Beenden
```

### 3. Testing
```bash
# Unit Tests
flutter test

# Widget Tests
flutter test test/widget_test.dart

# Integration Tests (Android Emulator)
flutter drive --target=test_driver/app.dart
```

## 🎨 UI-Entwicklung auf Windows

### Cupertino Widgets
```dart
// Cupertino Widgets funktionieren perfekt auf Windows
import 'package:flutter/cupertino.dart';

// Alle Cupertino-Features sind verfügbar
CupertinoButton(
  onPressed: () {},
  child: Text('iOS-Style Button'),
)
```

### Responsive Design Testing
```dart
// Teste verschiedene Bildschirmgrößen
// Web: Browser-Fenster resizen
// Android: Verschiedene AVDs erstellen

// Beispiel für adaptive Layouts
Widget build(BuildContext context) {
  final isWide = MediaQuery.of(context).size.width >= 900;
  
  return isWide 
    ? _buildWideLayout() 
    : _buildNarrowLayout();
}
```

### Platform Detection
```dart
import 'package:flutter/foundation.dart';

// Erkenne die aktuelle Plattform
if (kIsWeb) {
  // Web-spezifischer Code
} else if (Platform.isAndroid) {
  // Android-spezifischer Code
} else if (Platform.isIOS) {
  // iOS-spezifischer Code (nur auf macOS verfügbar)
}
```

## 🚧 iOS-spezifische Features

### TWINT-Integration
```dart
// Auf Windows: Fallback zu QR-Code
if (kIsWeb || Platform.isAndroid) {
  // Zeige QR-Code an
  _showQrCode(amount);
} else {
  // Versuche TWINT-App-Switching (nur auf iOS)
  _openTwintApp(amount);
}
```

### iOS-spezifische APIs
```dart
// Verwende Platform-spezifische Implementierungen
class NotificationService {
  static Future<void> showNotification(String title, String body) async {
    if (kIsWeb) {
      // Web-Fallback
      _showWebNotification(title, body);
    } else if (Platform.isAndroid) {
      // Android-Implementierung
      _showAndroidNotification(title, body);
    } else if (Platform.isIOS) {
      // iOS-Implementierung (nur auf macOS verfügbar)
      _showIOSNotification(title, body);
    }
  }
}
```

## 📱 Testing-Strategien

### 1. Web-First Development
```bash
# Entwickle und teste primär im Web
flutter run -d chrome

# Vorteile:
# - Schnellste Entwicklung
# - Beste Hot Reload Performance
# - Alle UI-Features sofort testbar
```

### 2. Android-Validation
```bash
# Regelmäßig auf Android testen
flutter run -d android

# Überprüfe:
# - Touch-Interaktionen
# - Performance
# - Native Android-Features
```

### 3. iOS-Validation (auf macOS)
```bash
# Wenn möglich, auf macOS testen
flutter run -d ios

# Überprüfe:
# - Cupertino-UI-Verhalten
# - iOS-spezifische Features
# - TWINT-Integration
```

## 🔍 Debugging auf Windows

### Flutter Inspector
```bash
# Flutter Inspector starten
flutter run -d chrome --web-renderer html

# Features:
# - Widget Tree anzeigen
# - Layout-Probleme debuggen
# - Performance analysieren
```

### DevTools
```bash
# Flutter DevTools starten
flutter run -d chrome
# Dann 'd' drücken oder DevTools manuell öffnen

# Features:
# - Performance-Profiling
# - Memory-Analyse
# - Network-Monitoring
```

### Console Logging
```dart
// Verwende print() für Debugging
print('Debug: User selected ${user.name}');

// Oder debugPrint() für bessere Performance
debugPrint('Debug: Drink consumed: ${drink.name}');
```

## 🚀 Deployment-Vorbereitung

### 1. Code-Qualität
```bash
# Code analysieren
flutter analyze

# Linting-Probleme beheben
flutter fix --apply

# Formatierung prüfen
dart format --set-exit-if-changed lib/
```

### 2. Build-Tests
```bash
# Web-Build testen
flutter build web

# Android-Build testen
flutter build apk --debug

# iOS-Build (nur auf macOS)
# flutter build ios --debug
```

### 3. Package-Versionen
```yaml
# pubspec.yaml aktualisieren
dependencies:
  flutter:
    sdk: flutter
  # Stelle sicher, dass alle Versionen aktuell sind
  hive: ^2.2.3
  cupertino_icons: ^1.0.6
```

## 🔄 Continuous Integration

### GitHub Actions (Windows)
```yaml
# .github/workflows/windows.yml
name: Windows CI

on: [push, pull_request]

jobs:
  test:
    runs-on: windows-latest
    
    steps:
    - uses: actions/checkout@v3
    - uses: subosito/flutter-action@v2
      with:
        flutter-version: '3.19.0'
        channel: 'stable'
    
    - run: flutter pub get
    - run: flutter analyze
    - run: flutter test
    - run: flutter build web
    - run: flutter build apk --debug
```

## 📚 Nützliche Tools

### Flutter Commands
```bash
# Projekt-Status
flutter doctor

# Dependencies
flutter pub get
flutter pub upgrade
flutter pub outdated

# Builds
flutter build web
flutter build apk
flutter build ios  # Nur auf macOS

# Testing
flutter test
flutter drive
```

### VS Code Extensions
- **Flutter**: Offizielle Flutter Extension
- **Dart**: Dart Language Support
- **Flutter Widget Snippets**: Code-Snippets
- **Flutter Tree**: Widget Tree Visualizer

### Android Studio Plugins
- **Flutter Plugin**: Offizielles Flutter Plugin
- **Dart Plugin**: Dart Language Support

## 🚨 Häufige Probleme

### Flutter Doctor Fehler
```bash
# Android-Lizenzen
flutter doctor --android-licenses

# Flutter aktualisieren
flutter upgrade

# Flutter Cache leeren
flutter clean
flutter pub get
```

### Performance-Probleme
```bash
# Web-Renderer wechseln
flutter run -d chrome --web-renderer html
flutter run -d chrome --web-renderer canvaskit

# Android Emulator optimieren
# - Hardware Acceleration aktivieren
# - RAM und Storage erhöhen
# - Snapshot verwenden
```

### Build-Fehler
```bash
# Dependencies zurücksetzen
flutter clean
flutter pub get

# Android Build Cache leeren
cd android
./gradlew clean
cd ..
```

## 🎯 Best Practices

### 1. Platform-Agnostic Code
```dart
// Schreibe Code, der auf allen Plattformen funktioniert
class DrinkService {
  static Future<List<Drink>> getDrinks() async {
    // Verwende Hive für lokale Speicherung
    // Funktioniert auf allen Plattformen
    return HiveService.drinksBox.values.toList();
  }
}
```

### 2. Graceful Degradation
```dart
// Biete Fallbacks für nicht verfügbare Features
if (PaymentService.twintSupportedOnPlatform()) {
  _showTwintButton();
} else {
  _showQrCodeButton();
}
```

### 3. Responsive Design
```dart
// Teste auf verschiedenen Bildschirmgrößen
Widget build(BuildContext context) {
  final size = MediaQuery.of(context).size;
  final isTablet = size.width > 600;
  
  return isTablet 
    ? _buildTabletLayout() 
    : _buildPhoneLayout();
}
```

## 🔮 Nächste Schritte

### Kurzfristig
1. **Web-Development**: Entwickle und teste im Browser
2. **Android-Validation**: Regelmäßig auf Android testen
3. **Code-Qualität**: Analysiere und optimiere den Code

### Mittelfristig
1. **macOS-Access**: Teste auf macOS für iOS-Validierung
2. **TWINT-Integration**: Implementiere echte TWINT-Credentials
3. **Performance**: Optimiere für verschiedene Plattformen

### Langfristig
1. **iOS-Deployment**: App Store Deployment
2. **Production**: Echte TWINT-Integration
3. **Monitoring**: Analytics und Crash-Reporting

---

**Fazit**: Windows-Entwicklung ist vollständig möglich und produktiv. Verwende Web für schnelle UI-Entwicklung und Android für native Features. iOS-spezifische Features können später auf macOS getestet werden.
