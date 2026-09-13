# 🍺 Getränke Tracker

Lokale Getränke- und Kassen-App für Vereine, WGs und Büros – entwickelt mit **React Native + Expo**.
Benutzer wählen sich aus, tippen ihr Getränk an, und die App führt Bestand, offene Beträge und Konsum-Historie.
Offene Beträge lassen sich per **TWINT-Zahlungsanfrage** (QR-Code / Deep Link) einfordern.

Alle Daten bleiben **lokal auf dem Gerät** (SQLite). Es gibt kein Backend und keine Konten.

---

## Inhalt

- [Features](#features)
- [Tech-Stack](#tech-stack)
- [Schnellstart](#schnellstart)
- [Entwicklungs-Workflow](#entwicklungs-workflow)
- [Projektstruktur](#projektstruktur)
- [Architektur](#architektur)
- [Datenmodell](#datenmodell)
- [TWINT-Integration](#twint-integration)
- [Benachrichtigungen](#benachrichtigungen)
- [Build & Release](#build--release)
- [Sicherheit](#sicherheit)
- [Roadmap](#roadmap)

---

## Features

| Bereich          | Funktionen                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| **Home**         | Benutzer auswählen, Getränk mit Menge (1–10) kaufen, Bestand und Saldo live sehen               |
| **Profil**       | Konsum-Historie mit Getränk, Datum, Betrag; Gesamtausgaben; Einzelkauf stornieren; Saldo nullen |
| **Admin**        | PIN-geschützt; Benutzer/Getränke anlegen & löschen; Datenbank-Status; Demo-Daten zurücksetzen   |
| **TWINT**        | Zahlungsanfrage pro Benutzer mit vorgeschlagenem Betrag, QR-Code, TWINT-App öffnen, Deep-Link-Rückkehr verbucht Zahlung |
| **Notifications**| Lokale Hinweise bei Kauf und bei niedrigem Bestand (≤ 5)                                       |
| **Persistenz**   | SQLite mit automatischer Migration alter AsyncStorage-Daten; AsyncStorage-Fallback (z. B. Web)  |

**Saldo-Modell:** Ein negativer Saldo bedeutet eine **offene Rechnung** (der Benutzer schuldet Geld).
Käufe senken den Saldo, TWINT-Zahlungen erhöhen ihn bis maximal 0.

---

## Tech-Stack

| Ebene           | Technologie                                                            |
| --------------- | ---------------------------------------------------------------------- |
| Runtime         | Expo SDK 53 · React Native 0.79 · React 19 · **New Architecture** aktiv |
| Navigation      | **Expo Router 5** (file-based, typed routes, Deep Linking)             |
| State           | **Zustand 5** (`src/state/appStore.ts`) mit `useShallow`-Selektoren    |
| Persistenz      | **expo-sqlite** (WAL, Foreign Keys, Transaktionen) · AsyncStorage-Fallback |
| Validierung     | **Zod** – Domain-Schemas sind die einzige Typ-Quelle (`src/domain/schemas.ts`) |
| Secrets         | **expo-secure-store** (Admin-PIN, TWINT-IBAN)                          |
| Notifications   | expo-notifications                                                     |
| Sprache         | TypeScript 5.8, `strict: true`, keine `any`                            |
| Qualität        | ESLint 9 (Flat Config, `eslint-config-expo`) · Prettier · Husky + lint-staged |
| Tests           | Jest (`jest-expo`) für Domain/Store/Services · Maestro-Flow für E2E   |
| CI              | GitHub Actions: Typecheck → Lint → Format → Test                       |
| Build/Release   | EAS Build & Submit (Profile: development, preview, production, testflight) |

---

## Schnellstart

### Voraussetzungen

- Node.js **22** (LTS) und npm
- Für Simulatoren: Xcode (iOS) bzw. Android Studio (Android)
- Ein Gerät mit **Expo Go** oder ein **Dev-Client-Build** (empfohlen, da SQLite/SecureStore/Notifications nativ sind)

### Installation & Start

```bash
git clone https://github.com/thenewkid2022/Bier-Tracker.git
cd Bier-Tracker
npm install --legacy-peer-deps
npm start
```

Danach im Terminal `i` (iOS-Simulator), `a` (Android-Emulator) oder QR-Code mit Expo Go / Dev-Client scannen.

> **Hinweis Expo Go:** Expo Go bringt die verwendeten nativen Module mit, aber Push-Notifications sind seit SDK 53 dort nicht mehr verfügbar. Für den vollen Funktionsumfang einen Dev-Client bauen: `eas build --profile development --platform ios|android`.

### Admin-Zugang

Der Admin-Bereich ist mit einem 4-stelligen PIN geschützt. Beim ersten Start wird `1234` im SecureStore hinterlegt.
Den PIN kann man derzeit nur durch Löschen der App-Daten zurücksetzen (siehe Roadmap).

---

## Entwicklungs-Workflow

| Befehl                  | Zweck                                                              |
| ----------------------- | ------------------------------------------------------------------ |
| `npm start`             | Metro-Dev-Server starten                                           |
| `npm run typecheck`     | TypeScript ohne Emit prüfen                                        |
| `npm run lint`          | ESLint (Expo-Regeln, Hooks, Prettier als Warnung)                  |
| `npm run lint:fix`      | ESLint mit Auto-Fix                                                |
| `npm run format`        | Prettier über das ganze Repo                                       |
| `npm run format:check`  | Prettier nur prüfen (CI)                                           |
| `npm test`              | Jest-Unit-Tests                                                    |
| `npm run test:watch`    | Jest im Watch-Modus                                                |
| `npm run test:coverage` | Jest mit Coverage-Report (`coverage/lcov-report/index.html`)       |
| `npm run check`         | Typecheck + Lint + Test in einem Schritt                           |

### Git-Hooks (Husky)

- **pre-commit:** `lint-staged` → ESLint `--fix --max-warnings=0` + Prettier auf gestagten Dateien
- **pre-push:** `npm run typecheck && npm test`

Die Hooks werden bei `npm install` über das `prepare`-Skript aktiviert.

### E2E mit Maestro

```bash
# Maestro installieren: https://maestro.mobile.dev/getting-started/installing-maestro
maestro test .maestro/smoke.yaml                                  # Android (Default-App-ID)
maestro test -e APP_ID=com.thenewkid2022.bierlounge-tracker .maestro/smoke.yaml   # iOS
```

Der Smoke-Flow prüft: App-Start mit Demo-Daten → Kauf-Flow → Profil-Tab → Admin-PIN-Gate.

---

## Projektstruktur

```
app/                          # Expo Router (Routen = Dateien)
├── _layout.tsx               # Root-Stack: Notifications init, TWINT-Deep-Link-Handling
└── (tabs)/
    ├── _layout.tsx           # Tab-Navigator (Home · Profil · Admin)
    ├── index.tsx             # → HomeScreen
    ├── profile.tsx           # → ProfileScreen
    └── admin.tsx             # → AdminScreen

src/
├── domain/
│   └── schemas.ts            # Zod-Schemas + abgeleitete Typen (UserProfile, Drink, Consumption, …)
├── state/
│   └── appStore.ts           # Zustand-Store: Stammdaten, Profil, Actions (purchase, addUser, …)
├── services/
│   ├── DatabaseService.ts    # SQLite/AsyncStorage-Persistenz, Migration, Transaktionen
│   ├── TwintService.ts       # TWINT-URLs, QR-Daten, Validierung, Deep-Link-Parsing
│   └── NotificationService.ts
├── screens/
│   ├── HomeScreen.tsx
│   ├── ProfileScreen.tsx
│   └── AdminScreen.tsx       # schlanker Orchestrator
├── features/admin/           # Admin-Bausteine
│   ├── useAdminPin.ts        # PIN aus SecureStore, Auth-State
│   ├── PinGate.tsx
│   ├── AdminHeader.tsx
│   ├── DatabaseStatusCard.tsx
│   ├── UserManagementSection.tsx
│   ├── DrinkManagementSection.tsx
│   ├── TwintSection.tsx
│   └── adminStyles.ts
├── components/
│   ├── DrinkIcon.tsx
│   ├── TwintPaymentRequest.tsx
│   └── TwintAdminConfig.tsx
├── models/                   # Kompatibilitäts-Re-Exports auf src/domain
├── utils/
│   ├── id.ts                 # generateId()
│   └── platformStyles.ts     # iOS/Android-Style-Unterschiede
├── theme.ts                  # Design-Tokens (Farben, Spacing, Radius, Schatten)
└── __tests__/                # Jest-Tests

.maestro/smoke.yaml           # E2E-Flow
.github/workflows/ci.yml      # CI-Pipeline
```

---

## Architektur

```
Screens / Features  ──►  useAppStore (Zustand)  ──►  DatabaseService (Singleton)  ──►  SQLite
        ▲                       │                            │
        │                       └── NotificationService      └── AsyncStorage (Fallback + Migration)
        │
   TwintService  ◄──  app/_layout.tsx (Deep Link `getraenke-tracker://payment-return`)
```

**Grundsätze**

- **Eine Typ-Quelle:** Alle Entitäten sind Zod-Schemas in `src/domain/schemas.ts`. Beim Laden aus SQLite/AsyncStorage werden Datensätze validiert; korrupte Einträge werden geloggt und verworfen statt die App zum Absturz zu bringen.
- **UI kennt keine Datenbank:** Screens rufen ausschließlich Store-Actions. Der Store spricht mit `DatabaseService` und hält den UI-State konsistent.
- **Atomare Käufe:** `DatabaseService.recordPurchase()` schreibt Benutzer, Getränk und Konsum in **einer** SQLite-Transaktion. Bei Fehlern bleibt nichts halb geschrieben.
- **Referentielle Integrität mit Rollback:** Beim Löschen eines Benutzers wird der Bestand der gekauften Getränke zurückgebucht; beim Löschen eines Getränks werden Saldo und Monatszähler der Käufer korrigiert; beim Stornieren eines Einzelkaufs beides.
- **Kein Zustand-Leak:** `DatabaseService` speichert und liefert Kopien. Aufrufer können den internen Zustand nicht durch Mutation beschädigen.
- **Zustand 5 korrekt genutzt:** Objekt-Selektoren sind mit `useShallow` gewrappt (sonst Endlos-Rerender in v5).

---

## Datenmodell

```ts
UserProfile  { id, name, email?, balance, monthlyCount }     // balance < 0 = offene Rechnung
Drink        { id, name, price, stock, iconKey }
Consumption  { id, userId, drinkId, timestamp, price, quantity? }   // price = Gesamtpreis der Position
```

**SQLite-Schema** (`getraenke.db`): Tabellen `users`, `drinks`, `consumptions` mit Foreign Keys (`ON DELETE CASCADE`) und Indizes auf `consumptions.userId` / `consumptions.drinkId`. WAL-Modus aktiv.

**Migration:** Ist SQLite leer und liegen alte AsyncStorage-Daten (`users`, `drinks`, `consumptions`) vor, werden sie einmalig übernommen. Alte ISO-Zeitstempel werden dabei zu Unix-Millisekunden konvertiert.

**Demo-Daten:** Beim allerersten Start (Flag `demo_seeded_v1`) werden 3 Benutzer, 6 Getränke und 3 Käufe angelegt. Über Admin → „Alle Daten zurücksetzen" lassen sie sich jederzeit wiederherstellen.

---

## TWINT-Integration

Die App generiert TWINT-Zahlungsanfragen nach dem Schema

```
twint://pay?amount=12.50&message=Vereinskasse%20-%20Offene%20Rechnung&iban=CH9300762011623852957
```

**Ablauf**

1. Admin hinterlegt unter „TWINT-Konfiguration" IBAN (SecureStore), Telefonnummer, Standard-Nachricht und Anzeigename.
2. Bei einem Benutzer mit offenem Betrag „TWINT Zahlung" antippen → Betrag wird vorgeschlagen, Nachricht optional.
3. QR-Code anzeigen, teilen, oder TWINT-App direkt öffnen (mit Web-Fallback).
4. Rückkehr per Deep Link `getraenke-tracker://payment-return?userId=…&amount=…&status=completed` wird in `app/_layout.tsx` verarbeitet und verbucht die Zahlung auf dem Benutzer (Saldo steigt, maximal bis 0).

**Validierung:** Betrag 0.01–999 999.99 CHF · Nachricht ≤ 140 Zeichen · Schweizer IBAN (`CH` + 19 Stellen) · Telefonnummer `+41…`/`0…` mit 9 Ziffern.

> Die Deep-Link-Rückkehr setzt voraus, dass die zahlende Person den Link auslöst (TWINT selbst ruft keine App-Links zurück). Praktisch dient sie als „Zahlung bestätigen"-Weg; alternativ kann der Admin den Saldo im Profil manuell nullen.

---

## Benachrichtigungen

Lokale Notifications via `expo-notifications`, initialisiert in `app/_layout.tsx`:

- **Kauf:** „Getränk gekauft! 🍺 – Anna hat Bier für CHF 7.00 gekauft."
- **Niedriger Bestand:** „Niedriger Bestand! ⚠️ – Bier hat nur noch 4 Stück auf Lager." (ab ≤ 5 Stück)

Notifications sind Best-Effort und blockieren den Kauf-Flow nicht. Auf Android wird der Channel `default` mit hoher Priorität angelegt.

---

## Build & Release

Konfiguration in `app.json` (Bundle-IDs, Scheme `getraenke-tracker`, Plugins) und `eas.json` (Profile).

```bash
# Dev-Client (empfohlen für Entwicklung)
eas build --profile development --platform ios
eas build --profile development --platform android

# Interne Vorschau (APK / Ad-hoc)
npm run build:android-preview

# Store-Builds
npm run build:production          # iOS
npm run build:android             # Android App Bundle
npm run build:testflight

# Einreichen
npm run submit:testflight
npm run submit:production
npm run submit:android

# Build-Nummer hochzählen (iOS buildNumber + Android versionCode, plattformunabhängig)
npm run bump:build
```

**Ziel-Geräte:** iPhone und iPad (`supportsTablet: true`). iPhone läuft im Portrait-Modus; auf dem iPad
erlaubt Expo alle Ausrichtungen (Voraussetzung für iPad-Multitasking), das Layout passt sich über
`useWindowDimensions`/Breakpoints an. Für den App-Store-Eintrag werden daher Screenshots für
iPhone 6,7"/6,5" **und** iPad 13" benötigt.

**iOS-Berechtigungen:** Die App fragt nur nach Benachrichtigungen. `LSApplicationQueriesSchemes`
enthält `twint`, damit `Linking.canOpenURL('twint://')` unter iOS zuverlässig funktioniert.

Weitere Details: `TESTFLIGHT_SETUP.md`, `GOOGLE_PLAY_CHECKLIST.md`, `google-play-setup.md`, `ANDROID_SETUP.md`.

---

## Sicherheit

- Keine Netzwerk-Kommunikation, keine Analytics, keine externen Dienste – alle Daten bleiben auf dem Gerät.
- **Admin-PIN** und **TWINT-IBAN** liegen im Keychain/Keystore (`expo-secure-store`), nicht im Klartext-Storage.
- Eingaben werden per Zod validiert, bevor sie persistiert werden.
- Datenschutz: siehe `privacy-policy.md`.

---

## Roadmap

- [ ] Admin-PIN in der App änderbar machen
- [ ] Getränke bearbeiten (Preis/Bestand) statt nur anlegen/löschen
- [ ] Export (CSV/JSON) der Konsum-Historie
- [ ] `HomeScreen`/`ProfileScreen` vollständig auf Theme-Tokens umstellen; `TwintPaymentRequest` / `TwintAdminConfig` aufteilen
- [ ] Component-Tests mit `@testing-library/react-native`
- [ ] Upgrade auf Expo SDK 54+ sobald alle Abhängigkeiten stabil sind

---

## Lizenz

MIT – siehe `LICENSE`.
