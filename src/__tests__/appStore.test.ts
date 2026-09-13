import AsyncStorage from '@react-native-async-storage/async-storage';
import type { useAppStore as UseAppStore, ValidationError as ValidationErrorType } from '../state/appStore';

jest.mock('../services/NotificationService', () => ({
  NotificationService: {
    notifyDrinkConsumption: jest.fn(async () => undefined),
    notifyLowStock: jest.fn(async () => undefined),
  },
}));

type StoreModule = { useAppStore: typeof UseAppStore; ValidationError: typeof ValidationErrorType };
type NotificationModule = typeof import('../services/NotificationService');

async function freshStore(): Promise<StoreModule> {
  jest.resetModules();
  await AsyncStorage.clear();
  // Demo-Seeding unterdrücken, damit Tests mit leerer DB starten.
  await AsyncStorage.setItem('demo_seeded_v1', '1');
  return require('../state/appStore') as StoreModule;
}

function notificationMock(): NotificationModule['NotificationService'] {
  return (require('../services/NotificationService') as NotificationModule).NotificationService;
}

describe('appStore', () => {
  it('hydrate lädt Stammdaten und wählt den ersten Benutzer vor', async () => {
    const { useAppStore } = await freshStore();
    const store = useAppStore.getState();

    await store.addUser({ name: 'Anna', email: '' });
    await store.addUser({ name: 'Tom', email: 'tom@example.com' });
    useAppStore.setState({ selectedUserId: null });

    await store.hydrate();

    const state = useAppStore.getState();
    expect(state.users.map((u) => u.name)).toEqual(['Anna', 'Tom']);
    expect(state.selectedUserId).toBe(state.users[0]?.id);
    expect(state.isHydrating).toBe(false);
  });

  it('addUser wirft ValidationError mit lesbarer Meldung', async () => {
    const { useAppStore, ValidationError } = await freshStore();
    const store = useAppStore.getState();

    await expect(store.addUser({ name: '   ', email: '' })).rejects.toBeInstanceOf(ValidationError);
    await expect(store.addUser({ name: 'X', email: 'keine-mail' })).rejects.toThrow('Ungültige E-Mail-Adresse.');
    expect(useAppStore.getState().users).toHaveLength(0);
  });

  it('addDrink parst Formular-Strings und lehnt ungültige Werte ab', async () => {
    const { useAppStore } = await freshStore();
    const store = useAppStore.getState();

    const drink = await store.addDrink({ name: 'Cola', price: '2.50', stock: '12', iconKey: 'soda' });
    expect(drink).toMatchObject({ name: 'Cola', price: 2.5, stock: 12, iconKey: 'soda' });
    expect(useAppStore.getState().drinks).toHaveLength(1);

    await expect(store.addDrink({ name: 'Cola', price: '0', stock: '1', iconKey: 'soda' })).rejects.toThrow(
      'Preis muss größer als 0 sein.'
    );
  });

  it('purchaseDrink aktualisiert Benutzer, Getränk und Profil und triggert Notifications', async () => {
    const { useAppStore } = await freshStore();
    const NotificationService = notificationMock();
    const store = useAppStore.getState();

    const user = await store.addUser({ name: 'Anna', email: '' });
    const drink = await store.addDrink({ name: 'Bier', price: '3.50', stock: '6', iconKey: 'beer' });
    await store.loadProfile(user.id);

    await store.purchaseDrink({ userId: user.id, drinkId: drink.id, quantity: 2 });

    const state = useAppStore.getState();
    expect(state.users[0]).toMatchObject({ balance: -7, monthlyCount: 2 });
    expect(state.drinks[0]?.stock).toBe(4);
    expect(state.profileConsumptions).toHaveLength(1);
    expect(state.profileTotalSpent).toBe(7);

    expect(NotificationService.notifyDrinkConsumption).toHaveBeenCalledWith('Anna', 'Bier', 7);
    // Bestand 4 <= 5 -> Low-Stock-Hinweis
    expect(NotificationService.notifyLowStock).toHaveBeenCalledWith('Bier', 4);
  });

  it('resetBalance setzt Saldo und Monatszähler zurück', async () => {
    const { useAppStore } = await freshStore();
    const store = useAppStore.getState();

    const user = await store.addUser({ name: 'Anna', email: '' });
    const drink = await store.addDrink({ name: 'Bier', price: '3.50', stock: '10', iconKey: 'beer' });
    await store.purchaseDrink({ userId: user.id, drinkId: drink.id, quantity: 1 });

    await store.resetBalance(user.id);

    expect(useAppStore.getState().users[0]).toMatchObject({ balance: 0, monthlyCount: 0 });
  });

  it('deleteUser räumt Auswahl und Profil auf', async () => {
    const { useAppStore } = await freshStore();
    const store = useAppStore.getState();

    const user = await store.addUser({ name: 'Anna', email: '' });
    await store.loadProfile(user.id);
    await store.deleteUser(user.id);

    const state = useAppStore.getState();
    expect(state.users).toHaveLength(0);
    expect(state.selectedUserId).toBeNull();
    expect(state.profileConsumptions).toEqual([]);
  });
});
