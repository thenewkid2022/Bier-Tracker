// Optionaler Firebase-Sync (deaktiviert, bis Firebase konfiguriert ist).
// Hinweise zur Einrichtung:
// 1) Firebase-Projekt erstellen und App (Android/iOS) registrieren.
// 2) google-services.json (Android) / GoogleService-Info.plist (iOS) einbinden.
// 3) firebase_core initialisieren und hier aktivieren.
import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_core/firebase_core.dart';
import '../models/user_profile.dart';
import '../models/drink.dart';
import '../models/consumption.dart';
import 'hive_service.dart';

class SyncService {
  static bool _enabled = false; // erst aktivieren, wenn Firebase eingerichtet ist

  static Future<void> tryInitFirebase() async {
    try {
      await Firebase.initializeApp();
      _enabled = true;
    } catch (_) {
      _enabled = false;
    }
  }

  static Future<void> syncUp() async {
    if (!_enabled) return;
    final store = FirebaseFirestore.instance;
    final users = HiveService.usersBox.values.toList();
    final drinks = HiveService.drinksBox.values.toList();
    final cons = HiveService.consumptionsBox.values.toList();

    final batch = store.batch();
    for (final u in users) {
      final ref = store.collection('users').doc(u.id);
      batch.set(ref, {
        'name': u.name,
        'email': u.email,
        'balance': u.balance,
        'monthlyCount': u.monthlyCount,
      }, SetOptions(merge: true));
    }
    for (final d in drinks) {
      final ref = store.collection('drinks').doc(d.id);
      batch.set(ref, {
        'name': d.name,
        'price': d.price,
        'stock': d.stock,
        'iconKey': d.iconKey,
      }, SetOptions(merge: true));
    }
    for (final c in cons) {
      final ref = store.collection('consumptions').doc(c.id);
      batch.set(ref, {
        'userId': c.userId,
        'drinkId': c.drinkId,
        'timestamp': c.timestamp,
        'price': c.price,
      }, SetOptions(merge: true));
    }
    await batch.commit();
  }
}


