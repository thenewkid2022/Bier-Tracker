// Globale Mocks für native Module, die in Jest nicht verfügbar sind.
//
// Die Speicher-Backends liegen auf `globalThis`, damit sie `jest.resetModules()` überleben.
// Tests setzen Singletons (DatabaseService, TwintService) über resetModules zurück; die
// "persistierten" Daten müssen dabei erhalten bleiben – wie auf einem echten Gerät.

type KeyValueStore = Map<string, string>;
type GlobalWithStores = typeof globalThis & {
  __asyncStorageStore?: KeyValueStore;
  __secureStoreStore?: KeyValueStore;
};

const g = globalThis as GlobalWithStores;
g.__asyncStorageStore ??= new Map();
g.__secureStoreStore ??= new Map();

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = (globalThis as GlobalWithStores).__asyncStorageStore as KeyValueStore;
  const api = {
    getItem: jest.fn(async (key: string) => store.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: jest.fn(async (key: string) => {
      store.delete(key);
    }),
    clear: jest.fn(async () => {
      store.clear();
    }),
    getAllKeys: jest.fn(async () => [...store.keys()]),
    multiGet: jest.fn(async (keys: string[]) => keys.map((k) => [k, store.get(k) ?? null] as [string, string | null])),
    multiSet: jest.fn(async (pairs: [string, string][]) => {
      for (const [k, v] of pairs) store.set(k, v);
    }),
    multiRemove: jest.fn(async (keys: string[]) => {
      for (const k of keys) store.delete(k);
    }),
  };
  return { __esModule: true, default: api };
});

jest.mock('expo-secure-store', () => {
  const store = (globalThis as GlobalWithStores).__secureStoreStore as KeyValueStore;
  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
  };
});

// SQLite ist in Jest nicht verfügbar -> DatabaseService fällt kontrolliert auf AsyncStorage zurück.
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async () => {
    throw new Error('SQLite in Tests nicht verfügbar');
  }),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(async () => 'notification-id'),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  getExpoPushTokenAsync: jest.fn(async () => ({ data: 'ExponentPushToken[test]' })),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  AndroidImportance: { MAX: 5 },
}));

jest.mock('expo-device', () => ({ isDevice: false }));

beforeEach(() => {
  g.__asyncStorageStore?.clear();
  g.__secureStoreStore?.clear();
});

// Logs in Tests leise halten (Fehler bleiben sichtbar).
jest.spyOn(console, 'log').mockImplementation(() => undefined);
jest.spyOn(console, 'warn').mockImplementation(() => undefined);
