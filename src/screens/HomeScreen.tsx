import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useShallow } from 'zustand/react/shallow';
import { DrinkIcon } from '../components/DrinkIcon';
import { Avatar, Badge, Card, EmptyState, IconButton, Screen, SectionHeader, UserChip } from '../components/ui';
import { useAppStore } from '../state/appStore';
import {
  MAX_CONTENT_WIDTH,
  colors,
  formatChf,
  gridColumnsForWidth,
  radius,
  shadow,
  spacing,
  typography,
} from '../theme';
import type { Drink } from '../domain/schemas';

const LOW_STOCK = 5;
const GRID_GAP = spacing.md;
const TOAST_DURATION_MS = 2200;

type Toast = { title: string; detail: string };

export const HomeScreen: React.FC = () => {
  const { users, drinks, selectedUserId, hydrate, selectUser, purchaseDrink, isHydrating } = useAppStore(
    useShallow((s) => ({
      users: s.users,
      drinks: s.drinks,
      selectedUserId: s.selectedUserId,
      hydrate: s.hydrate,
      selectUser: s.selectUser,
      purchaseDrink: s.purchaseDrink,
      isHydrating: s.isHydrating,
    }))
  );
  const selectedUser = selectedUserId ? (users.find((u) => u.id === selectedUserId) ?? null) : null;

  const { width } = useWindowDimensions();
  const columns = gridColumnsForWidth(width);
  // Verfügbare Breite = Fenster minus Screen-Padding, begrenzt auf die Maximalbreite.
  const horizontalPadding = width >= 600 ? spacing.xxl : spacing.lg;
  const contentWidth = Math.min(width - horizontalPadding * 2, MAX_CONTENT_WIDTH);
  const cardWidth = Math.floor((contentWidth - GRID_GAP * (columns - 1)) / columns);

  /** ID des Getränks, dessen Buchung gerade läuft (verhindert Doppel-Tipps). */
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    hydrate().catch((error) => console.error('Fehler beim Hydraten der Daten:', error));
  }, [hydrate]);

  const handleTap = async (drink: Drink) => {
    if (purchasingId) return;
    if (!selectedUser) {
      Alert.alert('Kein Benutzer gewählt', 'Bitte wähle zuerst oben einen Benutzer aus.');
      return;
    }
    if (drink.stock <= 0) {
      Alert.alert('Ausverkauft', 'Dieses Getränk ist leider nicht mehr verfügbar.');
      return;
    }

    const newBalance = selectedUser.balance - drink.price;
    setPurchasingId(drink.id);
    try {
      // Ein Tipp = genau ein Getränk.
      await purchaseDrink({ userId: selectedUser.id, drinkId: drink.id, quantity: 1 });
      setToast({
        title: `1× ${drink.name} für ${selectedUser.name} gebucht`,
        detail:
          newBalance < 0 ? `Offener Betrag: ${formatChf(Math.abs(newBalance))}` : `Guthaben: ${formatChf(newBalance)}`,
      });
    } catch (error) {
      console.error('Fehler beim Kaufen des Getränks:', error);
      Alert.alert('Fehler', 'Beim Kaufen des Getränks ist ein Fehler aufgetreten.');
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <View style={styles.root}>
      <Screen>
        {/* Benutzer-Auswahl */}
        <SectionHeader
          title="Wer trinkt?"
          subtitle={users.length === 0 ? undefined : 'Benutzer antippen zum Wechseln'}
        />
        {users.length === 0 ? (
          <EmptyState
            icon="person-add"
            title="Noch keine Benutzer"
            message="Lege im Admin-Bereich den ersten Benutzer an, um Getränke zu verbuchen."
          />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.chipRow, { paddingHorizontal: horizontalPadding }]}
            style={[styles.chipScroll, { marginHorizontal: -horizontalPadding }]}
          >
            {users.map((user) => (
              <UserChip
                key={user.id}
                name={user.name}
                balance={user.balance}
                selected={selectedUser?.id === user.id}
                onPress={() => selectUser(user.id)}
              />
            ))}
          </ScrollView>
        )}

        {/* Hero: aktueller Benutzer */}
        {selectedUser && (
          <Card tone="primary" style={styles.hero}>
            <View style={styles.heroRow}>
              <Avatar name={selectedUser.name} size={52} inverted />
              <View style={styles.heroTexts}>
                <Text style={styles.heroLabel} numberOfLines={1}>
                  {selectedUser.balance < 0 ? 'Offener Betrag' : 'Guthaben'}
                </Text>
                <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                  {formatChf(Math.abs(selectedUser.balance))}
                </Text>
              </View>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{selectedUser.monthlyCount}</Text>
                <Text style={styles.heroStatLabel}>diesen Monat</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Getränke */}
        <View style={styles.drinksSection}>
          <SectionHeader
            title="Getränke"
            subtitle={selectedUser ? `Ein Tipp bucht 1 Getränk für ${selectedUser.name}` : undefined}
            action={
              <IconButton
                icon="refresh"
                tone="primary"
                accessibilityLabel="Daten aktualisieren"
                onPress={() => void hydrate()}
                disabled={isHydrating}
              />
            }
          />

          {drinks.length === 0 ? (
            <EmptyState
              icon="sports-bar"
              title="Keine Getränke angelegt"
              message="Füge im Admin-Bereich Getränke mit Preis und Bestand hinzu."
            />
          ) : (
            <View style={styles.grid}>
              {drinks.map((drink) => {
                const soldOut = drink.stock <= 0;
                const low = !soldOut && drink.stock <= LOW_STOCK;
                const busy = purchasingId === drink.id;
                return (
                  <Pressable
                    key={drink.id}
                    onPress={() => void handleTap(drink)}
                    disabled={soldOut || !selectedUser || purchasingId !== null}
                    accessibilityRole="button"
                    accessibilityLabel={`${drink.name}, ${formatChf(drink.price)}, 1 Stück buchen`}
                    style={({ pressed }) => [
                      styles.drinkCard,
                      { width: cardWidth },
                      pressed && styles.drinkCardPressed,
                      (soldOut || !selectedUser) && styles.drinkCardDisabled,
                    ]}
                  >
                    <View style={styles.drinkTop}>
                      <DrinkIcon iconKey={drink.iconKey} size={26} boxed />
                      {busy && (
                        <View style={styles.checkBubble}>
                          <MaterialIcons name="check" size={16} color={colors.textOnPrimary} />
                        </View>
                      )}
                    </View>
                    <Text style={styles.drinkName} numberOfLines={2}>
                      {drink.name}
                    </Text>
                    <Text style={styles.drinkPrice}>{formatChf(drink.price)}</Text>
                    <View style={styles.drinkFooter}>
                      <Badge
                        label={soldOut ? 'Ausverkauft' : `${drink.stock} verfügbar`}
                        tone={soldOut ? 'danger' : low ? 'warning' : 'neutral'}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </Screen>

      <PurchaseToast toast={toast} onHidden={() => setToast(null)} />
    </View>
  );
};

/** Kurze, nicht blockierende Bestätigung am unteren Rand (ersetzt den Erfolgs-Alert). */
const PurchaseToast: React.FC<{ toast: Toast | null; onHidden: () => void }> = ({ toast, onHidden }) => {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 16, duration: 180, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onHidden();
    });
  }, [opacity, translateY, onHidden]);

  useEffect(() => {
    if (!toast) return;
    if (hideTimer.current) clearTimeout(hideTimer.current);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 6 }),
    ]).start();
    hideTimer.current = setTimeout(hide, TOAST_DURATION_MS);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [toast, opacity, translateY, hide]);

  if (!toast) return null;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.toastWrap, { paddingBottom: insets.bottom + spacing.md, opacity, transform: [{ translateY }] }]}
    >
      <Pressable onPress={hide} style={styles.toast} accessibilityRole="alert">
        <View style={styles.toastIcon}>
          <MaterialIcons name="check" size={18} color={colors.textOnPrimary} />
        </View>
        <View style={styles.toastTexts}>
          <Text style={styles.toastTitle} numberOfLines={1}>
            {toast.title}
          </Text>
          <Text style={styles.toastDetail} numberOfLines={1}>
            {toast.detail}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chipScroll: {
    marginBottom: spacing.xl,
  },
  chipRow: {
    gap: spacing.sm + 2,
  },

  hero: {
    marginBottom: spacing.xl,
    ...shadow.elevated,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroTexts: {
    flex: 1,
    minWidth: 0,
  },
  heroLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },
  heroValue: {
    ...typography.display,
    fontSize: 28,
    lineHeight: 34,
    color: colors.textOnPrimary,
  },
  heroStat: {
    alignItems: 'flex-end',
    paddingLeft: spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.25)',
  },
  heroStatValue: {
    ...typography.title,
    color: colors.textOnPrimary,
  },
  heroStatLabel: {
    ...typography.small,
    color: 'rgba(255,255,255,0.8)',
  },

  drinksSection: {
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  drinkCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  drinkCardPressed: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    transform: [{ scale: 0.97 }],
  },
  drinkCardDisabled: {
    opacity: 0.55,
  },
  drinkTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  checkBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drinkName: {
    ...typography.heading,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  drinkPrice: {
    ...typography.title,
    fontSize: 20,
    lineHeight: 26,
    color: colors.accent,
    marginTop: spacing.xs,
  },
  drinkFooter: {
    // Karten einer Zeile werden auf gleiche Höhe gestreckt; der Footer sitzt immer unten.
    flexDirection: 'row',
    marginTop: 'auto',
    paddingTop: spacing.md,
  },

  // Toast
  toastWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.textPrimary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    ...shadow.elevated,
  },
  toastIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastTexts: {
    flex: 1,
    minWidth: 0,
  },
  toastTitle: {
    ...typography.bodyStrong,
    color: colors.textOnPrimary,
  },
  toastDetail: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
  },
});
