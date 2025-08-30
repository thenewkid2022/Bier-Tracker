@echo off
REM Build-Nummer automatisch erhöhen (Windows)
REM Verwendung: scripts\bump-build.bat

echo 🚀 Build-Nummer wird erhöht...

REM Aktuelle Build-Nummer aus app.json extrahieren
for /f "tokens=2 delims=: " %%i in ('findstr "buildNumber" app.json') do set CURRENT_BUILD=%%i
set CURRENT_BUILD=%CURRENT_BUILD:"=%

REM Neue Build-Nummer berechnen
set /a NEW_BUILD=%CURRENT_BUILD%+1

echo 📱 Aktuelle Build-Nummer: %CURRENT_BUILD%
echo 🆕 Neue Build-Nummer: %NEW_BUILD%

REM Build-Nummer in app.json aktualisieren
powershell -Command "(Get-Content app.json) -replace '\"buildNumber\": \"%CURRENT_BUILD%\"', '\"buildNumber\": \"%NEW_BUILD%\"' | Set-Content app.json"

echo ✅ Build-Nummer erfolgreich auf %NEW_BUILD% aktualisiert!
echo 📝 app.json wurde aktualisiert
pause
