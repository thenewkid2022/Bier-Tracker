import 'package:sqflite/sqflite.dart';
import 'package:path_provider/path_provider.dart';  // Für iOS-Pfad
import 'dart:io';

import '../models/user_profile.dart';
import '../models/drink.dart';
import '../models/consumption.dart';

class DbService {
  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final documentsDirectory = await getApplicationDocumentsDirectory();
    final path = '${documentsDirectory.path}${Platform.pathSeparator}bierlounge.db';
    return await openDatabase(path, version: 1, onCreate: _createDb);
  }

  Future<void> _createDb(Database db, int version) async {
    await db.execute('''
      CREATE TABLE user_profiles (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        balance REAL DEFAULT 0.0,
        monthlyCount INTEGER DEFAULT 0
      )
    ''');
    await db.execute('''
      CREATE TABLE drinks (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        iconKey TEXT NOT NULL
      )
    ''');
    await db.execute('''
      CREATE TABLE consumptions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        drinkId TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        price REAL NOT NULL
      )
    ''');
  }

  // UserProfile-Methoden
  Future<void> saveUserProfile(UserProfile user) async {
    final db = await database;
    await db.insert('user_profiles', user.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<UserProfile?> getUserProfile(String id) async {
    final db = await database;
    final maps = await db.query('user_profiles', where: 'id = ?', whereArgs: [id]);
    if (maps.isNotEmpty) {
      return UserProfile.fromMap(maps.first);
    }
    return null;
  }

  Future<List<UserProfile>> getAllUserProfiles() async {
    final db = await database;
    final maps = await db.query('user_profiles');
    return maps.map((map) => UserProfile.fromMap(map)).toList();
  }

  // Drink-Methoden
  Future<void> saveDrink(Drink drink) async {
    final db = await database;
    await db.insert('drinks', drink.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<Drink?> getDrink(String id) async {
    final db = await database;
    final maps = await db.query('drinks', where: 'id = ?', whereArgs: [id]);
    if (maps.isNotEmpty) {
      return Drink.fromMap(maps.first);
    }
    return null;
  }

  Future<List<Drink>> getAllDrinks() async {
    final db = await database;
    final maps = await db.query('drinks');
    return maps.map((map) => Drink.fromMap(map)).toList();
  }

  // Consumption-Methoden
  Future<void> addConsumption(Consumption consumption) async {
    final db = await database;
    await db.insert('consumptions', consumption.toMap());
  }

  Future<List<Consumption>> getConsumptionsByUser(String userId) async {
    final db = await database;
    final maps = await db.query('consumptions', where: 'userId = ?', whereArgs: [userId]);
    return maps.map((map) => Consumption.fromMap(map)).toList();
  }

  Future<List<Consumption>> getAllConsumptions() async {
    final db = await database;
    final maps = await db.query('consumptions');
    return maps.map((map) => Consumption.fromMap(map)).toList();
  }

  // Zusätzliche Methode: Lösche DB für Tests
  Future<void> deleteDatabase() async {
    final documentsDirectory = await getApplicationDocumentsDirectory();
    final path = '${documentsDirectory.path}${Platform.pathSeparator}bierlounge.db';
    await databaseFactory.deleteDatabase(path);
    _database = null;
  }
}
