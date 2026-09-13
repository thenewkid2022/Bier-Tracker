import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useShallow } from 'zustand/react/shallow';
import { DrinkIcon } from '../components/DrinkIcon';
import { Badge, Button, Card, EmptyState, IconButton, Screen, SectionHeader, UserChip, Avatar } from '../components/ui';
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

const MAX_QUANTITY = 10;
const LOW_STOCK = 5;
const GRID_GAP = spacing.md;

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

  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    hydrate().catch((error) => console.error('Fehler beim Hydraten der Daten:', error));
  }, [hydrate]);

  const maxQuantity = useMemo(
    () => (selectedDrink ? Math.max(1, Math.min(selectedDrink.stock, MAX_QUANTITY)) : 1),
    [selectedDrink]
  );

  const openQuantitySheet = (drink: Drink) => {
    if (!selectedUser) {
      Alert.alert('Kein Benutzer gewählt', 'Bitte wähle zuerst oben einen Benutzer aus.');
      return;
    }
    if (drink.stock <= 0) {
      Alert.alert('Ausverkauft', 'Dieses Getränk ist leider nicht mehr verfügbar.');
      return;
    }
    setSelectedDrink(drink);
    setQuantity(1);
  };

  const closeSheet = () => {
    if (isPurchasing) return;
    setSelectedDrink(null);
  };

  const confirmPurchase = async () => {
    if (!selectedDrink || !selectedUser || isPurchasing) return;
    const qty = Math.min(quantity, maxQuantity);
    const total = selectedDrink.price * qty;
    const newBalance = selectedUser.balance - total;

    setIsPurchasing(true);
    try {
      await purchaseDrink({ userId: selectedUser.id, drinkId: selectedDrink.id, quantity: qty });
      setSelectedDrink(null);
      const balanceLine =
        newBalance < 0 ? `Offener Betrag: ${formatChf(Math.abs(newBalance))}` : `Guthaben: ${formatChf(newBalance)}`;
      Alert.alert('Gekauft', `${qty}× ${selectedDrink.name} für ${formatChf(total)}\n${balanceLine}`);
    } catch (error) {
      console.error('Fehler beim Kaufen des Getränks:', error);
      Alert.alert('Fehler', 'Beim Kaufen des Getränks ist ein Fehler aufgetreten.');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Screen>
      {/* Benutzer-Auswahl */}
      <SectionHeader title="Wer trinkt?" subtitle={users.length === 0 ? undefined : 'Benutzer antippen zum Wechseln'} />
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
          subtitle={selectedUser ? `Antippen, um für ${selectedUser.name} zu buchen` : undefined}
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
              return (
                <Pressable
                  key={drink.id}
                  onPress={() => openQuantitySheet(drink)}
                  disabled={soldOut || !selectedUser}
                  accessibilityRole="button"
                  accessibilityLabel={`${drink.name}, ${formatChf(drink.price)}`}
                  style={({ pressed }) => [
                    styles.drinkCard,
                    { width: cardWidth },
                    pressed && styles.drinkCardPressed,
                    (soldOut || !selectedUser) && styles.drinkCardDisabled,
                  ]}
                >
                  <DrinkIcon iconKey={drink.iconKey} size={26} boxed />
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

      <QuantitySheet
        drink={selectedDrink}
        quantity={quantity}
        maxQuantity={maxQuantity}
        isBusy={isPurchasing}
        onChangeQuantity={setQuantity}
        onClose={closeSheet}
        onConfirm={confirmPurchase}
      />
    </Screen>
  );
};

type SheetProps = {
  drink: Drink | null;
  quantity: number;
  maxQuantity: number;
  isBusy: boolean;
  onChangeQuantity: (q: number) => void;
  onClose: () => void;
  onConfirm: () => void;
};

/** Bottom-Sheet zur Mengenauswahl – auf iPad zentriert und in der Breite begrenzt. */
const QuantitySheet: React.FC<SheetProps> = ({
  drink,
  quantity,
  maxQuantity,
  isBusy,
  onChangeQuantity,
  onClose,
  onConfirm,
}) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 600;

  const clamp = (q: number) => Math.max(1, Math.min(maxQuantity, q));
  const total = drink ? drink.price * quantity : 0;

  return (
    <Modal visible={drink !== null} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.sheetBackdrop, isWide && styles.sheetBackdropWide]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Schließen" />
        <View style={[styles.sheet, isWide ? styles.sheetWide : { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.sheetHandle} />
          {drink && (
            <>
              <View style={styles.sheetHeader}>
                <DrinkIcon iconKey={drink.iconKey} size={28} boxed />
                <View style={styles.sheetTitles}>
                  <Text style={styles.sheetTitle} numberOfLines={2}>
                    {drink.name}
                  </Text>
                  <Text style={styles.sheetSubtitle}>
                    {formatChf(drink.price)} · {drink.stock} verfügbar
                  </Text>
                </View>
                <IconButton icon="close" accessibilityLabel="Schließen" onPress={onClose} />
              </View>

              <View style={styles.stepperRow}>
                <Text style={styles.stepperLabel}>Menge</Text>
                <View style={styles.stepper}>
                  <Pressable
                    onPress={() => onChangeQuantity(clamp(quantity - 1))}
                    disabled={quantity <= 1}
                    accessibilityLabel="Menge verringern"
                    style={({ pressed }) => [
                      styles.stepBtn,
                      pressed && styles.stepBtnPressed,
                      quantity <= 1 && styles.stepBtnDisabled,
                    ]}
                  >
                    <MaterialIcons name="remove" size={22} color={colors.textPrimary} />
                  </Pressable>
                  <TextInput
                    style={styles.stepInput}
                    value={String(quantity)}
                    onChangeText={(t) => onChangeQuantity(clamp(parseInt(t, 10) || 1))}
                    keyboardType="number-pad"
                    textAlign="center"
                    maxLength={2}
                    selectTextOnFocus
                  />
                  <Pressable
                    onPress={() => onChangeQuantity(clamp(quantity + 1))}
                    disabled={quantity >= maxQuantity}
                    accessibilityLabel="Menge erhöhen"
                    style={({ pressed }) => [
                      styles.stepBtn,
                      pressed && styles.stepBtnPressed,
                      quantity >= maxQuantity && styles.stepBtnDisabled,
                    ]}
                  >
                    <MaterialIcons name="add" size={22} color={colors.textPrimary} />
                  </Pressable>
                </View>
              </View>
              <Text style={styles.stepperHint}>Maximal {maxQuantity} pro Buchung</Text>

              <View style={styles.sheetActions}>
                <Button
                  label="Abbrechen"
                  variant="secondary"
                  onPress={onClose}
                  disabled={isBusy}
                  style={styles.sheetActionSecondary}
                />
                <Button
                  label={`Kaufen · ${formatChf(total)}`}
                  variant="primary"
                  size="lg"
                  icon="shopping-cart"
                  onPress={onConfirm}
                  loading={isBusy}
                  style={styles.sheetActionPrimary}
                />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: colors.surfaceMuted,
    transform: [{ scale: 0.98 }],
  },
  drinkCardDisabled: {
    opacity: 0.55,
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

  // Bottom Sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheetBackdropWide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    ...shadow.modal,
  },
  sheetWide: {
    width: '100%',
    maxWidth: 440,
    borderRadius: radius.xl,
    paddingBottom: spacing.xl,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  sheetTitles: {
    flex: 1,
    minWidth: 0,
  },
  sheetTitle: {
    ...typography.heading,
    fontSize: 18,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  stepperLabel: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepBtnPressed: {
    backgroundColor: colors.primarySoft,
  },
  stepBtnDisabled: {
    opacity: 0.4,
  },
  stepInput: {
    width: 56,
    height: 44,
    ...typography.title,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  stepperHint: {
    ...typography.small,
    fontWeight: '400',
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  sheetActionSecondary: {
    flex: 1,
    minHeight: 52,
  },
  sheetActionPrimary: {
    flex: 2,
  },
});
