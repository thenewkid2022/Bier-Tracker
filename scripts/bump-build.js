#!/usr/bin/env node
/**
 * Erhöht iOS buildNumber und Android versionCode in app.json synchron um 1.
 * Plattformunabhängig und UTF-8-sicher (kein sed/PowerShell-Textersatz).
 *
 * Verwendung: npm run bump:build
 */
const fs = require('node:fs');
const path = require('node:path');

const appJsonPath = path.resolve(__dirname, '..', 'app.json');
const raw = fs.readFileSync(appJsonPath, 'utf8');
const config = JSON.parse(raw);

const ios = config.expo?.ios ?? {};
const android = config.expo?.android ?? {};

const currentIos = Number.parseInt(ios.buildNumber ?? '0', 10);
const currentAndroid = Number.parseInt(String(android.versionCode ?? 0), 10);
const next = Math.max(currentIos, currentAndroid) + 1;

ios.buildNumber = String(next);
android.versionCode = next;
config.expo.ios = ios;
config.expo.android = android;

fs.writeFileSync(appJsonPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');

console.log(`Build-Nummer: iOS ${currentIos} -> ${next}, Android versionCode ${currentAndroid} -> ${next}`);
console.log(`app.json aktualisiert (Version ${config.expo.version})`);
