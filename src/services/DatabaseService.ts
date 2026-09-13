import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import {
  ConsumptionSchema,
  DrinkSchema,
  UserProfileSchema,
  parseArraySafe,
  type Consumption,
  type Drink,
  type UserProfile,
} from '../domain/schemas';
import { generateId } from '../utils/id';

const STORAGE_KEYS = {
  users: 'users',
  drinks: 'drinks',
  consumptions: 'consumptions',
  seeded: 'demo_seeded_v1',
} as const;

export class DatabaseService {
  private static instance: DatabaseService;
  private isInitialized = false;
  private readonly ready: Promise<void>;
  private sqliteDb: SQLite.SQLiteDatabase | null = null;
  private useSQLite = false;
  private didMigrateFromAsyncStorage = false;

  // In-Memory-Daten fÃ¼r bessere Performance
  private users: UserProfile[] = [];
  private drinks: Drink[] = [];
  private consumptions: Consumption[] = [];

  private constructor() {
    this.ready = this.initializeDatabase();
  }

  // Singleton-Pattern fÃ¼r Datenkonsistenz
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private async initializeDatabase() {
    try {
      await this.initializeSQLite();
      await this.loadFromStorage();
      if (this.didMigrateFromAsyncStorage && this.useSQLite) {
        // Persistiere migrierte Daten direkt in SQLite.
        await this.saveToStorage();
      }
      await this.seedDemoDataIfNeeded();
      this.isInitialized = true;
      console.log(this.useSQLite ? 'SQLite-Datenbank erfolgreich initialisiert' : 'AsyncStorage-Datenbank erfolgreich initialisiert');
    } catch (error) {
      console.error('Fehler beim Initialisieren der Datenbank:', error);
      this.isInitialized = true;
    }
  }

  private async initializeSQLite(): Promise<void> {
    try {
      this.sqliteDb = await SQLite.openDatabaseAsync('getraenke.db');
      this.useSQLite = true;
      await this.sqliteDb.execAsync(`
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;

        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          email TEXT,
          balance REAL NOT NULL,
          monthlyCount INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS drinks (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          stock INTEGER NOT NULL,
          iconKey TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS consumptions (
          id TEXT PRIMARY KEY NOT NULL,
          userId TEXT NOT NULL,
          drinkId TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          price REAL NOT NULL,
          quantity INTEGER,
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (drinkId) REFERENCES drinks(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_consumptions_userId ON consumptions(userId);
        CREATE INDEX IF NOT EXISTS idx_consumptions_drinkId ON consumptions(drinkId);
      `);
    } catch (error) {
      // Fallback auf AsyncStorage, falls SQLite auf dem jeweiligen Laufzeit-Target nicht verfÃ¼gbar ist.
      console.error('SQLite initialisieren fehlgeschlagen, Fallback auf AsyncStorage:', error);
      this.sqliteDb = null;
      this.useSQLite = false;
    }
  }

  private async loadFromStorage() {
    try {
      this.didMigrateFromAsyncStorage = false;

      if (this.useSQLite && this.sqliteDb) {
        const [usersCountRow, drinksCountRow, consumptionsCountRow] = await Promise.all([
          this.sqliteDb.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM users'),
          this.sqliteDb.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM drinks'),
          this.sqliteDb.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM consumptions'),
        ]);

        const usersCount = Number(usersCountRow?.count ?? 0);
        const drinksCount = Number(drinksCountRow?.count ?? 0);
        const consumptionsCount = Number(consumptionsCountRow?.count ?? 0);

        const sqliteEmpty = usersCount === 0 && drinksCount === 0 && consumptionsCount === 0;

        if (!sqliteEmpty) {
          const [users, drinks, consumptions] = await Promise.all([
            this.sqliteDb.getAllAsync<{
              id: string;
              name: string;
              email: string | null;
              balance: number;
              monthlyCount: number;
            }>('SELECT id, name, email, balance, monthlyCount FROM users'),
            this.sqliteDb.getAllAsync<{
              id: string;
              name: string;
              price: number;
              stock: number;
              iconKey: string;
            }>('SELECT id, name, price, stock, iconKey FROM drinks'),
            this.sqliteDb.getAllAsync<{
              id: string;
              userId: string;
              drinkId: string;
              timestamp: number;
              price: number;
              quantity: number | null;
            }>('SELECT id, userId, drinkId, timestamp, price, quantity FROM consumptions'),
          ]);

          this.users = parseArraySafe(
            UserProfileSchema,
            users.map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email ?? undefined,
              balance: Number(u.balance),
              monthlyCount: Number(u.monthlyCount),
            })),
            'users'
          );

          this.drinks = parseArraySafe(
            DrinkSchema,
            drinks.map((d) => ({
              id: d.id,
              name: d.name,
              price: Number(d.price),
              stock: Number(d.stock),
              iconKey: d.iconKey,
            })),
            'drinks'
          );

          this.consumptions = parseArraySafe(
            ConsumptionSchema,
            consumptions.map((c) => ({
              id: c.id,
              userId: c.userId,
              drinkId: c.drinkId,
              timestamp: Number(c.timestamp),
              price: Number(c.price),
              quantity: c.quantity == null ? undefined : Number(c.quantity),
            })),
            'consumptions'
          );

          return;
        }
      }

      // SQLite ist leer oder nicht verfÃ¼gbar: lade von AsyncStorage (Migration).
      const [storedUsers, storedDrinks, storedConsumptions] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.users),
        AsyncStorage.getItem(STORAGE_KEYS.drinks),
        AsyncStorage.getItem(STORAGE_KEYS.consumptions),
      ]);

      const hasAnyAsyncData = Boolean(storedUsers || storedDrinks || storedConsumptions);
      if (hasAnyAsyncData && this.useSQLite) {
        this.didMigrateFromAsyncStorage = true;
      }

      if (storedUsers) {
        this.users = parseArraySafe(UserProfileSchema, JSON.parse(storedUsers), 'users');
      }
      if (storedDrinks) {
        this.drinks = parseArraySafe(DrinkSchema, JSON.parse(storedDrinks), 'drinks');
      }
      if (storedConsumptions) {
        // Ã„ltere Versionen haben ISO-Strings statt Unix-Millisekunden gespeichert.
        const raw: unknown = JSON.parse(storedConsumptions);
        const normalized = Array.isArray(raw)
          ? raw.map((entry: unknown) => {
              if (entry && typeof entry === 'object' && 'timestamp' in entry) {
                const ts = (entry as { timestamp: unknown }).timestamp;
                return { ...entry, timestamp: typeof ts === 'string' ? Date.parse(ts) : ts };
              }
              return entry;
            })
          : [];
        this.consumptions = parseArraySafe(ConsumptionSchema, normalized, 'consumptions');
      }
    } catch (error) {
      console.error('Fehler beim Laden der gespeicherten Daten:', error);
    }
  }

  private async saveToStorage() {
    try {
      if (this.useSQLite && this.sqliteDb) {
        const db = this.sqliteDb;
        await db.withTransactionAsync(async () => {
          await db.execAsync(`
            DELETE FROM consumptions;
            DELETE FROM users;
            DELETE FROM drinks;
          `);

          for (const u of this.users) {
            await db.runAsync(
              'INSERT INTO users (id, name, email, balance, monthlyCount) VALUES (?, ?, ?, ?, ?)',
              [u.id, u.name, u.email ?? null, u.balance, u.monthlyCount]
            );
          }

          for (const d of this.drinks) {
            await db.runAsync(
              'INSERT INTO drinks (id, name, price, stock, iconKey) VALUES (?, ?, ?, ?, ?)',
              [d.id, d.name, d.price, d.stock, d.iconKey]
            );
          }

          for (const c of this.consumptions) {
            await db.runAsync(
              'INSERT INTO consumptions (id, userId, drinkId, timestamp, price, quantity) VALUES (?, ?, ?, ?, ?, ?)',
              [c.id, c.userId, c.drinkId, c.timestamp, c.price, c.quantity ?? null]
            );
          }
        });
        return;
      }

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.users, JSON.stringify(this.users)),
        AsyncStorage.setItem(STORAGE_KEYS.drinks, JSON.stringify(this.drinks)),
        AsyncStorage.setItem(STORAGE_KEYS.consumptions, JSON.stringify(this.consumptions)),
      ]);
    } catch (error) {
      console.error('Fehler beim Speichern der Daten:', error);
    }
  }

  private async ensureReady(): Promise<void> {
    await this.ready;
  }

  private async seedDemoDataIfNeeded(): Promise<void> {
    const seeded = await AsyncStorage.getItem(STORAGE_KEYS.seeded);
    if (seeded) {
      return;
    }
    if (this.users.length === 0 && this.drinks.length === 0 && this.consumptions.length === 0) {
      await this.insertDemoData();
    }
    await AsyncStorage.setItem(STORAGE_KEYS.seeded, '1');
  }

  private async insertDemoData() {
    const demoUsers = [
      {
        id: generateId(),
        name: 'Max Mustermann',
        email: 'max@example.com',
        balance: 0,
        monthlyCount: 12,
      },
      {
        id: generateId(),
        name: 'Anna Schmidt',
        email: 'anna@example.com',
        balance: -18.75,
        monthlyCount: 8,
      },
      {
        id: generateId(),
        name: 'Tom Weber',
        email: 'tom@example.com',
        balance: -32.0,
        monthlyCount: 15,
      }
    ];

    const demoDrinks = [
      {
        id: generateId(),
        name: 'Bier',
        price: 3.50,
        stock: 50,
        iconKey: 'beer',
      },
      {
        id: generateId(),
        name: 'Wein',
        price: 4.50,
        stock: 30,
        iconKey: 'wine',
      },
      {
        id: generateId(),
        name: 'Cocktail',
        price: 6.00,
        stock: 20,
        iconKey: 'cocktail',
      },
      {
        id: generateId(),
        name: 'Softdrink',
        price: 2.50,
        stock: 40,
        iconKey: 'soda',
      },
      {
        id: generateId(),
        name: 'Kaffee',
        price: 2.00,
        stock: 60,
        iconKey: 'coffee',
      },
      {
        id: generateId(),
        name: 'Tee',
        price: 1.50,
        stock: 45,
        iconKey: 'water',
      }
    ];

    // Demo-Benutzer einfÃ¼gen
    for (const user of demoUsers) {
      await this.saveUserProfile(user);
    }

    // Demo-GetrÃ¤nke einfÃ¼gen
    for (const drink of demoDrinks) {
      await this.saveDrink(drink);
    }

    // Demo-Konsum einfÃ¼gen
    const demoConsumptions = [
      {
        id: generateId(),
        userId: demoUsers[0].id,
        drinkId: demoDrinks[0].id,
        timestamp: Date.now() - 86400000,
        price: 3.50,
      },
      {
        id: generateId(),
        userId: demoUsers[1].id,
        drinkId: demoDrinks[2].id,
        timestamp: Date.now() - 43200000,
        price: 6.00,
      },
      {
        id: generateId(),
        userId: demoUsers[0].id,
        drinkId: demoDrinks[1].id,
        timestamp: Date.now() - 21600000,
        price: 4.50,
      }
    ];

    for (const consumption of demoConsumptions) {
      await this.addConsumption(consumption);
    }

    console.log('Demo-Daten erfolgreich eingefÃ¼gt');
  }

  // Benutzer-Methoden
  async saveUserProfile(user: UserProfile): Promise<void> {
    await this.ensureReady();
    const existingIndex = this.users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      this.users[existingIndex] = user;
    } else {
      this.users.push(user);
    }
    if (this.useSQLite && this.sqliteDb) {
      await this.sqliteDb.runAsync(
        'INSERT OR REPLACE INTO users (id, name, email, balance, monthlyCount) VALUES (?, ?, ?, ?, ?)',
        [user.id, user.name, user.email ?? null, user.balance, user.monthlyCount]
      );
      return;
    }

    await this.saveToStorage();
  }

  async getUserProfile(id: string): Promise<UserProfile | null> {
    await this.ensureReady();
    return this.users.find(u => u.id === id) || null;
  }

  async getAllUserProfiles(): Promise<UserProfile[]> {
    await this.ensureReady();
    return [...this.users];
  }

  async deleteUser(userId: string): Promise<void> {
    await this.ensureReady();
    // Beim LÃ¶schen eines Users mÃ¼ssen wir den Bestand der zugehÃ¶rigen Konsum-EintrÃ¤ge zurÃ¼ckrollen.
    const consumptionsToDelete = this.consumptions.filter((c) => c.userId === userId);
    const affectedDrinkIds = new Set<string>();
    for (const c of consumptionsToDelete) {
      const drink = this.drinks.find((d) => d.id === c.drinkId);
      if (drink) {
        drink.stock += c.quantity ?? 1;
        affectedDrinkIds.add(drink.id);
      }
    }

    this.users = this.users.filter((u) => u.id !== userId);
    this.consumptions = this.consumptions.filter((c) => c.userId !== userId);

    if (this.useSQLite && this.sqliteDb) {
      // Persistiere Bestandskorrekturen auf betroffenen GetrÃ¤nken.
      for (const drinkId of affectedDrinkIds) {
        const drink = this.drinks.find((d) => d.id === drinkId);
        if (!drink) continue;
        await this.sqliteDb.runAsync('UPDATE drinks SET stock = ? WHERE id = ?', [drink.stock, drinkId]);
      }

      await this.sqliteDb.runAsync('DELETE FROM consumptions WHERE userId = ?', [userId]);
      await this.sqliteDb.runAsync('DELETE FROM users WHERE id = ?', [userId]);
      return;
    }

    await this.saveToStorage();
  }

  // GetrÃ¤nke-Methoden
  async saveDrink(drink: Drink): Promise<void> {
    await this.ensureReady();
    const existingIndex = this.drinks.findIndex(d => d.id === drink.id);
    if (existingIndex >= 0) {
      this.drinks[existingIndex] = drink;
    } else {
      this.drinks.push(drink);
    }
    if (this.useSQLite && this.sqliteDb) {
      await this.sqliteDb.runAsync(
        'INSERT OR REPLACE INTO drinks (id, name, price, stock, iconKey) VALUES (?, ?, ?, ?, ?)',
        [drink.id, drink.name, drink.price, drink.stock, drink.iconKey]
      );
      return;
    }

    await this.saveToStorage();
  }

  async getDrink(id: string): Promise<Drink | null> {
    await this.ensureReady();
    return this.drinks.find(d => d.id === id) || null;
  }

  async getAllDrinks(): Promise<Drink[]> {
    await this.ensureReady();
    return [...this.drinks];
  }

  async deleteDrink(drinkId: string): Promise<void> {
    await this.ensureReady();
    // Beim LÃ¶schen eines GetrÃ¤nks mÃ¼ssen wir die Balance/Monatsstatistik der betroffenen Users zurÃ¼ckrollen.
    const consumptionsToDelete = this.consumptions.filter((c) => c.drinkId === drinkId);
    const affectedUserIds = new Set<string>();
    for (const c of consumptionsToDelete) {
      const user = this.users.find((u) => u.id === c.userId);
      if (user) {
        user.balance += c.price;
        user.monthlyCount = Math.max(0, user.monthlyCount - (c.quantity ?? 1));
        affectedUserIds.add(user.id);
      }
    }

    this.drinks = this.drinks.filter((d) => d.id !== drinkId);
    this.consumptions = this.consumptions.filter((c) => c.drinkId !== drinkId);

    if (this.useSQLite && this.sqliteDb) {
      // Persistiere Balance-/Monatskorrekturen.
      for (const uid of affectedUserIds) {
        const user = this.users.find((u) => u.id === uid);
        if (!user) continue;
        await this.sqliteDb.runAsync(
          'UPDATE users SET balance = ?, monthlyCount = ? WHERE id = ?',
          [user.balance, user.monthlyCount, uid]
        );
      }

      await this.sqliteDb.runAsync('DELETE FROM consumptions WHERE drinkId = ?', [drinkId]);
      await this.sqliteDb.runAsync('DELETE FROM drinks WHERE id = ?', [drinkId]);
      return;
    }

    await this.saveToStorage();
  }

  async updateDrinkStock(drinkId: string, newStock: number): Promise<void> {
    await this.ensureReady();
    const drink = this.drinks.find(d => d.id === drinkId);
    if (drink) {
      drink.stock = newStock;
      if (this.useSQLite && this.sqliteDb) {
        await this.sqliteDb.runAsync('UPDATE drinks SET stock = ? WHERE id = ?', [drink.stock, drinkId]);
        return;
      }

      await this.saveToStorage();
    }
  }

  // Konsum-Methoden
  async addConsumption(consumption: Consumption): Promise<void> {
    await this.ensureReady();
    const existingIndex = this.consumptions.findIndex(c => c.id === consumption.id);
    if (existingIndex >= 0) {
      this.consumptions[existingIndex] = consumption;
    } else {
      this.consumptions.push(consumption);
    }

    if (this.useSQLite && this.sqliteDb) {
      await this.sqliteDb.runAsync(
        'INSERT OR REPLACE INTO consumptions (id, userId, drinkId, timestamp, price, quantity) VALUES (?, ?, ?, ?, ?, ?)',
        [
          consumption.id,
          consumption.userId,
          consumption.drinkId,
          consumption.timestamp,
          consumption.price,
          consumption.quantity ?? null,
        ]
      );
      return;
    }

    await this.saveToStorage();
  }

  async getConsumptionsByUser(userId: string): Promise<Consumption[]> {
    await this.ensureReady();
    return this.consumptions.filter(c => c.userId === userId);
  }

  async getConsumptionsWithDrinkInfo(userId: string): Promise<Consumption[]> {
    await this.ensureReady();
    return this.consumptions
      .filter(c => c.userId === userId)
      .map(c => ({
        ...c,
        drinkName: this.drinks.find(d => d.id === c.drinkId)?.name || 'Unbekanntes GetrÃ¤nk',
        iconKey: this.drinks.find(d => d.id === c.drinkId)?.iconKey || 'beer'
      }));
  }

  async deleteConsumption(consumptionId: string): Promise<void> {
    await this.ensureReady();
    const consumption = this.consumptions.find(c => c.id === consumptionId);
    if (!consumption) {
      return;
    }
    const user = this.users.find(u => u.id === consumption.userId);
    if (user) {
      user.balance += consumption.price;
      user.monthlyCount = Math.max(0, user.monthlyCount - (consumption.quantity ?? 1));
    }
    const drink = this.drinks.find(d => d.id === consumption.drinkId);
    if (drink) {
      drink.stock += consumption.quantity ?? 1;
    }
    this.consumptions = this.consumptions.filter(c => c.id !== consumptionId);

    if (this.useSQLite && this.sqliteDb) {
      if (user) {
        await this.sqliteDb.runAsync(
          'UPDATE users SET balance = ?, monthlyCount = ? WHERE id = ?',
          [user.balance, user.monthlyCount, user.id]
        );
      }
      if (drink) {
        await this.sqliteDb.runAsync('UPDATE drinks SET stock = ? WHERE id = ?', [drink.stock, drink.id]);
      }
      await this.sqliteDb.runAsync('DELETE FROM consumptions WHERE id = ?', [consumptionId]);
      return;
    }

    await this.saveToStorage();
  }

  // Mock-Daten zurÃ¼cksetzen
  async resetMockData(): Promise<void> {
    try {
      await this.clearAllData();
      await this.insertDemoData();
      await AsyncStorage.setItem(STORAGE_KEYS.seeded, '1');
      console.log('Demo-Daten erfolgreich zurÃ¼ckgesetzt');
    } catch (error) {
      console.error('Fehler beim ZurÃ¼cksetzen der Demo-Daten:', error);
      throw error;
    }
  }

  // Alle Daten lÃ¶schen
  async clearAllData(): Promise<void> {
    await this.ensureReady();
    this.users = [];
    this.drinks = [];
    this.consumptions = [];
    if (this.useSQLite && this.sqliteDb) {
      await this.sqliteDb.execAsync(`
        DELETE FROM consumptions;
        DELETE FROM users;
        DELETE FROM drinks;
      `);
      return;
    }

    await this.saveToStorage();
  }

  // Daten exportieren (fÃ¼r Persistierung)
  async exportData(): Promise<Record<string, unknown>> {
    try {
      await this.ensureReady();
      const users = await this.getAllUserProfiles();
      const drinks = await this.getAllDrinks();
      const consumptions = await this.getAllConsumptions();
      
      return {
        users,
        drinks,
        consumptions,
        exportDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Fehler beim Exportieren der Daten:', error);
      throw error;
    }
  }

  // Alle Konsum-Daten abrufen
  private async getAllConsumptions(): Promise<Consumption[]> {
    await this.ensureReady();
    return [...this.consumptions];
  }

  // Datenbank-Status prÃ¼fen
  async getDatabaseStatus(): Promise<{ isInitialized: boolean; tableCounts: Record<string, number> }> {
    try {
      await this.ensureReady();
      const userCount = await this.getUserCount();
      const drinkCount = await this.getDrinkCount();
      const consumptionCount = await this.getConsumptionCount();

      return {
        isInitialized: this.isInitialized,
        tableCounts: {
          users: userCount,
          drinks: drinkCount,
          consumptions: consumptionCount
        }
      };
    } catch (error) {
      console.error('Fehler beim Abrufen des Datenbank-Status:', error);
      throw error;
    }
  }

  private async getUserCount(): Promise<number> {
    return this.users.length;
  }

  private async getDrinkCount(): Promise<number> {
    return this.drinks.length;
  }

  private async getConsumptionCount(): Promise<number> {
    return this.consumptions.length;
  }

  async applyPayment(userId: string, amount: number): Promise<void> {
    await this.ensureReady();
    const user = this.users.find((entry) => entry.id === userId);
    if (!user) {
      return;
    }
    const updatedBalance = user.balance + Math.abs(amount);
    user.balance = updatedBalance > 0 ? 0 : updatedBalance;

    if (this.useSQLite && this.sqliteDb) {
      await this.sqliteDb.runAsync('UPDATE users SET balance = ? WHERE id = ?', [user.balance, userId]);
      return;
    }

    await this.saveToStorage();
  }

  async recordPurchase(args: { userId: string; drinkId: string; quantity: number }): Promise<{
    updatedUser: UserProfile;
    updatedDrink: Drink;
    finalQuantity: number;
    totalPrice: number;
  }> {
    await this.ensureReady();

    const user = this.users.find((u) => u.id === args.userId);
    const drink = this.drinks.find((d) => d.id === args.drinkId);
    if (!user || !drink) {
      throw new Error('User oder Drink nicht gefunden');
    }
    if (drink.stock <= 0) {
      throw new Error('Ausverkauft');
    }

    const maxQuantity = Math.min(drink.stock, 10);
    const finalQuantity = Math.max(1, Math.min(args.quantity, maxQuantity));
    const totalPrice = drink.price * finalQuantity;

    // In-Memory anpassen (Quelle der Wahrheit fÃ¼r UI-Render)
    drink.stock -= finalQuantity;
    user.balance -= totalPrice; // negative = offene Rechnung -> wird negativer
    user.monthlyCount += finalQuantity;

    const consumption: Consumption = {
      id: generateId(),
      userId: user.id,
      drinkId: drink.id,
      timestamp: Date.now(),
      price: totalPrice,
      quantity: finalQuantity,
    };

    this.consumptions.push(consumption);

    if (this.useSQLite && this.sqliteDb) {
      await this.sqliteDb.withTransactionAsync(async () => {
        await this.sqliteDb!.runAsync(
          'INSERT OR REPLACE INTO users (id, name, email, balance, monthlyCount) VALUES (?, ?, ?, ?, ?)',
          [user.id, user.name, user.email ?? null, user.balance, user.monthlyCount]
        );
        await this.sqliteDb!.runAsync(
          'INSERT OR REPLACE INTO drinks (id, name, price, stock, iconKey) VALUES (?, ?, ?, ?, ?)',
          [drink.id, drink.name, drink.price, drink.stock, drink.iconKey]
        );
        await this.sqliteDb!.runAsync(
          'INSERT OR REPLACE INTO consumptions (id, userId, drinkId, timestamp, price, quantity) VALUES (?, ?, ?, ?, ?, ?)',
          [consumption.id, consumption.userId, consumption.drinkId, consumption.timestamp, consumption.price, consumption.quantity ?? null]
        );
      });
    } else {
      await this.saveToStorage();
    }

    return {
      updatedUser: { ...user },
      updatedDrink: { ...drink },
      finalQuantity,
      totalPrice,
    };
  }
}
