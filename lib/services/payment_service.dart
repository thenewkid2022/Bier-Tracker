import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:url_launcher/url_launcher.dart';

class PaymentService {
  // TWINT: Es gibt kein offizielles, frei zugängliches Flutter-Plugin namens "twintexternalapp".
  // MVP-Ansatz: Deeplink/URL-Schema öffnen, falls vom Händler/Twint bereitgestellt.
  // Für echte Integration: Händlervertrag bei Twint abschließen und SDK/Deeplink-Spezifikation erhalten.
  // Als Fallback bieten wir QR-Code an (separate UI).

  static Future<bool> payViaTwint({required double amount, String? orderRef}) async {
    // iOS-Hinweis:
    // - In ios/Runner/Info.plist sind LSApplicationQueriesSchemes für Twint whitelisted.
    // - Den Deeplink unten mit echten Merchant-Parametern ersetzen (via Twint Developer Portal).
    // - Beispiel (Platzhalter!): twint://pay?amount=12.00&currency=CHF&merchantUuid=YOUR_UUID&ref=ORDER123
    final uri = Uri.parse('twint://pay?amount=${amount.toStringAsFixed(2)}&currency=CHF&ref=${Uri.encodeComponent(orderRef ?? '')}&merchantUuid=YOUR_UUID');
    try {
      if (await canLaunchUrl(uri)) {
        return await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (_) {}
    return false;
  }

  static bool twintSupportedOnPlatform() {
    if (kIsWeb) return false;
    return Platform.isAndroid || Platform.isIOS;
  }
}


