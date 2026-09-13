# 📱 Android Studio Installation & Setup

## 🎯 Ziel
Android Studio installieren und konfigurieren, um die Getränke Tracker App auf Android zu testen und zu entwickeln.

## 📥 Schritt 1: Android Studio herunterladen

### Download-Link:
**Offizielle Website:** https://developer.android.com/studio

### Systemanforderungen:
- **Windows:** Windows 7/8/10/11 (64-bit)
- **RAM:** Mindestens 8 GB, empfohlen 16 GB
- **Festplatte:** Mindestens 8 GB freier Speicher
- **Auflösung:** Mindestens 1280 x 800

## 🚀 Schritt 2: Android Studio installieren

### Installationsschritte:
1. **Download-Datei ausführen** (z.B. `android-studio-2023.1.1.26-windows.exe`)
2. **Setup-Assistent starten** → "Next" klicken
3. **Installationstyp wählen:**
   - ✅ **Standard** (empfohlen für Anfänger)
   - ❌ Custom (nur für erfahrene Entwickler)
4. **Installationsverzeichnis bestätigen** (Standard: `C:\Program Files\Android\Android Studio`)
5. **Start Menu Ordner bestätigen** → "Install" klicken
6. **Installation abwarten** (kann 10-30 Minuten dauern)
7. **"Finish" klicken** → Android Studio startet

## ⚙️ Schritt 3: Erste Konfiguration

### Setup-Assistent:
1. **"Do not import settings"** wählen → "OK"
2. **"Welcome" Screen** → "Next" klicken
3. **Installationstyp:**
   - ✅ **Standard** (empfohlen)
   - ❌ Custom
4. **UI Theme wählen:**
   - 🎨 **Light** (Standard)
   - 🌙 **Dark** (für bessere Augen)
5. **"Finish" klicken** → Download der SDK-Komponenten startet

### Wichtige Hinweise:
- **Internetverbindung erforderlich** für SDK-Download
- **Download kann 1-2 Stunden dauern** (je nach Internetgeschwindigkeit)
- **Nicht unterbrechen** - Installation neu starten bei Abbruch

## 📱 Schritt 4: Android SDK installieren

### SDK Manager öffnen:
1. **Android Studio** → "Tools" → "SDK Manager"
2. **Oder:** "File" → "Settings" → "Appearance & Behavior" → "System Settings" → "Android SDK"

### SDK Platforms installieren:
1. **"SDK Platforms" Tab** aktivieren
2. **Folgende Versionen installieren:**
   - ✅ **Android 14.0 (API 34)** - Neueste Version
   - ✅ **Android 13.0 (API 33)** - Stabile Version
   - ✅ **Android 12.0 (API 31)** - Breite Kompatibilität
   - ✅ **Android 11.0 (API 30)** - Minimale Anforderung

### SDK Tools installieren:
1. **"SDK Tools" Tab** aktivieren
2. **Folgende Tools installieren:**
   - ✅ **Android SDK Build-Tools**
   - ✅ **Android SDK Command-line Tools**
   - ✅ **Android Emulator**
   - ✅ **Android SDK Platform-Tools**
   - ✅ **Intel x86 Emulator Accelerator (HAXM installer)**

### Installation starten:
1. **"Apply" klicken**
2. **"OK" bestätigen**
3. **Download und Installation abwarten**

## 🎮 Schritt 5: Android Emulator erstellen

### AVD Manager öffnen:
1. **Android Studio** → "Tools" → "AVD Manager"
2. **Oder:** "Tools" → "Device Manager"

### Virtuelles Gerät erstellen:
1. **"Create Virtual Device" klicken**
2. **Geräte auswählen:**
   - 📱 **Phone** → **Pixel 7** (empfohlen)
   - 📱 **Phone** → **Pixel 6** (Alternative)
3. **"Next" klicken**

### System Image wählen:
1. **"System Image" Tab** aktivieren
2. **Empfohlene Auswahl:**
   - ✅ **API 34** (Android 14.0) - Neueste
   - ✅ **API 33** (Android 13.0) - Stabile
3. **"Download" klicken** falls nicht verfügbar
4. **"Next" klicken**

### Emulator konfigurieren:
1. **AVD Name:** Standard beibehalten oder ändern
2. **Startup orientation:** Portrait (Standard)
3. **Graphics:** Hardware - GLES 2.0
4. **"Finish" klicken**

## 🔧 Schritt 6: Umgebungsvariablen setzen

### Windows Umgebungsvariablen:
1. **Windows-Taste + R** → `sysdm.cpl` eingeben → "OK"
2. **"Erweitert" Tab** → "Umgebungsvariablen" klicken
3. **"Systemvariablen"** → "Neu" klicken
4. **Variablenname:** `ANDROID_HOME`
5. **Variablenwert:** `C:\Users\[USERNAME]\AppData\Local\Android\Sdk`
6. **"OK" klicken**

### PATH erweitern:
1. **"Systemvariablen"** → "Path" auswählen → "Bearbeiten" klicken
2. **"Neu" klicken** → `%ANDROID_HOME%\platform-tools` eingeben
3. **"Neu" klicken** → `%ANDROID_HOME%\tools` eingeben
4. **"OK" klicken** → Alle Dialoge schließen

### PowerShell/Terminal neu starten:
```bash
# Neue Umgebungsvariablen laden
refreshenv

# Oder Terminal/PowerShell neu starten
```

## ✅ Schritt 7: Installation testen

### ADB testen:
```bash
# Android Debug Bridge testen
adb version

# Verfügbare Geräte anzeigen
adb devices
```

### Emulator starten:
1. **AVD Manager** → Emulator auswählen → "Play" Button
2. **Emulator startet** (kann 2-5 Minuten dauern)
3. **Android-System lädt** → "Start" Button klicken

## 🚀 Schritt 8: App auf Android testen

### App starten:
```bash
# Im Projektverzeichnis
npm run android

# Oder mit Expo
expo start --android
```

### Erwartetes Ergebnis:
✅ **Metro Bundler startet**  
✅ **Android-Emulator wird erkannt**  
✅ **App wird installiert und gestartet**  
✅ **Alle Screens sind zugänglich**  

## 🔧 Fehlerbehebung

### Problem: "SDK not found"
**Lösung:** ANDROID_HOME Umgebungsvariable korrekt setzen

### Problem: "Emulator not found"
**Lösung:** AVD Manager → Emulator erstellen

### Problem: "Permission denied"
**Lösung:** USB-Debugging auf physischem Gerät aktivieren

### Problem: "HAXM not available"
**Lösung:** Intel HAXM über SDK Manager installieren

## 📱 Nächste Schritte

Nach erfolgreicher Installation:
1. **App auf Emulator testen**
2. **Berechtigungen testen**
3. **UI für Material Design anpassen**
4. **Android-Build erstellen**

---

**Viel Erfolg bei der Android-Entwicklung! 🚀📱**

**Hilfe bei Problemen:**
- Android Studio Dokumentation: https://developer.android.com/studio
- Expo Android Setup: https://docs.expo.dev/workflow/android-studio-guide/
