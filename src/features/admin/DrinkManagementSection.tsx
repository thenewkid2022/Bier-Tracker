import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { adminStyles } from './adminStyles';
import { DrinkIcon, getDrinkIconSpec } from '../../components/DrinkIcon';
import { Badge, Button, EmptyState, IconButton, SectionHeader, TextField } from '../../components/ui';
import { colors, formatChf, radius, spacing, typography } from '../../theme';
import type { Drink, DrinkIconKey } from '../../domain/schemas';

const ICON_OPTIONS: readonly { key: DrinkIconKey; label: string }[] = [
  { key: 'beer', label: 'Bier' },
  { key: 'wine', label: 'Wein' },
  { key: 'coffee', label: 'Kaffee' },
  { key: 'water', label: 'Wasser' },
  { key: 'soda', label: 'Limonade' },
  { key: 'cocktail', label: 'Cocktail' },
];

const LOW_STOCK_THRESHOLD = 5;

type Props = {
  drinks: Drink[];
  onAddDrink: (input: { name: string; price: string; stock: string; iconKey: string }) => Promise<void>;
  onDeleteDrink: (drinkId: string) => void;
};

export const DrinkManagementSection: React.FC<Props> = ({ drinks, onAddDrink, onDeleteDrink }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [iconKey, setIconKey] = useState<DrinkIconKey>('beer');
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setName('');
    setPrice('');
    setStock('');
    setIconKey('beer');
    setShowAddForm(false);
  };

  const handleAdd = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      // Schweizer Eingabe "3,50" tolerieren
      await onAddDrink({ name, price: price.replace(',', '.'), stock, iconKey });
      resetForm();
    } catch {
      // Fehler wurde vom Parent bereits gemeldet; Eingaben bleiben zur Korrektur erhalten.
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = name.trim().length > 0 && price.trim().length > 0 && stock.trim().length > 0;

  return (
    <View style={adminStyles.section}>
      <SectionHeader
        title="Getränke"
        subtitle={`${drinks.length} im Sortiment`}
        action={
          <IconButton
            icon={showAddForm ? 'close' : 'add'}
            tone="primary"
            onPress={() => setShowAddForm((v) => !v)}
            accessibilityLabel={showAddForm ? 'Formular schließen' : 'Getränk hinzufügen'}
          />
        }
      />

      {showAddForm && (
        <View style={adminStyles.addForm}>
          <Text style={adminStyles.addFormTitle}>Neues Getränk</Text>
          <TextField label="Name" placeholder="z. B. Bier 0.5 l" value={name} onChangeText={setName} autoFocus />
          <View style={styles.twoColumns}>
            <View style={styles.column}>
              <TextField
                label="Preis (CHF)"
                placeholder="3.50"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.column}>
              <TextField
                label="Bestand"
                placeholder="24"
                value={stock}
                onChangeText={setStock}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <Text style={styles.iconLabel}>Symbol</Text>
          <View style={styles.iconGrid}>
            {ICON_OPTIONS.map((option) => {
              const selected = iconKey === option.key;
              const spec = getDrinkIconSpec(option.key);
              return (
                <Pressable
                  key={option.key}
                  onPress={() => setIconKey(option.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.iconOption, selected && { borderColor: spec.tint, backgroundColor: spec.bg }]}
                >
                  <DrinkIcon iconKey={option.key} size={22} />
                  <Text style={[styles.iconOptionLabel, selected && { color: spec.tint }]} numberOfLines={1}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={adminStyles.formButtons}>
            <Button label="Abbrechen" variant="secondary" onPress={resetForm} style={adminStyles.formButton} />
            <Button
              label="Hinzufügen"
              icon="check"
              onPress={handleAdd}
              loading={isSaving}
              disabled={!canSave}
              style={adminStyles.formButton}
            />
          </View>
        </View>
      )}

      {drinks.length === 0 && !showAddForm ? (
        <EmptyState
          icon="sports-bar"
          title="Noch keine Getränke"
          message="Lege über das Plus oben rechts das erste Getränk an."
        />
      ) : (
        drinks.map((drink) => {
          const soldOut = drink.stock <= 0;
          const low = !soldOut && drink.stock <= LOW_STOCK_THRESHOLD;
          return (
            <View key={drink.id} style={adminStyles.card}>
              <View style={adminStyles.cardHeader}>
                <DrinkIcon iconKey={drink.iconKey} size={22} boxed />
                <View style={adminStyles.cardInfo}>
                  <Text style={adminStyles.cardTitle} numberOfLines={1}>
                    {drink.name}
                  </Text>
                  <Text style={[adminStyles.cardSubtitle, styles.price]}>{formatChf(drink.price)}</Text>
                </View>
                <View style={adminStyles.cardMetric}>
                  <Text style={adminStyles.cardMetricLabel}>Bestand</Text>
                  <Text
                    style={[
                      adminStyles.cardMetricValue,
                      soldOut ? styles.stockOut : low ? styles.stockLow : styles.stockOk,
                    ]}
                  >
                    {drink.stock}
                  </Text>
                </View>
              </View>
              <View style={adminStyles.cardFooter}>
                <Badge
                  label={soldOut ? 'Ausverkauft' : low ? 'Bestand niedrig' : 'Auf Lager'}
                  tone={soldOut ? 'danger' : low ? 'warning' : 'success'}
                />
                <IconButton
                  icon="delete-outline"
                  tone="danger"
                  onPress={() => onDeleteDrink(drink.id)}
                  accessibilityLabel={`${drink.name} löschen`}
                />
              </View>
            </View>
          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  twoColumns: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  price: {
    color: colors.accent,
    fontWeight: '600',
  },
  stockOk: {
    color: colors.success,
  },
  stockLow: {
    color: colors.warning,
  },
  stockOut: {
    color: colors.danger,
  },
  iconLabel: {
    ...typography.captionStrong,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  iconOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  iconOptionLabel: {
    ...typography.captionStrong,
    color: colors.textSecondary,
  },
});
