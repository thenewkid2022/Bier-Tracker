# 🚀 TestFlight Setup Anleitung

Diese Anleitung führt Sie durch den kompletten Prozess der TestFlight-Bereitstellung Ihrer Getränke Tracker App.

## 📋 Voraussetzungen

- ✅ Apple Developer Account (bereits vorhanden)
- ✅ Expo Account
- ✅ EAS CLI installiert
- ✅ Xcode (für lokale Tests)

## 🔧 Schritt 1: EAS CLI Installation

```bash
npm install -g @expo/cli
npm install -g eas-cli
```

## 🔑 Schritt 2: EAS Login

```bash
eas login
```

## 🆔 Schritt 3: EAS Project ID abrufen

```bash
eas init
```

**Wichtig:** Die generierte Project ID in `app.json` unter `extra.eas.projectId` eintragen.

## 🏗️ Schritt 4: Build für TestFlight erstellen

```bash
eas build --platform ios --profile testflight
```

## 📱 Schritt 5: App Store Connect vorbereiten

1. **App Store Connect öffnen:** https://appstoreconnect.apple.com
2. **Neue App erstellen** (falls noch nicht geschehen)
3. **Bundle ID:** `com.thenewkid2022.bierlounge-tracker`
4. **App-Informationen ausfüllen:**
   - App Name: "Getränke Tracker"
   - Primäre Sprache: Deutsch
   - Bundle ID: `com.thenewkid2022.bierlounge-tracker`
   - SKU: `GT-001` ✅ (bereits konfiguriert)
   - Apple ID: `6751214675` ✅ (bereits konfiguriert)

## ⚙️ Schritt 6: EAS Submit konfigurieren

Die `eas.json` Datei enthält Submit-Profile für `testflight` und `production`:

```json
{
  "submit": {
    "testflight": {
      "ios": {
        "ascAppId": "6751214675",
        "appleTeamId": "767Q6NXN2U"
      }
    },
    "production": {
      "ios": {
        "ascAppId": "6751214675",
        "appleTeamId": "767Q6NXN2U"
      }
    }
  }
}
```

- **ascAppId:** `6751214675` (App Store Connect → App-Informationen → Apple-ID)
- **appleTeamId:** `767Q6NXN2U`
- **Bundle ID:** `com.thenewkid2022.bierlounge-tracker`
- **SKU:** `GT-001`
- Die Apple-ID (E-Mail) wird beim ersten `eas submit` interaktiv abgefragt und von EAS gespeichert –
  sie steht bewusst nicht im Repo.

**🎉 Sie können jetzt direkt mit dem Build beginnen!**

## 🚀 Schritt 7: App für TestFlight einreichen

```bash
eas submit --platform ios --profile testflight
```

## 📋 Schritt 8: TestFlight-Review

1. **App Store Connect → TestFlight**
2. **Build auswählen**
3. **Test-Informationen ausfüllen:**
   - Was zu testen ist
   - Test-Anweisungen
   - Feedback-E-Mail

## 🔄 Schritt 9: Externe Tester einladen

1. **TestFlight → Externe Tester**
2. **Tester hinzufügen** (E-Mail-Adressen)
3. **Test-Gruppe erstellen**
4. **Build der Test-Gruppe zuweisen**

## ⚠️ Wichtige Hinweise

### Bundle Version aktualisieren
Bei jedem neuen Build müssen `ios.buildNumber` und `android.versionCode` in `app.json` erhöht werden.
Das erledigt ein Skript für beide Plattformen gleichzeitig:

```bash
npm run bump:build
```

### App-Version aktualisieren
Bei größeren Änderungen die `version` in `app.json` erhöhen:

```json
"version": "1.1.0"  // Von "1.0.0" auf "1.1.0"
```

## 🐛 Häufige Probleme

### Build schlägt fehl
```bash
# Logs anzeigen
eas build:list
eas build:view [BUILD_ID]
```

### Submit schlägt fehl
```bash
# Status prüfen
eas submit:list
```

## 📞 Support

Bei Problemen:
1. EAS Build Logs prüfen
2. App Store Connect Status prüfen
3. Apple Developer Portal prüfen

## 🎯 Nächste Schritte nach TestFlight

1. **Feedback sammeln** von Test-Nutzern
2. **Bugs beheben** basierend auf Feedback
3. **App Store Release** vorbereiten
4. **Marketing-Material** erstellen

---

**Viel Erfolg bei Ihrer TestFlight-Bereitstellung! 🍺**
