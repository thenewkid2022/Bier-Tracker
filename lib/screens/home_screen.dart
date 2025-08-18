import 'package:flutter/material.dart';
import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';
import 'package:intl/intl.dart';
import '../models/user_profile.dart';
import '../models/drink.dart';
import '../models/consumption.dart';
import '../services/hive_service.dart';
import '../services/notification_service.dart';
import '../services/payment_service.dart';
import '../services/report_service.dart';
import '../services/sync_service.dart';
import '../widgets/drink_icon.dart';
import 'profile_screen.dart';
import 'admin_screen.dart';
import 'package:printing/printing.dart';
import 'package:qr_flutter/qr_flutter.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  UserProfile? selectedUser;

  @override
  void initState() {
    super.initState();
    _boot();
  }

  Future<void> _boot() async {
    await HiveService.init();
    await SyncService.tryInitFirebase();
    if (HiveService.drinksBox.isEmpty) {
      // Demo-Getränke
      final demo = [
        Drink(id: const Uuid().v4(), name: 'Bier', price: 2.0, stock: 50, iconKey: 'beer'),
        Drink(id: const Uuid().v4(), name: 'Cola', price: 1.5, stock: 40, iconKey: 'soda'),
        Drink(id: const Uuid().v4(), name: 'Wein', price: 3.5, stock: 20, iconKey: 'wine'),
      ];
      for (final d in demo) {
        HiveService.drinksBox.put(d.id, d);
      }
    }
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(
        title: const Text('BierLounge Tracker'),
        actions: [
          IconButton(
            tooltip: 'Leaderboard',
            icon: const Icon(Icons.emoji_events_rounded),
            onPressed: _openLeaderboard,
          ),
          IconButton(
            tooltip: 'PDF (Monat)',
            icon: const Icon(Icons.picture_as_pdf_rounded),
            onPressed: _generateMonthlyPdf,
          ),
          IconButton(
            tooltip: 'Admin',
            icon: const Icon(Icons.admin_panel_settings_rounded),
            onPressed: _openAdmin,
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(child: _buildUserSelector(scheme)),
                const SizedBox(width: 12),
                ElevatedButton.icon(
                  icon: const Icon(Icons.person_add_alt_1_rounded),
                  label: const Text('Nutzer hinzufügen'),
                  onPressed: _addUserDialog,
                  style: ElevatedButton.styleFrom(minimumSize: const Size(180, 52)),
                ),
                const SizedBox(width: 12),
                if (selectedUser != null)
                  ElevatedButton.icon(
                    icon: const Icon(Icons.person_rounded),
                    label: const Text('Profil'),
                    onPressed: _openProfile,
                    style: ElevatedButton.styleFrom(minimumSize: const Size(140, 52)),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(child: _buildDrinksGrid(scheme)),
          ],
        ),
      ),
    );
  }

  Widget _buildUserSelector(ColorScheme scheme) {
    return ValueListenableBuilder<Box<UserProfile>>(
      valueListenable: HiveService.usersBox.listenable(),
      builder: (context, box, _) {
        final users = box.values.toList();
        return Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<UserProfile>(
                decoration: InputDecoration(
                  labelText: 'Nutzer wählen',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                  filled: true,
                  fillColor: scheme.surface,
                ),
                isExpanded: true,
                value: selectedUser != null && users.any((u) => u.id == selectedUser!.id)
                    ? users.firstWhere((u) => u.id == selectedUser!.id)
                    : null,
                items: users
                    .map((u) => DropdownMenuItem(value: u, child: Text(u.name)))
                    .toList(),
                onChanged: (u) => setState(() => selectedUser = u),
              ),
            ),
            const SizedBox(width: 12),
            if (selectedUser != null)
              _balanceChip(selectedUser!)
          ],
        );
      },
    );
  }

  Widget _balanceChip(UserProfile user) {
    final df = NumberFormat.currency(locale: 'de_CH', symbol: 'CHF');
    final negative = user.balance < 0;
    return Row(
      children: [
        Chip(
          label: Text('Saldo: ${df.format(user.balance)}'),
          avatar: Icon(negative ? Icons.warning_amber_rounded : Icons.account_balance_wallet_rounded,
              color: negative ? Colors.red : Colors.green),
        ),
        const SizedBox(width: 8),
        if (negative)
          ElevatedButton.icon(
            icon: const Icon(Icons.payments_rounded),
            label: const Text('TWINT zahlen'),
            onPressed: () => _twintPay(user),
            style: ElevatedButton.styleFrom(minimumSize: const Size(160, 48)),
          ),
      ],
    );
  }

  Widget _buildDrinksGrid(ColorScheme scheme) {
    return ValueListenableBuilder<Box<Drink>>(
      valueListenable: HiveService.drinksBox.listenable(),
      builder: (context, box, _) {
        final drinks = box.values.toList();
        return GridView.builder(
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 4,
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: 1,
          ),
          itemCount: drinks.length,
          itemBuilder: (context, index) {
            final d = drinks[index];
            final low = d.stock < 10;
            return InkWell(
              onTap: selectedUser == null ? null : () => _consume(d),
              borderRadius: BorderRadius.circular(20),
              child: Container(
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2)),
                  ],
                ),
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Stack(
                      alignment: Alignment.topRight,
                      children: [
                        Center(child: DrinkIcon(iconKey: d.iconKey, size: 64)),
                        if (low)
                          const CircleAvatar(
                            radius: 10,
                            backgroundColor: Colors.red,
                            child: Icon(Icons.warning, size: 14, color: Colors.white),
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(d.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    Text('${d.price.toStringAsFixed(2)} CHF', style: TextStyle(color: scheme.primary)),
                    const SizedBox(height: 6),
                    Text('Lager: ${d.stock}', style: const TextStyle(fontSize: 12, color: Colors.black54)),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _consume(Drink drink) async {
    final user = selectedUser!;
    if (drink.stock <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ausverkauft. Bitte Lager auffüllen.')));
      return;
    }
    final con = Consumption(
      id: const Uuid().v4(),
      userId: user.id,
      drinkId: drink.id,
      timestamp: DateTime.now(),
      price: drink.price,
    );
    await HiveService.consumptionsBox.put(con.id, con);
    drink.stock = drink.stock - 1;
    await drink.save();
    user.balance = user.balance - drink.price;
    user.monthlyCount = user.monthlyCount + 1;
    await user.save();

    // Fun Snackbar
    final tips = [
      'Prost! Denk an Wasser zwischendurch! 💧',
      'Cheers! Verantwortungsbewusst genießen. 🍻',
      'Zum Wohl! Teile auch mit deinen Freunden! 🎉',
    ];
    final tip = (tips..shuffle()).first;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(tip)));

    if (drink.stock < 10) {
      await NotificationService.showSimple('Niedriger Lagerstand', '${drink.name} unter 10 Stück.');
    }
    setState(() {});
    await SyncService.syncUp();
  }

  Future<void> _addUserDialog() async {
    final controller = TextEditingController();
    final emailController = TextEditingController();
    await showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Nutzer hinzufügen'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: controller, decoration: const InputDecoration(labelText: 'Name')),
              TextField(controller: emailController, decoration: const InputDecoration(labelText: 'E-Mail (optional)')),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('Abbrechen')),
            ElevatedButton(
              onPressed: () async {
                final name = controller.text.trim();
                if (name.isEmpty) return;
                final user = UserProfile(id: const Uuid().v4(), name: name, email: emailController.text.trim().isEmpty ? null : emailController.text.trim());
                await HiveService.usersBox.put(user.id, user);
                setState(() => selectedUser = user);
                if (mounted) Navigator.pop(context);
              },
              child: const Text('Speichern'),
            )
          ],
        );
      },
    );
  }

  Future<void> _openProfile() async {
    if (selectedUser == null) return;
    await Navigator.of(context).push(MaterialPageRoute(builder: (_) => ProfileScreen(userId: selectedUser!.id)));
    setState(() {});
  }

  Future<void> _openAdmin() async {
    final pwdController = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Admin-Zugang'),
        content: TextField(controller: pwdController, obscureText: true, decoration: const InputDecoration(labelText: 'Passwort')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Abbrechen')),
          ElevatedButton(onPressed: () => Navigator.pop(context, pwdController.text == 'bieradmin'), child: const Text('OK')),
        ],
      ),
    );
    if (ok == true && mounted) {
      await Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AdminScreen()));
      setState(() {});
    }
  }

  Future<void> _twintPay(UserProfile user) async {
    final amount = -user.balance; // Betrag zum Ausgleich
    final success = await PaymentService.payViaTwint(amount: amount, orderRef: 'Saldo-${user.id}');
    if (!success && mounted) {
      // Fallback: QR anzeigen
      showModalBottomSheet(
        context: context,
        showDragHandle: true,
        builder: (context) => _TwintQrSheet(amount: amount),
      );
    }
  }

  Future<void> _generateMonthlyPdf() async {
    final users = HiveService.usersBox.values.toList();
    final drinks = HiveService.drinksBox.values.toList();
    final cons = HiveService.consumptionsBox.values.toList();
    final data = await ReportService.generateMonthlyReport(users: users, drinks: drinks, consumptions: cons);
    await Printing.layoutPdf(onLayout: (_) async => data);
  }

  Future<void> _openLeaderboard() async {
    final users = HiveService.usersBox.values.toList()
      ..sort((a, b) => b.monthlyCount.compareTo(a.monthlyCount));
    await showModalBottomSheet(
      context: context,
      showDragHandle: true,
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Leaderboard – Dieser Monat', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              ...users.take(10).asMap().entries.map((e) {
                final rank = e.key + 1;
                final u = e.value;
                final title = rank == 1 ? 'Beer King 👑' : (rank == 2 ? 'Thirsty Dragon 🐉' : 'Durstheld');
                return ListTile(
                  leading: CircleAvatar(child: Text('$rank')),
                  title: Text(u.name),
                  subtitle: Text('$title – ${u.monthlyCount} Getränke'),
                );
              })
            ],
          ),
        );
      },
    );
  }
}

class _TwintQrSheet extends StatelessWidget {
  final double amount;
  const _TwintQrSheet({required this.amount});

  @override
  Widget build(BuildContext context) {
    // Hinweis: Für echten Twint-QR wird ein Händlerkonto benötigt.
    // Hier Demo-QR mit Betrag als Text statt echter Zahlung.
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('TWINT nicht verfügbar'),
          const SizedBox(height: 8),
          Text('Bitte QR in der echten Umgebung verwenden. Betrag: ${amount.toStringAsFixed(2)} CHF'),
          const SizedBox(height: 16),
          QrImageView(
            data: 'TWINT-PLACEHOLDER|AMOUNT:${amount.toStringAsFixed(2)}|CURRENCY:CHF',
            size: 220,
            backgroundColor: Colors.white,
            eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.circle, color: Colors.black),
          ),
          const SizedBox(height: 16),
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Schließen')),
        ],
      ),
    );
  }
}


