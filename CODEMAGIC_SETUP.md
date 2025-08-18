# 🚀 Codemagic CI/CD Setup für BierLounge Tracker

Diese Anleitung führt dich durch die komplette Einrichtung von Codemagic für dein BierLounge Tracker Flutter-Projekt.

## 📋 Voraussetzungen

- ✅ GitHub Repository mit dem Projekt
- ✅ Apple Developer Account
- ✅ Codemagic Account (kostenlos verfügbar)
- ✅ Flutter-Projekt mit korrektem Bundle Identifier

## 🔧 Schritt 1: Codemagic Account erstellen

1. **Gehe zu [codemagic.io](https://codemagic.io)**
2. **Klicke auf "Get Started"**
3. **Wähle "Sign up with GitHub"**
4. **Autorisiere Codemagic für dein GitHub-Konto**

## 🔗 Schritt 2: Projekt verbinden

1. **Klicke auf "Add app"**
2. **Wähle dein Repository: `thenewkid2022/Bier-Tracker`**
3. **Wähle "Flutter" als Projekttyp**
4. **Klicke auf "Finish"**

## ⚙️ Schritt 3: Code-Signing konfigurieren

### 3.1 Apple Developer Zertifikate

**Du brauchst folgende Dateien von deinem Apple Developer Account:**

- **Distribution Certificate** (`.p12` Datei)
- **Provisioning Profile** (`.mobileprovision` Datei)
- **App Store Connect API Key** (`.p8` Datei)

#### Distribution Certificate erstellen:
1. **Gehe zu [developer.apple.com](https://developer.apple.com)**
2. **Certificates, Identifiers & Profiles**
3. **Certificates > +**
4. **iOS Distribution (App Store and Ad Hoc)**
5. **Erstelle CSR und lade es hoch**
6. **Lade das Zertifikat herunter und konvertiere es zu .p12**

#### Provisioning Profile erstellen:
1. **Profiles > +**
2. **iOS App Development** oder **iOS App Store**
3. **Wähle deine App ID: `com.thenewkid2022.bierlounge-tracker`**
4. **Wähle dein Zertifikat**
5. **Lade das Profil herunter**

#### App Store Connect API Key:
1. **Users and Access > Keys**
2. **+ (neuer Schlüssel)**
3. **App Manager Rolle**
4. **Lade die .p8 Datei herunter**

### 3.2 Codemagic Code-Signing konfigurieren

1. **Gehe zu deiner App in Codemagic**
2. **Settings > Code signing**
3. **iOS code signing**

#### Zertifikate hochladen:
- **Certificate (.p12)**: Lade deine .p12 Datei hoch
- **Certificate password**: Gib das Passwort ein (falls gesetzt)
- **Provisioning profile**: Lade dein .mobileprovision Profil hoch

#### Umgebungsvariablen setzen:
```bash
# App Store Connect API
APP_STORE_CONNECT_API_KEY=deine_api_key
APP_STORE_CONNECT_KEY_ID=deine_key_id  
APP_STORE_CONNECT_ISSUER_ID=deine_issuer_id

# Code-Signing
DEVELOPMENT_TEAM=deine_team_id
PROVISIONING_PROFILE_NAME=dein_profil_name

# GitHub (optional)
GITHUB_TOKEN=dein_github_token
```

## 🏗️ Schritt 4: Build konfigurieren

### 4.1 Workflow auswählen

Die `codemagic.yaml` enthält bereits zwei Workflows:

1. **iOS Build & Test** (`ios-workflow`)
   - Wird bei jedem Push auf `master`/`main` ausgeführt
   - Erstellt Debug-Builds für Tests

2. **iOS Release Build** (`ios-release-workflow`)
   - Wird bei Release-Branches und Tags ausgeführt
   - Erstellt Release-Builds für App Store

### 4.2 Build-Trigger konfigurieren

**Automatische Builds:**
- **Master/Main Branch**: Bei jedem Push
- **Release Branches**: Bei `release/*` Branches
- **Tags**: Bei Version-Tags (z.B. `v1.0.0`)

**Manuelle Builds:**
- Über Codemagic Dashboard
- Mit spezifischen Branch/Commit

## 🚀 Schritt 5: Ersten Build starten

1. **Gehe zu deiner App in Codemagic**
2. **Klicke auf "Start new build"**
3. **Wähle den Branch: `master`**
4. **Klicke auf "Start build"**

## 📱 Schritt 6: Build überwachen

### 6.1 Build-Logs

- **Real-time Logs**: Verfolge den Build-Fortschritt
- **Build-Steps**: Jeder Schritt wird detailliert angezeigt
- **Fehler-Behandlung**: Detaillierte Fehlermeldungen

### 6.2 Build-Status

- **Running**: Build läuft
- **Success**: Build erfolgreich
- **Failed**: Build fehlgeschlagen
- **Canceled**: Build abgebrochen

## 📦 Schritt 7: Artefakte verwalten

### 7.1 Automatische Artefakte

- **IPA-Dateien**: iOS-App-Pakete
- **Build-Logs**: Detaillierte Build-Protokolle
- **Flutter-Logs**: Flutter-spezifische Logs

### 7.2 Artefakte herunterladen

- **Direkt aus Codemagic**: Download-Button
- **Über API**: Automatisierte Downloads
- **Über Webhooks**: Automatische Weiterleitung

## 🔄 Schritt 8: Automatisierung einrichten

### 8.1 GitHub Integration

**Automatische Builds bei:**
- Push auf master/main
- Pull Request
- Tags
- Releases

### 8.2 Notifications

**E-Mail-Benachrichtigungen:**
- Build-Start
- Build-Erfolg
- Build-Fehler

**Slack/Teams Integration:**
- Webhook-URLs konfigurieren
- Automatische Status-Updates

## 🚀 Schritt 9: Deployment konfigurieren

### 9.1 App Store Connect

**Automatischer Upload:**
- IPA-Dateien werden hochgeladen
- TestFlight-Upload (optional)
- App Store-Upload (optional)

### 9.2 GitHub Releases

**Automatische Releases:**
- Bei Tags erstellt
- Mit Build-Artefakten
- Mit Release-Notes

## 🛠️ Schritt 10: Fehlerbehebung

### 10.1 Häufige Probleme

**Code-Signing-Fehler:**
- Zertifikate überprüfen
- Provisioning Profile prüfen
- Team ID korrekt setzen

**Build-Fehler:**
- Flutter-Version prüfen
- Dependencies aktualisieren
- iOS-Version anpassen

**Deployment-Fehler:**
- App Store Connect API prüfen
- Berechtigungen überprüfen
- Bundle Identifier prüfen

### 10.2 Support

**Codemagic Support:**
- [Documentation](https://docs.codemagic.io/)
- [Community Forum](https://codemagic.io/community/)
- [Email Support](mailto:support@codemagic.io)

## 📊 Schritt 11: Monitoring & Analytics

### 11.1 Build-Statistiken

- **Build-Zeit**: Durchschnittliche Build-Dauer
- **Erfolgsrate**: Prozent erfolgreicher Builds
- **Fehler-Analyse**: Häufige Fehlerquellen

### 11.2 Performance-Optimierung

- **Cache-Nutzung**: Build-Cache-Effizienz
- **Parallelisierung**: Gleichzeitige Builds
- **Resource-Nutzung**: CPU/Memory-Verbrauch

## 🎯 Nächste Schritte

Nach der erfolgreichen Einrichtung:

1. **Teste den ersten Build**
2. **Konfiguriere Notifications**
3. **Setze up Deployment**
4. **Optimiere Build-Zeit**
5. **Erstelle Release-Workflows**

## 📚 Weitere Ressourcen

- [Codemagic Flutter Documentation](https://docs.codemagic.io/flutter/)
- [iOS Code Signing Guide](https://docs.codemagic.io/code-signing/ios-code-signing/)
- [Flutter CI/CD Best Practices](https://docs.codemagic.io/flutter/flutter-ci-cd/)
- [App Store Connect API](https://developer.apple.com/documentation/appstoreconnectapi/)

## 🆘 Hilfe benötigt?

Falls du bei der Einrichtung Hilfe brauchst:

1. **Überprüfe die Build-Logs**
2. **Konsultiere die Codemagic-Dokumentation**
3. **Stelle Fragen im Community-Forum**
4. **Kontaktiere den Codemagic-Support**

---

**Viel Erfolg bei der Einrichtung deines CI/CD-Pipelines! 🚀**

Dein BierLounge Tracker wird bald automatisch gebaut und deployed! 🍺📱
