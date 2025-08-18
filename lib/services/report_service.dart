import 'dart:typed_data';
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import '../models/user_profile.dart';
import '../models/drink.dart';
import '../models/consumption.dart';

class ReportService {
  static Future<Uint8List> generateMonthlyReport({
    required List<UserProfile> users,
    required List<Drink> drinks,
    required List<Consumption> consumptions,
    DateTime? forMonth,
  }) async {
    final month = forMonth ?? DateTime.now();
    final monthStart = DateTime(month.year, month.month, 1);
    final monthEnd = DateTime(month.year, month.month + 1, 1).subtract(const Duration(seconds: 1));
    final dfDate = DateFormat('dd.MM.yyyy HH:mm');
    final dfMoney = NumberFormat.currency(locale: 'de_CH', symbol: 'CHF');

    final filtered = consumptions
        .where((c) => c.timestamp.isAfter(monthStart.subtract(const Duration(seconds: 1))) && c.timestamp.isBefore(monthEnd.add(const Duration(seconds: 1))))
        .toList();

    // Aggregation pro User
    final Map<String, List<Consumption>> userToCos = {};
    for (final c in filtered) {
      userToCos.putIfAbsent(c.userId, () => []).add(c);
    }

    final doc = pw.Document();
    final title = 'BierLounge – Monatsreport ${DateFormat('MMMM yyyy', 'de_CH').format(month)}';

    doc.addPage(
      pw.MultiPage(
        build: (context) {
          return [
            pw.Header(level: 0, child: pw.Text(title, style: pw.TextStyle(fontSize: 22, fontWeight: pw.FontWeight.bold))),
            pw.Paragraph(text: 'Zeitraum: ${DateFormat('dd.MM.yyyy').format(monthStart)} – ${DateFormat('dd.MM.yyyy').format(monthEnd)}'),
            pw.SizedBox(height: 12),
            pw.Table.fromTextArray(
              headers: ['Nutzer', 'Anzahl', 'Summe'],
              data: users.map((u) {
                final list = userToCos[u.id] ?? const <Consumption>[];
                final sum = list.fold<double>(0.0, (p, c) => p + c.price);
                return [u.name, list.length, dfMoney.format(sum)];
              }).toList(),
            ),
            pw.SizedBox(height: 20),
            pw.Text('Details', style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold)),
            ...users.expand((u) {
              final list = userToCos[u.id] ?? const <Consumption>[];
              if (list.isEmpty) return <pw.Widget>[];
              return [
                pw.SizedBox(height: 10),
                pw.Text(u.name, style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold)),
                pw.Table.fromTextArray(
                  headers: ['Zeit', 'Getränk', 'Preis'],
                  data: list.map((c) {
                    final drinkName = drinks.firstWhere((d) => d.id == c.drinkId, orElse: () => Drink(id: '-', name: 'Unbekannt', price: 0, stock: 0, iconKey: 'beer')).name;
                    return [dfDate.format(c.timestamp), drinkName, dfMoney.format(c.price)];
                  }).toList(),
                ),
              ];
            }).toList(),
          ];
        },
      ),
    );

    return doc.save();
  }
}


