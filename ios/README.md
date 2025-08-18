# iOS Setup Guide für BierLounge Tracker 🍎

## 📋 Voraussetzungen

### Hardware & Software
- **macOS** (mindestens 10.15 Catalina)
- **Xcode** (mindestens Version 12.0)
- **CocoaPods** (mindestens Version 1.10.0)
- **Flutter SDK** (mindestens Version 3.3.0)

### Accounts
- **Apple Developer Account** (für App Store Deployment)
- **TWINT Merchant Account** (für Zahlungsintegration)

## 🚀 Erste Schritte

### 1. Flutter iOS Setup
```bash
# Flutter Doctor ausführen
flutter doctor

# iOS-Tools überprüfen
flutter doctor --android-licenses
```

### 2. iOS Dependencies installieren
```bash
cd ios
pod install
cd ..
```

### 3. iOS-Simulator starten
```bash
# Verfügbare Simulatoren anzeigen
xcrun simctl list devices

# Simulator starten
open -a Simulator

# App im Simulator starten
flutter run -d ios
```

## 🔧 iOS-spezifische Konfiguration

### Info.plist Konfiguration

#### TWINT-Integration
Füge folgende Einträge in `ios/Runner/Info.plist` hinzu:

```xml
<key>LSApplicationQueriesSchemes</key>
<array>
    <!-- TWINT App-Schemes -->
    <string>twint-extended</string>
    <string>twint-issuer1</string>
    <string>twint-issuer2</string>
    <string>twint-issuer3</string>
    <string>twint-issuer4</string>
    <string>twint-issuer5</string>
    <string>twint-issuer6</string>
    <string>twint-issuer7</string>
    <string>twint-issuer8</string>
    <string>twint-issuer9</string>
    <string>twint-issuer10</string>
    <string>twint-issuer11</string>
    <string>twint-issuer12</string>
    <string>twint-issuer13</string>
    <string>twint-issuer14</string>
    <string>twint-issuer15</string>
    <string>twint-issuer16</string>
    <string>twint-issuer17</string>
    <string>twint-issuer18</string>
    <string>twint-issuer19</string>
    <string>twint-issuer20</string>
    <string>twint-issuer21</string>
    <string>twint-issuer22</string>
    <string>twint-issuer23</string>
    <string>twint-issuer24</string>
    <string>twint-issuer25</string>
    <string>twint-issuer26</string>
    <string>twint-issuer27</string>
    <string>twint-issuer28</string>
    <string>twint-issuer29</string>
    <string>twint-issuer30</string>
    <string>twint-issuer31</string>
    <string>twint-issuer32</string>
    <string>twint-issuer33</string>
    <string>twint-issuer34</string>
    <string>twint-issuer35</string>
    <string>twint-issuer36</string>
    <string>twint-issuer37</string>
    <string>twint-issuer38</string>
    <string>twint-issuer39</string>
    <string>twint-issuer40</string>
</array>

<!-- URL-Schemes für TWINT-Deeplinks -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>twint-payment</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>bierlounge-tracker</string>
        </array>
    </dict>
</array>
```

#### Berechtigungen
```xml
<!-- Benachrichtigungen -->
<key>NSUserNotificationUsageDescription</key>
<string>BierLounge Tracker benötigt Benachrichtigungen für wichtige Updates.</string>

<!-- Kamera (für QR-Code-Scanning) -->
<key>NSCameraUsageDescription</key>
<string>BierLounge Tracker benötigt Zugriff auf die Kamera zum Scannen von QR-Codes.</string>

<!-- Lokale Netzwerke (für TWINT-Integration) -->
<key>NSLocalNetworkUsageDescription</key>
<string>BierLounge Tracker benötigt Zugriff auf lokale Netzwerke für TWINT-Zahlungen.</string>
```

### 2. TWINT-Entwickler-Setup

#### Schritt 1: Merchant-Account erstellen
1. Besuche [TWINT Developer Portal](https://www.twint.ch/entwickler/)
2. Erstelle einen Merchant-Account
3. Bestätige deine Identität
4. Warte auf Freischaltung

#### Schritt 2: API-Credentials erhalten
1. Logge dich in dein Developer-Konto ein
2. Erstelle eine neue App
3. Notiere dir:
   - **Merchant UUID**
   - **API-Key**
   - **Deeplink-Spezifikation**

#### Schritt 3: Code anpassen
Öffne `lib/services/payment_service.dart` und ersetze die Platzhalter:

```dart
// Ersetze YOUR_UUID mit deiner echten Merchant UUID
final uri = Uri.parse('twint://pay?amount=${amount.toStringAsFixed(2)}&currency=CHF&ref=${Uri.encodeComponent(orderRef ?? '')}&merchantUuid=DEINE_ECHTE_UUID');
```

### 3. App-Icon und Launch-Screen

#### App-Icon
1. Erstelle Icons in verschiedenen Größen (1024x1024, 512x512, etc.)
2. Platziere sie in `ios/Runner/Assets.xcassets/AppIcon.appiconset/`
3. Aktualisiere `Contents.json` entsprechend

#### Launch-Screen
1. Bearbeite `ios/Runner/Base.lproj/LaunchScreen.storyboard`
2. Füge dein Logo und Branding hinzu
3. Stelle sicher, dass es auf allen Bildschirmgrößen gut aussieht

## 🏗️ Build & Deployment

### 1. Debug-Build
```bash
# Debug-Build für Simulator
flutter build ios --debug

# Debug-Build für echtes Gerät
flutter build ios --debug --no-codesign
```

### 2. Release-Build
```bash
# Release-Build erstellen
flutter build ios --release

# Archive für App Store erstellen
flutter build ios --release --no-codesign
```

### 3. Code-Signing
1. Öffne das Projekt in Xcode
2. Wähle dein Team aus
3. Setze die Bundle-ID
4. Aktiviere Automatisches Code-Signing

## 📱 Testing

### Simulator-Testing
```bash
# App im Simulator starten
flutter run -d ios

# Spezifischen Simulator wählen
flutter run -d "iPhone 14 Pro"
```

### Geräte-Testing
1. Verbinde dein iOS-Gerät
2. Vertraue dem Entwickler-Zertifikat
3. Starte die App: `flutter run -d <device-id>`

### TWINT-Testing
- **Simulator**: TWINT-App-Switching funktioniert nicht
- **Echtes Gerät**: Vollständige TWINT-Integration testbar
- **Fallback**: QR-Code wird angezeigt, wenn TWINT nicht verfügbar

## 🚨 Häufige Probleme

### Build-Fehler
```bash
# CocoaPods zurücksetzen
cd ios
pod deintegrate
pod install
cd ..

# Flutter Cache leeren
flutter clean
flutter pub get
```

### Code-Signing-Probleme
1. Überprüfe dein Apple Developer-Konto
2. Stelle sicher, dass das Gerät registriert ist
3. Überprüfe die Bundle-ID-Einstellungen

### TWINT-Probleme
1. Überprüfe die URL-Schemes in Info.plist
2. Stelle sicher, dass TWINT auf dem Gerät installiert ist
3. Teste mit echten TWINT-Credentials

## 📚 Ressourcen

- [Flutter iOS Deployment](https://flutter.dev/docs/deployment/ios)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [TWINT Developer Portal](https://www.twint.ch/entwickler/)
- [CocoaPods Documentation](https://cocoapods.org/)

## 🔐 Sicherheitshinweise

- **API-Keys**: Niemals in den Code committen
- **Merchant-UUID**: Behalte sie geheim
- **Code-Signing**: Verwende nur deine eigenen Zertifikate
- **App-Review**: Folge den Apple App Store Guidelines

---

**Wichtig**: Diese Konfiguration ist für die Entwicklungsumgebung. Für Produktion müssen alle Platzhalter durch echte Werte ersetzt werden.
