// Hinweis (Windows-Entwicklung):
// - iOS-Builds/Deployment erfordern macOS + Xcode. Auf Windows zum Entwickeln
//   bitte Android-Emulator oder Web nutzen: `flutter run -d chrome`.
// - Vorbereitungen: Flutter SDK installieren, `flutter doctor` ausführen.
// - Diese App ist für iOS (iPhone/iPad) mit Cupertino-UI optimiert, läuft aber
//   auch auf Android/Web, um den Workflow auf Windows zu ermöglichen.

import 'package:flutter/cupertino.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'screens/home_cupertino.dart';
import 'services/notification_service.dart';
import 'services/db_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Firebase initialisieren
  await Firebase.initializeApp();
  
  // Firestore-Deprecation-Fixes
  FirebaseFirestore.instance.settings = const Settings(
    persistenceEnabled: true,
  );
  await FirebaseFirestore.instance.enablePersistentCacheIndexAutoCreation();
  
  // Locale/Intl für Web initialisieren (de_CH)
  Intl.defaultLocale = 'de_CH';
  await initializeDateFormatting('de_CH');
  
  // Datenbank initialisieren
  final dbService = DbService();
  await dbService.database;
  await NotificationService.initialize();
  
  runApp(const BierLoungeApp());
}

class BierLoungeApp extends StatelessWidget {
  const BierLoungeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const CupertinoApp(
      debugShowCheckedModeBanner: false,
      title: 'BierLounge Tracker',
      localizationsDelegates: [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: [
        Locale('de', 'CH'),
        Locale('de'),
        Locale('en'),
      ],
      theme: CupertinoThemeData(
        brightness: Brightness.light,
        // Dezenter, moderner Look: neutrale Hintergründe, klare Lesbarkeit
        primaryColor: CupertinoColors.activeBlue,
        primaryContrastingColor: CupertinoColors.activeGreen,
        barBackgroundColor: CupertinoColors.systemBackground,
        scaffoldBackgroundColor: CupertinoColors.systemGroupedBackground,
        textTheme: CupertinoTextThemeData(
          textStyle: TextStyle(color: CupertinoColors.label),
          navTitleTextStyle: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: CupertinoColors.label),
        ),
      ),
      home: CupertinoHomeScreen(),
    );
  }
}


