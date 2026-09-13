import { useCallback, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const ADMIN_PIN_KEY = 'admin_pin';
const DEFAULT_PIN = '1234';

/**
 * Lädt den Admin-PIN aus dem SecureStore (legt beim ersten Start einen Default an)
 * und kapselt die Authentifizierungs-Logik des Admin-Bereichs.
 */
export function useAdminPin() {
  const [adminPin, setAdminPin] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let stored = await SecureStore.getItemAsync(ADMIN_PIN_KEY);
        if (!stored) {
          await SecureStore.setItemAsync(ADMIN_PIN_KEY, DEFAULT_PIN);
          stored = DEFAULT_PIN;
        }
        if (!cancelled) setAdminPin(stored);
      } catch (error) {
        console.error('Fehler beim Laden des Admin-PIN:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const verifyPin = useCallback(
    (candidate: string): boolean => {
      const ok = adminPin !== null && candidate === adminPin;
      if (ok) setIsAuthenticated(true);
      return ok;
    },
    [adminPin]
  );

  const logout = useCallback(() => setIsAuthenticated(false), []);

  return { isAuthenticated, isPinReady: adminPin !== null, verifyPin, logout };
}
