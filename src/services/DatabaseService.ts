import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage-basierte Datenbank für Expo Go
export class DatabaseService {
  private static instance: DatabaseService;
  private isInitialized = false;

  // In-Memory-Daten für bessere Performance
  private users: any[] = [];
  private drinks: any[] = [];
  private consumptions: any[] = [];

  private constructor() {
    this.initializeDatabase();
  }

  // Singleton-Pattern für Datenkonsistenz
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private async initializeDatabase() {
    try {
      // Versuche gespeicherte Daten zu laden
      await this.loadFromStorage();
      
      this.isInitialized = true;
      console.log('AsyncStorage-Datenbank erfolgreich initialisiert');
    } catch (error) {
      console.error('Fehler beim Initialisieren der Datenbank:', error);
      this.isInitialized = true;
    }
  }

  private async loadFromStorage() {
    try {
      const [storedUsers, storedDrinks, storedConsumptions] = await Promise.all([
        AsyncStorage.getItem('users'),
        AsyncStorage.getItem('drinks'),
        AsyncStorage.getItem('consumptions')
      ]);

      if (storedUsers) this.users = JSON.parse(storedUsers);
      if (storedDrinks) this.drinks = JSON.parse(storedDrinks);
      if (storedConsumptions) this.consumptions = JSON.parse(storedConsumptions);
    } catch (error) {
      console.error('Fehler beim Laden der gespeicherten Daten:', error);
    }
  }

  private async saveToStorage() {
    try {
      await Promise.all([
        AsyncStorage.setItem('users', JSON.stringify(this.users)),
        AsyncStorage.setItem('drinks', JSON.stringify(this.drinks)),
        AsyncStorage.setItem('consumptions', JSON.stringify(this.consumptions))
      ]);
    } catch (error) {
      console.error('Fehler beim Speichern der Daten:', error);
    }
  }

  private createTables(): Promise<void> {
    return new Promise((resolve, reject) => {
      // AsyncStorage hat keine direkte SQL-Funktionalität, daher keine Tabellen erstellung
      // Hier könnte man eine einfache In-Memory-Struktur verwenden,
      // aber für eine echte Datenbank-Lösung wäre SQLite notwendig.
      // Daher wird diese Funktion hier entfernt oder ersetzt.
      resolve();
    });
  }



  private getUserCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      resolve(this.users.length);
    });
  }

  private getDrinkCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      resolve(this.drinks.length);
    });
  }

  private async insertDemoData() {
    const demoUsers = [
      {
        id: this.generateId(),
        name: 'Max Mustermann',
        email: 'max@example.com',
        balance: 25.50,
        monthlyCount: 12,
      },
      {
        id: this.generateId(),
        name: 'Anna Schmidt',
        email: 'anna@example.com',
        balance: 18.75,
        monthlyCount: 8,
      },
      {
        id: this.generateId(),
        name: 'Tom Weber',
        email: 'tom@example.com',
        balance: 32.00,
        monthlyCount: 15,
      }
    ];

    const demoDrinks = [
      {
        id: this.generateId(),
        name: 'Bier',
        price: 3.50,
        stock: 50,
        iconKey: 'beer',
      },
      {
        id: this.generateId(),
        name: 'Wein',
        price: 4.50,
        stock: 30,
        iconKey: 'wine',
      },
      {
        id: this.generateId(),
        name: 'Cocktail',
        price: 6.00,
        stock: 20,
        iconKey: 'cocktail',
      },
      {
        id: this.generateId(),
        name: 'Softdrink',
        price: 2.50,
        stock: 40,
        iconKey: 'soda',
      },
      {
        id: this.generateId(),
        name: 'Kaffee',
        price: 2.00,
        stock: 60,
        iconKey: 'coffee',
      },
      {
        id: this.generateId(),
        name: 'Tee',
        price: 1.50,
        stock: 45,
        iconKey: 'water',
      }
    ];

    // Demo-Benutzer einfügen
    for (const user of demoUsers) {
      await this.saveUserProfile(user);
    }

    // Demo-Getränke einfügen
    for (const drink of demoDrinks) {
      await this.saveDrink(drink);
    }

    // Demo-Konsum einfügen
    const demoConsumptions = [
      {
        id: this.generateId(),
        userId: demoUsers[0].id,
        drinkId: demoDrinks[0].id,
        timestamp: Date.now() - 86400000,
        price: 3.50,
      },
      {
        id: this.generateId(),
        userId: demoUsers[1].id,
        drinkId: demoDrinks[2].id,
        timestamp: Date.now() - 43200000,
        price: 6.00,
      },
      {
        id: this.generateId(),
        userId: demoUsers[0].id,
        drinkId: demoDrinks[1].id,
        timestamp: Date.now() - 21600000,
        price: 4.50,
      }
    ];

    for (const consumption of demoConsumptions) {
      await this.addConsumption(consumption);
    }

    console.log('Demo-Daten erfolgreich eingefügt');
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Benutzer-Methoden
  async saveUserProfile(user: any): Promise<void> {
    const existingIndex = this.users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      this.users[existingIndex] = user;
    } else {
      this.users.push(user);
    }
    await this.saveToStorage();
  }

  async getUserProfile(id: string): Promise<any | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async getAllUserProfiles(): Promise<any[]> {
    return [...this.users];
  }

  async deleteUser(userId: string): Promise<void> {
    this.users = this.users.filter(u => u.id !== userId);
    await this.saveToStorage();
  }

  // Getränke-Methoden
  async saveDrink(drink: any): Promise<void> {
    const existingIndex = this.drinks.findIndex(d => d.id === drink.id);
    if (existingIndex >= 0) {
      this.drinks[existingIndex] = drink;
    } else {
      this.drinks.push(drink);
    }
    await this.saveToStorage();
  }

  async getDrink(id: string): Promise<any | null> {
    return this.drinks.find(d => d.id === id) || null;
  }

  async getAllDrinks(): Promise<any[]> {
    return [...this.drinks];
  }

  async deleteDrink(drinkId: string): Promise<void> {
    this.drinks = this.drinks.filter(d => d.id !== drinkId);
    await this.saveToStorage();
  }

  async updateDrinkStock(drinkId: string, newStock: number): Promise<void> {
    const drink = this.drinks.find(d => d.id === drinkId);
    if (drink) {
      drink.stock = newStock;
      await this.saveToStorage();
    }
  }

  // Konsum-Methoden
  async addConsumption(consumption: any): Promise<void> {
    const existingIndex = this.consumptions.findIndex(c => c.id === consumption.id);
    if (existingIndex >= 0) {
      this.consumptions[existingIndex] = consumption;
    } else {
      this.consumptions.push(consumption);
    }
    await this.saveToStorage();
  }

  async getConsumptionsByUser(userId: string): Promise<any[]> {
    return this.consumptions.filter(c => c.userId === userId);
  }

  async getConsumptionsWithDrinkInfo(userId: string): Promise<any[]> {
    return this.consumptions
      .filter(c => c.userId === userId)
      .map(c => ({
        ...c,
        drinkName: this.drinks.find(d => d.id === c.drinkId)?.name || 'Unbekanntes Getränk',
        iconKey: this.drinks.find(d => d.id === c.drinkId)?.iconKey || 'beer'
      }));
  }

  async deleteConsumption(consumptionId: string): Promise<void> {
    this.consumptions = this.consumptions.filter(c => c.id !== consumptionId);
    await this.saveToStorage();
  }

  // Mock-Daten zurücksetzen
  async resetMockData(): Promise<void> {
    try {
      await this.clearAllData();
      await this.insertDemoData();
      console.log('Demo-Daten erfolgreich zurückgesetzt');
    } catch (error) {
      console.error('Fehler beim Zurücksetzen der Demo-Daten:', error);
      throw error;
    }
  }

  // Alle Daten löschen
  async clearAllData(): Promise<void> {
    this.users = [];
    this.drinks = [];
    this.consumptions = [];
    await this.saveToStorage();
  }

  // Daten exportieren (für Persistierung)
  async exportData(): Promise<any> {
    try {
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
  private async getAllConsumptions(): Promise<any[]> {
    return [...this.consumptions];
  }

  // Datenbank-Status prüfen
  async getDatabaseStatus(): Promise<{ isInitialized: boolean; tableCounts: any }> {
    try {
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

  private async getConsumptionCount(): Promise<number> {
    return new Promise((resolve, reject) => {
      resolve(this.consumptions.length);
    });
  }
}
