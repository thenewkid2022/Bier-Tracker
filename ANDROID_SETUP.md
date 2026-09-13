# 🚀 Android Setup - Getränke Tracker

## 📋 Schnellstart für Android-Entwicklung

### 1. Dependencies installieren ✅

```bash
# Android-spezifische Berechtigungen
npm install react-native-permissions

# Optional: Material Design Komponenten
npm install react-native-paper
```

**Status:** ✅ Beide Pakete wurden erfolgreich installiert!

### 2. Android-Entwicklungsumgebung einrichten

#### Android Studio installieren:
1. **Android Studio** von [developer.android.com](https://developer.android.com/studio) herunterladen
2. **Android SDK** installieren (API Level 30+ empfohlen)
3. **Android Emulator** erstellen

#### Umgebungsvariablen setzen (Windows):
```bash
# ANDROID_HOME setzen
set ANDROID_HOME=C:\Users\[USERNAME]\AppData\Local\Android\Sdk

# PATH erweitern
set PATH=%PATH%;%ANDROID_HOME%\platform-tools
set PATH=%PATH%;%ANDROID_HOME%\tools
```

#### Umgebungsvariablen setzen (macOS/Linux):
```bash
# ~/.bash_profile oder ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
```

### 3. Erste Android-Tests

```bash
# App auf Android-Emulator starten
npm run android

# Oder mit Expo
expo start --android
```

### 4. Android-Build erstellen

```bash
# Preview-Build (APK)
npm run build:android-preview

# Produktions-Build (AAB für Google Play Store)
npm run build:android
```

## 🔧 Häufige Probleme

### Problem: "SDK not found" ✅ IDENTIFIZIERT
**Fehlermeldung:** `Failed to resolve the Android SDK path. Default install location not found: C:\Users\chrig\AppData\Local\Android\Sdk`

**Lösung:** 
1. Android Studio installieren
2. ANDROID_HOME Umgebungsvariable setzen
3. Android SDK installieren

### Problem: "Emulator not found"
**Lösung:** Android Studio öffnen und Emulator erstellen

### Problem: "Permission denied"
**Lösung:** USB-Debugging auf Android-Gerät aktivieren

## 🚨 AKTUELLER STATUS

**Was funktioniert:** ✅
- Dependencies installiert
- App-Konfiguration für Android bereit
- Platform-spezifische Styles implementiert
- Berechtigungsverwaltung implementiert

**Was fehlt:** ❌
- Android Studio
- Android SDK
- Android Emulator
- ANDROID_HOME Umgebungsvariable

## 📱 Nächste Schritte

1. **Android Studio installieren** - [Download hier](https://developer.android.com/studio)
2. **Android SDK installieren** (über Android Studio)
3. **Emulator erstellen** (über AVD Manager)
4. **Umgebungsvariablen setzen**
5. **App testen** auf Android-Emulator

## 🆘 Hilfe

- **Expo Docs**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **Android Developer**: https://developer.android.com/

---

**Viel Erfolg bei der Android-Entwicklung! 🚀📱**
