import 'package:hive/hive.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter/foundation.dart';
import '../models/user_profile.dart';
import '../models/drink.dart';
import '../models/consumption.dart';

class HiveService {
  static const String usersBoxName = 'users_box';
  static const String drinksBoxName = 'drinks_box';
  static const String consumptionsBoxName = 'consumptions_box';

  static Future<void> init() async {
    if (!Hive.isAdapterRegistered(1)) Hive.registerAdapter(UserProfileAdapter());
    if (!Hive.isAdapterRegistered(2)) Hive.registerAdapter(DrinkAdapter());
    if (!Hive.isAdapterRegistered(3)) Hive.registerAdapter(ConsumptionAdapter());
    await Future.wait([
      Hive.openBox<UserProfile>(usersBoxName),
      Hive.openBox<Drink>(drinksBoxName),
      Hive.openBox<Consumption>(consumptionsBoxName),
    ]);
  }

  static Box<UserProfile> get usersBox => Hive.box<UserProfile>(usersBoxName);
  static Box<Drink> get drinksBox => Hive.box<Drink>(drinksBoxName);
  static Box<Consumption> get consumptionsBox => Hive.box<Consumption>(consumptionsBoxName);

  // Listenable-Methoden für ValueListenableBuilder
  static ValueListenable<Box<UserProfile>> get usersBoxListenable => usersBox.listenable();
  static ValueListenable<Box<Drink>> get drinksBoxListenable => drinksBox.listenable();
  static ValueListenable<Box<Consumption>> get consumptionsBoxListenable => consumptionsBox.listenable();
}


