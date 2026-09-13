import { z } from 'zod';

/**
 * Zentrale Domain-Schemas. Alle Entity-Typen der App werden hier per Zod definiert
 * und als TypeScript-Typen abgeleitet. Damit gibt es genau eine Quelle der Wahrheit
 * für Struktur UND Runtime-Validierung (z. B. beim Laden aus SQLite/AsyncStorage).
 */

export const DRINK_ICON_KEYS = ['beer', 'wine', 'soda', 'coffee', 'water', 'juice', 'cocktail', 'shot'] as const;
export const DrinkIconKeySchema = z.enum(DRINK_ICON_KEYS);
export type DrinkIconKey = z.infer<typeof DrinkIconKeySchema>;

export const UserProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email().optional(),
  /** Saldo in CHF. Negativ = offene Rechnung (User schuldet Geld). */
  balance: z.number().finite(),
  monthlyCount: z.number().int().nonnegative(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const DrinkSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  /** Bewusst `string`, damit alte Datensätze mit unbekannten Keys nicht verworfen werden; DrinkIcon fällt auf Default zurück. */
  iconKey: z.string().min(1),
});
export type Drink = z.infer<typeof DrinkSchema>;

export const ConsumptionSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  drinkId: z.string().min(1),
  /** Unix-Millisekunden. Alte ISO-Strings werden beim Laden konvertiert. */
  timestamp: z.number().int().nonnegative(),
  /** Gesamtpreis der Position (Preis × Menge). */
  price: z.number().nonnegative(),
  quantity: z.number().int().positive().optional(),
  /** Denormalisiert für die Anzeige; wird beim Lesen aus dem Drink aufgelöst. */
  drinkName: z.string().optional(),
  iconKey: z.string().optional(),
});
export type Consumption = z.infer<typeof ConsumptionSchema>;

export const TwintAdminConfigSchema = z.object({
  iban: z.string().optional(),
  phoneNumber: z.string().optional(),
  defaultMessage: z.string().max(140).optional(),
  merchantName: z.string().max(50).optional(),
});
export type TwintAdminConfig = z.infer<typeof TwintAdminConfigSchema>;

/** Formular-Eingaben (Admin) – bewusst lockerer, Parsing/Trim erfolgt hier. */
export const NewUserInputSchema = z.object({
  name: z.string().trim().min(1, 'Bitte geben Sie einen Namen ein.'),
  email: z
    .string()
    .trim()
    .transform((v) => (v === '' ? undefined : v))
    .pipe(z.string().email('Ungültige E-Mail-Adresse.').optional()),
});
export type NewUserInput = z.infer<typeof NewUserInputSchema>;

export const NewDrinkInputSchema = z.object({
  name: z.string().trim().min(1, 'Bitte geben Sie einen Getränkenamen ein.'),
  price: z.coerce.number({ invalid_type_error: 'Preis muss eine Zahl sein.' }).positive('Preis muss größer als 0 sein.'),
  stock: z.coerce
    .number({ invalid_type_error: 'Bestand muss eine Zahl sein.' })
    .int('Bestand muss eine ganze Zahl sein.')
    .nonnegative('Bestand darf nicht negativ sein.'),
  iconKey: z.string().min(1),
});
export type NewDrinkInput = z.infer<typeof NewDrinkInputSchema>;

/**
 * Validiert ein Array unbekannter Datensätze und gibt nur die gültigen zurück.
 * Ungültige Einträge werden geloggt statt die ganze App zum Absturz zu bringen.
 */
export function parseArraySafe<T>(schema: z.ZodType<T>, input: unknown, label: string): T[] {
  if (!Array.isArray(input)) {
    return [];
  }
  const valid: T[] = [];
  let invalidCount = 0;
  for (const item of input) {
    const result = schema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      invalidCount += 1;
    }
  }
  if (invalidCount > 0) {
    console.warn(`[schemas] ${invalidCount} ungültige ${label}-Einträge verworfen.`);
  }
  return valid;
}
