import {
  ConsumptionSchema,
  DrinkSchema,
  NewDrinkInputSchema,
  NewUserInputSchema,
  UserProfileSchema,
  parseArraySafe,
} from '../domain/schemas';

describe('Domain-Schemas', () => {
  describe('UserProfileSchema', () => {
    it('akzeptiert einen gültigen Benutzer mit negativer Balance (Schulden)', () => {
      const result = UserProfileSchema.safeParse({
        id: 'u1',
        name: 'Anna',
        email: 'anna@example.com',
        balance: -18.75,
        monthlyCount: 8,
      });
      expect(result.success).toBe(true);
    });

    it('lehnt ungültige E-Mail und negative Monatszähler ab', () => {
      expect(
        UserProfileSchema.safeParse({ id: 'u1', name: 'A', email: 'nope', balance: 0, monthlyCount: 0 }).success
      ).toBe(false);
      expect(UserProfileSchema.safeParse({ id: 'u1', name: 'A', balance: 0, monthlyCount: -1 }).success).toBe(false);
    });
  });

  describe('DrinkSchema', () => {
    it('verlangt positiven Preis und ganzzahligen Bestand', () => {
      expect(DrinkSchema.safeParse({ id: 'd', name: 'Bier', price: 0, stock: 1, iconKey: 'beer' }).success).toBe(false);
      expect(DrinkSchema.safeParse({ id: 'd', name: 'Bier', price: 3.5, stock: 1.5, iconKey: 'beer' }).success).toBe(
        false
      );
      expect(DrinkSchema.safeParse({ id: 'd', name: 'Bier', price: 3.5, stock: 10, iconKey: 'beer' }).success).toBe(
        true
      );
    });
  });

  describe('NewUserInputSchema', () => {
    it('trimmt Namen und wandelt leere E-Mail in undefined', () => {
      const result = NewUserInputSchema.parse({ name: '  Max ', email: '   ' });
      expect(result).toEqual({ name: 'Max', email: undefined });
    });

    it('liefert deutsche Fehlermeldung bei leerem Namen', () => {
      const result = NewUserInputSchema.safeParse({ name: '  ', email: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Bitte geben Sie einen Namen ein.');
      }
    });
  });

  describe('NewDrinkInputSchema', () => {
    it('konvertiert String-Eingaben aus Formularen zu Zahlen', () => {
      const result = NewDrinkInputSchema.parse({ name: 'Cola', price: '2.50', stock: '12', iconKey: 'soda' });
      expect(result).toEqual({ name: 'Cola', price: 2.5, stock: 12, iconKey: 'soda' });
    });

    it('lehnt nicht-numerische oder negative Werte ab', () => {
      expect(NewDrinkInputSchema.safeParse({ name: 'Cola', price: 'abc', stock: '1', iconKey: 'soda' }).success).toBe(
        false
      );
      expect(NewDrinkInputSchema.safeParse({ name: 'Cola', price: '2', stock: '-1', iconKey: 'soda' }).success).toBe(
        false
      );
      expect(NewDrinkInputSchema.safeParse({ name: 'Cola', price: '2', stock: '1.5', iconKey: 'soda' }).success).toBe(
        false
      );
    });
  });

  describe('parseArraySafe', () => {
    it('behält gültige Einträge und verwirft ungültige, ohne zu werfen', () => {
      const input = [
        { id: 'c1', userId: 'u', drinkId: 'd', timestamp: 1, price: 3.5, quantity: 1 },
        { id: 'c2', userId: 'u', drinkId: 'd', timestamp: 'kaputt', price: 3.5 },
        'kein objekt',
      ];
      const result = parseArraySafe(ConsumptionSchema, input, 'consumptions');
      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('c1');
    });

    it('gibt bei Nicht-Array leeres Array zurück', () => {
      expect(parseArraySafe(DrinkSchema, null, 'drinks')).toEqual([]);
      expect(parseArraySafe(DrinkSchema, { foo: 1 }, 'drinks')).toEqual([]);
    });
  });
});
