import { create } from 'zustand';
import type { Drink } from '../models/Drink';
import type { Consumption } from '../models/Consumption';
import type { UserProfile } from '../models/UserProfile';
import { DatabaseService } from '../services/DatabaseService';
import { NotificationService } from '../services/NotificationService';

type DbStatus = { isInitialized: boolean; tableCounts: Record<string, number> };

type AppStore = {
  // Master data
  users: UserProfile[];
  drinks: Drink[];

  // Profile view state
  selectedUserId: string | null;
  profileConsumptions: Consumption[];
  profileTotalSpent: number;

  // UI flags
  isHydrating: boolean;
  isProfileLoading: boolean;
  dbStatus: DbStatus | null;

  // Actions
  hydrate: () => Promise<void>;
  selectUser: (userId: string | null) => void;
  loadProfile: (userId: string) => Promise<void>;
  refreshAdminStatus: () => Promise<void>;

  purchaseDrink: (args: { userId: string; drinkId: string; quantity: number }) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  deleteDrink: (drinkId: string) => Promise<void>;
  deleteConsumption: (consumptionId: string) => Promise<void>;
  resetBalance: (userId: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
};

const db = DatabaseService.getInstance();

export const useAppStore = create<AppStore>((set, get) => ({
  users: [],
  drinks: [],

  selectedUserId: null,
  profileConsumptions: [],
  profileTotalSpent: 0,

  isHydrating: false,
  isProfileLoading: false,
  dbStatus: null,

  hydrate: async () => {
    if (get().isHydrating) return;
    set({ isHydrating: true });
    try {
      const [users, drinks] = await Promise.all([db.getAllUserProfiles(), db.getAllDrinks()]);
      set({
        users,
        drinks,
        selectedUserId: get().selectedUserId && users.some((u) => u.id === get().selectedUserId) ? get().selectedUserId : users[0]?.id ?? null,
      });
    } finally {
      set({ isHydrating: false });
    }
  },

  selectUser: (userId) => set({ selectedUserId: userId }),

  loadProfile: async (userId) => {
    set({ isProfileLoading: true });
    try {
      const consumptions = await db.getConsumptionsWithDrinkInfo(userId);
      const total = consumptions.reduce((sum, c) => sum + c.price, 0);
      set({ profileConsumptions: consumptions, profileTotalSpent: total, selectedUserId: userId });
    } finally {
      set({ isProfileLoading: false });
    }
  },

  refreshAdminStatus: async () => {
    const status = await db.getDatabaseStatus();
    set({ dbStatus: status });
  },

  purchaseDrink: async ({ userId, drinkId, quantity }) => {
    const result = await db.recordPurchase({ userId, drinkId, quantity });

    set({
      drinks: get().drinks.map((d) => (d.id === drinkId ? result.updatedDrink : d)),
      users: get().users.map((u) => (u.id === userId ? result.updatedUser : u)),
    });

    // Best-effort Notifications (darf den Kauf-Flow nicht blockieren)
    void NotificationService.notifyDrinkConsumption(result.updatedUser.name, result.updatedDrink.name, result.totalPrice).catch(() => {});
    if (result.updatedDrink.stock <= 5) {
      void NotificationService.notifyLowStock(result.updatedDrink.name, result.updatedDrink.stock).catch(() => {});
    }

    // If currently viewing that user's profile, reload it
    if (get().selectedUserId === userId) {
      await get().loadProfile(userId);
    }
  },

  deleteUser: async (userId) => {
    await db.deleteUser(userId);
    set({
      users: get().users.filter((u) => u.id !== userId),
      profileConsumptions: get().selectedUserId === userId ? [] : get().profileConsumptions,
      selectedUserId: get().selectedUserId === userId ? null : get().selectedUserId,
    });
    await get().hydrate();
  },

  deleteDrink: async (drinkId) => {
    await db.deleteDrink(drinkId);
    set({ drinks: get().drinks.filter((d) => d.id !== drinkId) });
    await get().hydrate();
  },

  deleteConsumption: async (consumptionId) => {
    await db.deleteConsumption(consumptionId);
    const id = get().selectedUserId;
    if (id) {
      await get().loadProfile(id);
    }
    await get().hydrate();
  },

  resetBalance: async (userId) => {
    const user = get().users.find((u) => u.id === userId);
    if (!user) return;
    const updatedUser: UserProfile = { ...user, balance: 0, monthlyCount: 0 };
    await db.saveUserProfile(updatedUser);
    await get().hydrate();
    if (get().selectedUserId === userId) {
      await get().loadProfile(userId);
    }
  },

  resetDemoData: async () => {
    await db.resetMockData();
    await get().hydrate();
    const id = get().selectedUserId;
    if (id) {
      await get().loadProfile(id);
    }
    await get().refreshAdminStatus();
  },
}));

