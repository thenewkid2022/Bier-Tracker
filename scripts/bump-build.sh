#!/bin/bash

# Build-Nummer automatisch erhöhen
# Verwendung: ./scripts/bump-build.sh

echo "🚀 Build-Nummer wird erhöht..."

# Aktuelle Build-Nummer aus app.json extrahieren
CURRENT_BUILD=$(grep '"buildNumber":' app.json | sed 's/.*"buildNumber": "\([^"]*\)".*/\1/')

# Neue Build-Nummer berechnen
NEW_BUILD=$((CURRENT_BUILD + 1))

echo "📱 Aktuelle Build-Nummer: $CURRENT_BUILD"
echo "🆕 Neue Build-Nummer: $NEW_BUILD"

# Build-Nummer in app.json aktualisieren
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/\"buildNumber\": \"$CURRENT_BUILD\"/\"buildNumber\": \"$NEW_BUILD\"/" app.json
else
    # Linux/Windows
    sed -i "s/\"buildNumber\": \"$CURRENT_BUILD\"/\"buildNumber\": \"$NEW_BUILD\"/" app.json
fi

echo "✅ Build-Nummer erfolgreich auf $NEW_BUILD aktualisiert!"
echo "📝 app.json wurde aktualisiert"
