# 🚀 Google Play Store Einrichtung

## 📋 **Voraussetzungen**

### **1. Google Play Developer Account**
- Kosten: **25$ einmalig**
- Link: [Google Play Console](https://play.google.com/console)
- Dauer: 1-2 Werktage für Genehmigung

### **2. App-Listing vorbereiten**
- **App-Name:** Getränke Tracker
- **Kurzbeschreibung:** Einfache Verwaltung von Getränke-Einkäufen
- **Vollständige Beschreibung:** Siehe unten
- **Kategorie:** Produktivität
- **Altersfreigabe:** 3+

---

## 🎨 **App-Listing Inhalt**

### **App-Name:**
```
Getränke Tracker
```

### **Kurzbeschreibung (80 Zeichen):**
```
Einfache Verwaltung von Getränke-Einkäufen und Ausgaben
```

### **Vollständige Beschreibung:**
```
Getränke Tracker - Die einfache Lösung für die Verwaltung Ihrer Getränke-Einkäufe!

🎯 **Hauptfunktionen:**
• Benutzerprofile mit Guthaben verwalten
• Getränke-Katalog mit Preisen und Lagerbestand
• Einfache Kaufabwicklung mit Mengenauswahl
• Automatische Kostenverfolgung
• TWINT-Integration für Zahlungen
• Übersichtliche Statistiken und Verbrauchsdaten

💡 **Perfekt für:**
• Wohngemeinschaften
• Büros und Arbeitsplätze
• Vereine und Gruppen
• Private Veranstaltungen

🔒 **Datenschutz:**
• Alle Daten werden lokal gespeichert
• Keine externen Server
• Vollständige Kontrolle über Ihre Daten

📱 **Features:**
• Intuitive Benutzeroberfläche
• Material Design für Android
• Offline-Funktionalität
• Schnelle und zuverlässige Performance

Laden Sie Getränke Tracker jetzt herunter und behalten Sie den Überblick über Ihre Getränke-Ausgaben!
```

---

## 🖼️ **Screenshots (erforderlich)**

### **Mindestens 2 Screenshots von:**
1. **Hauptbildschirm** - Getränke-Auswahl
2. **Admin-Bereich** - Benutzer- und Getränkeverwaltung
3. **Kaufprozess** - Mengenauswahl
4. **Profil-Übersicht** - Guthaben und Verbrauch

### **Screenshot-Anforderungen:**
- **Format:** PNG oder JPEG
- **Auflösung:** Mindestens 320px Breite
- **Maximale Größe:** 8MB pro Bild
- **Geräte:** Mindestens 1x für jedes unterstützte Gerät

---

## ⚙️ **Google Service Account einrichten**

### **1. Google Cloud Console**
- Gehe zu [Google Cloud Console](https://console.cloud.google.com/)
- Erstelle ein neues Projekt oder wähle ein bestehendes

### **2. Service Account erstellen**
- **IAM & Admin** → **Service Accounts**
- **Service Account erstellen**
- **Name:** `getraenke-tracker-play-store`
- **Beschreibung:** Service Account für Google Play Store Uploads

### **3. Berechtigungen zuweisen**
- **Rolle:** `Play Console Admin` oder `Play Console Developer`
- **Schlüssel erstellen:** JSON-Datei herunterladen

### **4. Datei umbenennen**
```
google-service-account.json
```

---

## 📁 **Datei-Struktur**

```
Bierkontrolle/
├── google-service-account.json    ← Hier platzieren
├── app.json
├── eas.json
└── assets/
```

---

## 🚀 **EAS Submit konfigurieren**

### **eas.json aktualisieren:**
```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

---

## 📤 **App hochladen**

### **Nach Google Play Console Einrichtung:**
```bash
# App zum Google Play Store hochladen
npm run submit:android
```

---

## ⏱️ **Zeitplan**

1. **Google Play Console:** 1-2 Werktage
2. **App-Listing erstellen:** 1-2 Stunden
3. **Screenshots erstellen:** 30 Minuten
4. **App hochladen:** 15 Minuten
5. **Review-Prozess:** 1-7 Tage

---

## 🎯 **Nächste Schritte**

1. **Google Play Developer Account erstellen**
2. **App-Listing vorbereiten**
3. **Screenshots erstellen**
4. **Google Service Account einrichten**
5. **App hochladen**

**Fragen?** Schau in die [Google Play Console Dokumentation](https://support.google.com/googleplay/android-developer)
