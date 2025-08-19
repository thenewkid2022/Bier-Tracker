# 🚀 TestFlight Setup für BierLounge Tracker

## 📱 iOS Device Testing über TestFlight

### Voraussetzungen
- Apple Developer Account
- iOS Device mit iOS 13.0 oder höher
- TestFlight App installiert
- Device UDID in Apple Developer Portal registriert

### 1. Device UDID registrieren
1. **Gehe zu [developer.apple.com](https://developer.apple.com)**
2. **Certificates, Identifiers & Profiles > Devices**
3. **+ (neues Device hinzufügen)**
4. **Device Name**: Dein Device-Name
5. **Device ID**: Deine Device UDID
6. **Device Type**: iPhone oder iPad

### 2. UDID finden
**Option A: Über iTunes/Finder**
- Verbinde Device mit Computer
- Öffne iTunes/Finder
- Klicke auf Device
- Seriennummer = UDID

**Option B: Über Device**
- Einstellungen > Allgemein > Info
- Seriennummer = UDID

### 3. Provisioning Profile aktualisieren
1. **Profiles > +**
2. **iOS App Development**
3. **App ID**: `com.thenewkid2022.bierlounge-tracker`
4. **Zertifikate**: Wähle dein Development-Zertifikat
5. **Devices**: Wähle dein registriertes Device
6. **Profil herunterladen und installieren**

### 4. TestFlight Build
Nach erfolgreichem Codemagic Build:
1. **App wird automatisch zu TestFlight hochgeladen**
2. **Gehe zu [App Store Connect](https://appstoreconnect.apple.com)**
3. **My Apps > BierLounge Tracker > TestFlight**
4. **Build genehmigen** (falls erforderlich)
5. **Externe Tester hinzufügen** (deine E-Mail)

### 5. TestFlight App installieren
1. **TestFlight App öffnen**
2. **Einladung akzeptieren**
3. **BierLounge Tracker installieren**
4. **App testen**

### 6. Feedback geben
- **TestFlight App > BierLounge Tracker > Feedback**
- **Screenshots, Videos, Beschreibungen**
- **Crash-Reports automatisch gesammelt**

## 🔧 Codemagic Konfiguration

### Automatischer TestFlight-Upload
- **`submit_to_testflight: true`** aktiviert
- **Nur bei Release-Workflows** (release/* branches, tags)
- **Automatische IPA-Erstellung** und Upload

### Code-Signing
- **Distribution Type**: `app_store`
- **Bundle Identifier**: `com.thenewkid2022.bierlounge-tracker`
- **Provisioning Profile**: App Store Distribution

## 📋 Checkliste

- [ ] Device UDID in Apple Developer Portal registriert
- [ ] Provisioning Profile aktualisiert
- [ ] Codemagic Build erfolgreich
- [ ] App in TestFlight verfügbar
- [ ] TestFlight App installiert
- [ ] App funktioniert auf Device

## 🆘 Häufige Probleme

**Device nicht erkannt**
- UDID korrekt registriert?
- Provisioning Profile aktualisiert?
- Device neu gestartet?

**App installiert sich nicht**
- iOS-Version kompatibel (≥13.0)?
- Genügend Speicherplatz?
- Internetverbindung aktiv?

**TestFlight Build nicht verfügbar**
- Build erfolgreich abgeschlossen?
- App Store Connect Build genehmigt?
- Externe Tester hinzugefügt?

---

**Viel Erfolg beim Testen! 🍺📱**
