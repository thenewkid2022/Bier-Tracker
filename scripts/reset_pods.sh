#!/usr/bin/env bash
set -e

cd ios

echo ">>> Deintegrating old Pods"
pod deintegrate --verbose || true
rm -rf Pods Podfile.lock

echo ">>> Updating repo"
pod repo update --verbose

echo ">>> Installing Pods fresh"
pod install --repo-update --verbose

echo ">>> Fixing Flutter xcconfig includes"
cd Flutter
for config in Debug Release Profile; do
  if ! grep -q "Pods-Runner.$(echo $config | tr '[:upper:]' '[:lower:]').xcconfig" $config.xcconfig; then
    echo "#include \"Pods/Target Support Files/Pods-Runner/Pods-Runner.$(echo $config | tr '[:upper:]' '[:lower:]').xcconfig\"" >> $config.xcconfig
  fi
done
