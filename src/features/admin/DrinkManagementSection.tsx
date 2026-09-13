import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { adminStyles } from './adminStyles';
import { DrinkIcon } from '../../components/DrinkIcon';
import { colors, radius, spacing } from '../../theme';
import type { Drink, DrinkIconKey } from '../../domain/schemas';

const ICON_OPTIONS: ReadonlyArray<{ key: DrinkIconKey; label: string }> = [
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

  return (
    <View style={adminStyles.sectionContainer}>
      <View style={adminStyles.sectionHeader}>
        <Text style={adminStyles.sectionTitle}>Getränke-Verwaltung</Text>
        <TouchableOpacity style={adminStyles.iconButton} onPress={() => setShowAddForm((v) => !v)}>
          <MaterialIcons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {showAddForm && (
        <View style={adminStyles.addForm}>
          <TextInput style={adminStyles.input} placeholder="Getränkename" value={name} onChangeText={setName} />
          <TextInput
            style={adminStyles.input}
            placeholder="Preis (CHF)"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
          <TextInput
            style={adminStyles.input}
            placeholder="Bestand"
            value={stock}
            onChangeText={setStock}
            keyboardType="number-pad"
          />

          <View style={styles.iconSelectionContainer}>
            <Text style={styles.iconSelectionLabel}>Icon auswählen:</Text>
            <View style={styles.iconGrid}>
              {ICON_OPTIONS.map((option) => {
                const selected = iconKey === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[styles.iconOption, selected && styles.iconOptionSelected]}
                    onPress={() => setIconKey(option.key)}
                  >
                    <DrinkIcon iconKey={option.key} size={24} color={selected ? colors.textOnPrimary : colors.primary} />
                    <Text style={[styles.iconOptionLabel, selected && styles.iconOptionLabelSelected]}>{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={adminStyles.formButtons}>
            <TouchableOpacity style={adminStyles.cancelButton} onPress={resetForm}>
              <Text style={adminStyles.cancelButtonText}>Abbrechen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={adminStyles.saveButton} onPress={handleAdd} disabled={isSaving}>
              <Text style={adminStyles.saveButtonText}>Hinzufügen</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {drinks.map((drink) => (
        <View key={drink.id} style={adminStyles.card}>
          <View style={adminStyles.cardHeader}>
            <View style={adminStyles.cardAvatar}>
              <DrinkIcon iconKey={drink.iconKey} size={24} />
            </View>
            <View style={adminStyles.cardInfo}>
              <Text style={adminStyles.cardTitle}>{drink.name}</Text>
              <Text style={styles.drinkPrice}>CHF {drink.price.toFixed(2)}</Text>
            </View>
            <View style={adminStyles.cardMetric}>
              <Text style={adminStyles.cardMetricLabel}>Bestand</Text>
              <Text
                style={[
                  adminStyles.cardMetricValue,
                  drink.stock <= LOW_STOCK_THRESHOLD ? styles.stockLow : styles.stockOk,
                ]}
              >
                {drink.stock}
              </Text>
            </View>
          </View>

          <View style={styles.drinkCardActions}>
            <TouchableOpacity style={adminStyles.deleteButton} onPress={() => onDeleteDrink(drink.id)}>
              <MaterialIcons name="delete" size={18} color={colors.danger} />
              <Text style={adminStyles.deleteButtonText}>Löschen</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  drinkPrice: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  stockOk: {
    color: colors.success,
  },
  stockLow: {
    color: colors.warning,
  },
  drinkCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  iconSelectionContainer: {
    marginBottom: spacing.lg,
  },
  iconSelectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  iconOption: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 80,
  },
  iconOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  iconOptionLabel: {
    fontSize: 12,
    color: colors.primary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  iconOptionLabelSelected: {
    color: colors.textOnPrimary,
  },
});
