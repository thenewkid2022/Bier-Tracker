/**
 * Erzeugt eine kollisionsarme, sortierbare ID (Zeitstempel + Zufallsanteil).
 * Zentral, damit nicht jede Datei ihre eigene Variante pflegt.
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}
