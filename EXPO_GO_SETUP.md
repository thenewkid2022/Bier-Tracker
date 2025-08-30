# 📱 Expo Go Setup - Lokale Testversion

Diese Anleitung führt Sie durch die Einrichtung der BierLounge Tracker App für **Expo Go**, damit Sie die App lokal auf Ihrem Gerät testen können.

## 🎯 **Was ist Expo Go?**

**Expo Go** ist eine kostenlose App, die es Ihnen ermöglicht, React Native Apps direkt auf Ihrem Gerät zu testen, ohne komplizierte Builds oder Installationen.

### **Vorteile:**
- ✅ **Sofortiges Testing** - Keine Build-Zeit
- ✅ **Live Updates** - Änderungen werden sofort angezeigt
- ✅ **Einfache Bedienung** - QR-Code scannen und loslegen
- ✅ **Kostenlos** - Keine Gebühren oder Registrierung erforderlich

## 📱 **Schritt 1: Expo Go App installieren**

### **iOS (iPhone/iPad):**
1. **App Store** öffnen
2. Nach **"Expo Go"** suchen
3. **Installieren** tippen
4. App öffnen

### **Android:**
1. **Google Play Store** öffnen
2. Nach **"Expo Go"** suchen
3. **Installieren** tippen
4. App öffnen

## 💻 **Schritt 2: Entwicklungsumgebung vorbereiten**

### **2.1 Node.js installieren (falls noch nicht vorhanden)**
```bash
# Überprüfen Sie, ob Node.js installiert ist
node --version
npm --version

# Falls nicht installiert: https://nodejs.org/
```

### **2.2 Expo CLI installieren**
```bash
npm install -g @expo/cli
```

### **2.3 Projekt-Dependencies installieren**
```bash
cd bierlounge-tracker
npm install
```

## 🚀 **Schritt 3: App starten**

### **3.1 Entwicklungsserver starten**
```bash
# Windows
start-expo-go.bat

# Linux/macOS
chmod +x start-expo-go.sh
./start-expo-go.sh

# Oder manuell
npm start
```

### **3.2 Was passiert:**
- **Metro Bundler** startet
- **QR-Code** wird im Terminal angezeigt
- **Web-Interface** öffnet sich im Browser
- **Expo DevTools** werden verfügbar

## 📱 **Schritt 4: App auf Gerät testen**

### **4.1 Gerät vorbereiten:**
- **WLAN aktivieren** auf Ihrem Gerät
- **Gleiches Netzwerk** wie Ihr Computer
- **Expo Go App** öffnen

### **4.2 QR-Code scannen:**
1. **Expo Go App** öffnen
2. **"Scan QR Code"** tippen
3. **QR-Code** aus dem Terminal scannen
4. **App lädt** automatisch

### **4.3 Alternative Methoden:**
- **Manueller Code**: Code aus Terminal eingeben
- **E-Mail**: Link per E-Mail senden
- **AirDrop**: Über AirDrop teilen (iOS)

## 🔧 **Schritt 5: Entwicklung & Testing**

### **5.1 Live Reload:**
- **Änderungen im Code** werden automatisch angezeigt
- **Kein Neustart** der App erforderlich
- **Sofortiges Feedback** bei Code-Änderungen

### **5.2 Debugging:**
- **Console-Logs** im Terminal
- **Fehlermeldungen** direkt auf dem Gerät
- **Performance-Monitoring** über Expo DevTools

### **5.3 Häufige Befehle:**
```bash
# App neu laden
r - Reload
R - Reload und Cache löschen

# Developer Menu öffnen
d - Developer Menu
```

## 📊 **Schritt 6: App-Funktionen testen**

### **6.1 Grundfunktionen:**
- ✅ **Benutzer auswählen**
- ✅ **Getränke kaufen**
- ✅ **Bestand aktualisieren**
- ✅ **Balance verfolgen**

### **6.2 Erweiterte Features:**
- ✅ **Admin-Bereich**
- ✅ **Benutzer verwalten**
- ✅ **Getränke hinzufügen**
- ✅ **Statistiken anzeigen**

### **6.3 Datenbank-Testing:**
- ✅ **SQLite-Funktionen**
- ✅ **Daten-Persistenz**
- ✅ **Offline-Funktionalität**

## 🐛 **Häufige Probleme & Lösungen**

### **Problem: "Unable to resolve module"**
```bash
# Lösung: Cache löschen
npm start -- --clear
# Oder
expo start --clear
```

### **Problem: "Metro bundler not found"**
```bash
# Lösung: Metro neu installieren
npm install metro
npm start
```

### **Problem: "Device not found"**
- **WLAN-Verbindung** überprüfen
- **Firewall-Einstellungen** kontrollieren
- **Gleiches Netzwerk** sicherstellen

### **Problem: "App lädt nicht"**
- **Expo Go App** neu starten
- **QR-Code** erneut scannen
- **Entwicklungsserver** neu starten

## 📱 **Plattform-spezifische Hinweise**

### **iOS:**
- **Kamera-Berechtigung** für QR-Code-Scan
- **WLAN-Einstellungen** überprüfen
- **AirDrop** für einfaches Teilen

### **Android:**
- **Kamera-Berechtigung** für QR-Code-Scan
- **WLAN-Einstellungen** überprüfen
- **Batterie-Optimierung** deaktivieren

## 🔒 **Sicherheitshinweise**

### **Entwicklungsumgebung:**
- **Nur im lokalen Netzwerk** verwenden
- **Nicht in öffentlichen WLANs** testen
- **Firewall-Einstellungen** beachten

### **Produktionsdaten:**
- **Keine echten Daten** in Expo Go verwenden
- **Demo-Daten** für Tests nutzen
- **Sensible Informationen** vermeiden

## 📚 **Nützliche Befehle**

### **Entwicklungsserver:**
```bash
# App starten
npm start

# Nur iOS
npm run ios

# Nur Android
npm run android

# Web-Version
npm run web
```

### **Expo CLI:**
```bash
# Projekt-Status
expo status

# Logs anzeigen
expo logs

# Cache löschen
expo start --clear
```

## 🎯 **Nächste Schritte**

### **Nach dem Testing:**
1. **Feedback sammeln** - Was funktioniert gut?
2. **Bugs dokumentieren** - Welche Probleme gibt es?
3. **Features planen** - Was soll hinzugefügt werden?
4. **Produktions-Build** vorbereiten

### **Für Produktion:**
1. **EAS Build** konfigurieren
2. **App Store** vorbereiten
3. **TestFlight** einrichten
4. **Beta-Testing** starten

## 📞 **Support & Hilfe**

### **Bei Problemen:**
- **Expo Documentation**: [docs.expo.dev](https://docs.expo.dev)
- **Expo Forums**: [forums.expo.dev](https://forums.expo.dev)
- **GitHub Issues**: Projekt-spezifische Probleme

### **Community:**
- **Expo Discord**: [discord.gg/expo](https://discord.gg/expo)
- **Stack Overflow**: [stackoverflow.com/questions/tagged/expo](https://stackoverflow.com/questions/tagged/expo)

---

**Viel Erfolg beim Testing Ihrer BierLounge Tracker App mit Expo Go! 🍺📱**

Bei Fragen oder Problemen können Sie sich gerne an die Expo-Community wenden.
