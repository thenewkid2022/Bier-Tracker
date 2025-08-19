import 'package:flutter/cupertino.dart';
import 'package:uuid/uuid.dart';
import 'package:intl/intl.dart';
import '../models/user_profile.dart';
import '../models/drink.dart';
import '../models/consumption.dart';
import '../services/db_service.dart';
import '../services/notification_service.dart';
import '../services/payment_service.dart';
import '../services/report_service.dart';
import '../services/sync_service.dart';
import '../widgets/drink_icon.dart';
import 'profile_screen.dart';
import 'admin_screen.dart';
import 'package:printing/printing.dart';
import 'package:qr_flutter/qr_flutter.dart';

class CupertinoHomeScreen extends StatefulWidget {
  const CupertinoHomeScreen({super.key});

  @override
  State<CupertinoHomeScreen> createState() => _CupertinoHomeScreenState();
}

class _CupertinoHomeScreenState extends State<CupertinoHomeScreen> {
  UserProfile? selectedUser;

  @override
  void initState() {
    super.initState();
    _boot();
  }

  Future<void> _boot() async {
    final dbService = DbService();
    await dbService.database;
    await SyncService.tryInitFirebase();
    
    // Demo-Daten hinzufügen, falls keine vorhanden
    final drinks = await dbService.getAllDrinks();
    if (drinks.isEmpty) {
      final demo = [
        Drink(id: const Uuid().v4(), name: 'Bier', price: 2.0, stock: 50, iconKey: 'beer'),
        Drink(id: const Uuid().v4(), name: 'Cola', price: 1.5, stock: 40, iconKey: 'soda'),
        Drink(id: const Uuid().v4(), name: 'Wein', price: 3.5, stock: 20, iconKey: 'wine'),
      ];
      for (final d in demo) {
        await dbService.saveDrink(d);
      }
    }
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.of(context).size.width >= 900;
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: const Text('BierLounge Tracker'),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            CupertinoButton(
              padding: EdgeInsets.zero,
              onPressed: _openLeaderboard,
              child: const Icon(CupertinoIcons.rosette),
            ),
            CupertinoButton(
              padding: EdgeInsets.zero,
              onPressed: _generateMonthlyPdf,
              child: const Icon(CupertinoIcons.doc_text),
            ),
            CupertinoButton(
              padding: EdgeInsets.zero,
              onPressed: _openAdmin,
              child: const Icon(CupertinoIcons.gear_alt),
            ),
          ],
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: isWide
              ? Row(
                  children: [
                    SizedBox(width: 360, child: _buildUserList()),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildSelectedUserBar(),
                          const SizedBox(height: 16),
                          Expanded(child: _buildDrinksGrid(isWide: true)),
                        ],
                      ),
                    ),
                  ],
                )
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildUserPanel(),
                    const SizedBox(height: 16),
                    Expanded(child: _buildDrinksGrid()),
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildUserList() {
    // Linke Spalte: feste Nutzerliste (Tablet/iPad). Großer Add-Button oben.
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Expanded(
              child: Text(
                'Nutzer',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: CupertinoColors.label),
              ),
            ),
            CupertinoButton(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              color: CupertinoColors.systemGrey5,
              onPressed: _addUserDialog,
              child: const Icon(CupertinoIcons.add, color: CupertinoColors.activeBlue),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Expanded(
          child: FutureBuilder<List<UserProfile>>(
            future: DbService().getAllUserProfiles(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CupertinoActivityIndicator());
              }
              if (snapshot.hasError) {
                return Center(child: Text('Fehler: ${snapshot.error}'));
              }
              final users = snapshot.data ?? [];
              if (users.isEmpty) {
                return const Center(
                  child: Text('Noch keine Nutzer', style: TextStyle(color: CupertinoColors.secondaryLabel)),
                );
              }
              return ListView.separated(
                itemCount: users.length,
                separatorBuilder: (_, __) => const SizedBox(height: 8),
                itemBuilder: (context, index) {
                  final u = users[index];
                  final isSelected = selectedUser?.id == u.id;
                  final df = NumberFormat.currency(locale: 'de_CH', symbol: 'CHF');
                  return GestureDetector(
                    onTap: () => setState(() => selectedUser = u),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isSelected ? CupertinoColors.systemGrey5 : CupertinoColors.secondarySystemBackground,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isSelected ? CupertinoColors.activeBlue : CupertinoColors.separator,
                          width: isSelected ? 1.5 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(CupertinoIcons.person_fill, color: CupertinoColors.activeBlue),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(u.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                                const SizedBox(height: 2),
                                Text('Saldo: ${df.format(u.balance)}', style: const TextStyle(color: CupertinoColors.secondaryLabel)),
                              ],
                            ),
                          ),
                          if (isSelected)
                            const Icon(CupertinoIcons.check_mark_circled_solid, color: CupertinoColors.activeGreen),
                        ],
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildUserPanel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(child: _buildUserSelector()),
            const SizedBox(width: 12),
            CupertinoButton(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: CupertinoColors.systemGrey5,
              onPressed: _addUserDialog,
              child: const Text('Nutzer hinzufügen',
                  style: TextStyle(color: CupertinoColors.activeBlue, fontWeight: FontWeight.w600)),
            ),
            const SizedBox(width: 12),
            if (selectedUser != null)
              CupertinoButton(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                color: CupertinoColors.systemGrey5,
                onPressed: _openProfile,
                child: const Text('Profil',
                    style: TextStyle(color: CupertinoColors.activeBlue, fontWeight: FontWeight.w600)),
              ),
          ],
        ),
        const SizedBox(height: 12),
        if (selectedUser != null) _balanceChip(selectedUser!),
      ],
    );
  }

  Widget _buildUserSelector() {
    return FutureBuilder<List<UserProfile>>(
      future: DbService().getAllUserProfiles(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const CupertinoButton(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: CupertinoColors.systemGrey5,
            onPressed: null,
            child: CupertinoActivityIndicator(),
          );
        }
        final users = snapshot.data ?? [];
        return CupertinoButton(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          color: CupertinoColors.systemGrey5,
          onPressed: () async {
            if (!mounted) return;
            await showCupertinoModalPopup(
              context: context,
              builder: (_) => CupertinoActionSheet(
                title: const Text('Nutzer wählen'),
                actions: [
                  ...users.map((u) => CupertinoActionSheetAction(
                        onPressed: () {
                          setState(() => selectedUser = u);
                          Navigator.pop(context);
                        },
                        child: Text(u.name),
                      ))
                ],
                cancelButton: CupertinoActionSheetAction(
                  isDefaultAction: true,
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Abbrechen'),
                ),
              ),
            );
          },
          child: Text(
            selectedUser?.name ?? 'Nutzer wählen',
            style: const TextStyle(color: CupertinoColors.activeBlue, fontWeight: FontWeight.w600),
          ),
        );
      },
    );
  }

  Widget _balanceChip(UserProfile user) {
    final df = NumberFormat.currency(locale: 'de_CH', symbol: 'CHF');
    final negative = user.balance < 0;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Saldo: ${df.format(user.balance)}', style: const TextStyle(fontSize: 16)),
        const SizedBox(height: 8),
        if (negative)
          CupertinoButton(
            color: CupertinoColors.activeGreen,
            onPressed: () => _twintPay(user),
            child: const Text('TWINT zahlen'),
          ),
      ],
    );
  }

  Widget _buildSelectedUserBar() {
    if (selectedUser == null) {
      return const SizedBox.shrink();
    }
    final user = selectedUser!;
    final df = NumberFormat.currency(locale: 'de_CH', symbol: 'CHF');
    final negative = user.balance < 0;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: CupertinoColors.secondarySystemBackground,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          const Icon(CupertinoIcons.person_circle_fill, size: 28, color: CupertinoColors.activeBlue),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(user.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                Text('Saldo: ${df.format(user.balance)}', style: const TextStyle(color: CupertinoColors.secondaryLabel)),
              ],
            ),
          ),
          CupertinoButton(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            color: CupertinoColors.systemGrey5,
            onPressed: _openProfile,
            child: const Text('Profil', style: TextStyle(color: CupertinoColors.activeBlue, fontWeight: FontWeight.w600)),
          ),
          const SizedBox(width: 8),
          if (negative)
            CupertinoButton(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              color: CupertinoColors.activeGreen,
              onPressed: () => _twintPay(user),
              child: const Text('TWINT zahlen'),
            ),
        ],
      ),
    );
  }

    Widget _buildDrinksGrid({bool isWide = false}) {
    return FutureBuilder<List<Drink>>(
      future: DbService().getAllDrinks(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CupertinoActivityIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text('Fehler: ${snapshot.error}'));
        }
        final drinks = snapshot.data ?? [];
        final crossAxis = isWide ? 6 : 3; // adaptiv für iPad/iPhone
        return GridView.builder(
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxis,
            mainAxisSpacing: 16,
            crossAxisSpacing: 16,
            childAspectRatio: 1,
          ),
          itemCount: drinks.length,
          itemBuilder: (context, index) {
            final d = drinks[index];
            final low = d.stock < 10;
            return GestureDetector(
              onTap: selectedUser == null ? null : () => _consume(d),
              child: Container(
                decoration: BoxDecoration(
                  color: CupertinoColors.secondarySystemBackground,
                  borderRadius: BorderRadius.circular(20),
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
                          Container(
                            width: 20,
                            height: 20,
                            decoration: const BoxDecoration(
                              color: CupertinoColors.systemRed,
                              shape: BoxShape.circle,
                            ),
                            child: const Center(
                              child: Icon(CupertinoIcons.exclamationmark, size: 14, color: CupertinoColors.white),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const SizedBox(height: 2),
                    Text(d.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: CupertinoColors.label)),
                    const SizedBox(height: 6),
                    Text('${d.price.toStringAsFixed(2)} CHF', style: const TextStyle(color: CupertinoColors.label, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 6),
                    Text('Lager: ${d.stock}', style: const TextStyle(fontSize: 12, color: CupertinoColors.secondaryLabel)),
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
      await _showCupertinoInfo('Ausverkauft. Bitte Lager auffüllen.');
      return;
    }
    final con = Consumption(
      id: const Uuid().v4(),
      userId: user.id,
      drinkId: drink.id,
      timestamp: DateTime.now(),
      price: drink.price,
    );
    final dbService = DbService();
    await dbService.addConsumption(con);
    
    // Drink Stock aktualisieren
    drink.stock = drink.stock - 1;
    await dbService.saveDrink(drink);
    
    // User Balance aktualisieren
    user.balance = user.balance - drink.price;
    user.monthlyCount = user.monthlyCount + 1;
    await dbService.saveUserProfile(user);

    final tips = [
      'Prost! Denk an Wasser zwischendurch! 💧',
      'Cheers! Verantwortungsbewusst genießen. 🍻',
      'Zum Wohl! Teile auch mit deinen Freunden! 🎉',
    ];
    final tip = (tips..shuffle()).first;
    await _showCupertinoInfo(tip);

    if (drink.stock < 10) {
      await NotificationService.showSimple('Niedriger Lagerstand', '${drink.name} unter 10 Stück.');
    }
    setState(() {});
    await SyncService.syncUp();
  }

  Future<void> _addUserDialog() async {
    final controller = TextEditingController();
    final emailController = TextEditingController();
    await showCupertinoDialog(
      context: context,
      builder: (_) => CupertinoAlertDialog(
        title: const Text('Nutzer hinzufügen'),
        content: Column(
          children: [
            const SizedBox(height: 8),
            CupertinoTextField(controller: controller, placeholder: 'Name'),
            const SizedBox(height: 8),
            CupertinoTextField(controller: emailController, placeholder: 'E-Mail (optional)'),
          ],
        ),
        actions: [
          CupertinoDialogAction(onPressed: () => Navigator.pop(context), child: const Text('Abbrechen')),
          CupertinoDialogAction(
            onPressed: () async {
              final name = controller.text.trim();
              if (name.isEmpty) return;
              final user = UserProfile(id: const Uuid().v4(), name: name, email: emailController.text.trim().isEmpty ? null : emailController.text.trim());
              final dbService = DbService();
              await dbService.saveUserProfile(user);
              setState(() => selectedUser = user);
              if (context.mounted) Navigator.pop(context);
            },
            isDefaultAction: true,
            child: const Text('Speichern'),
          ),
        ],
      ),
    );
  }

  Future<void> _openProfile() async {
    if (selectedUser == null) return;
    await Navigator.of(context).push(CupertinoPageRoute(builder: (_) => ProfileScreen(userId: selectedUser!.id)));
    setState(() {});
  }

  Future<void> _openAdmin() async {
    final pwdController = TextEditingController();
    final ok = await showCupertinoDialog<bool>(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Admin-Zugang'),
        content: Column(children: [
          const SizedBox(height: 8),
          CupertinoTextField(controller: pwdController, obscureText: true, placeholder: 'Passwort'),
        ]),
        actions: [
          CupertinoDialogAction(onPressed: () => Navigator.pop(context, false), child: const Text('Abbrechen')),
          CupertinoDialogAction(onPressed: () => Navigator.pop(context, pwdController.text == 'bieradmin'), child: const Text('OK')),
        ],
      ),
    );
    if (ok == true && mounted) {
      await Navigator.of(context).push(CupertinoPageRoute(builder: (_) => const AdminScreen()));
      setState(() {});
    }
  }

  Future<void> _twintPay(UserProfile user) async {
    final amount = -user.balance; // Betrag zum Ausgleich
    final success = await PaymentService.payViaTwint(amount: amount, orderRef: 'Saldo-${user.id}');
    if (!success && mounted) {
      await showCupertinoModalPopup(
        context: context,
        builder: (context) => CupertinoActionSheet(
          title: const Text('TWINT nicht verfügbar'),
          message: Text('Bitte QR in der echten Umgebung verwenden. Betrag: ${amount.toStringAsFixed(2)} CHF'),
          actions: [
            CupertinoActionSheetAction(
              onPressed: () => Navigator.pop(context),
              child: _TwintQrSheet(amount: amount),
            ),
          ],
          cancelButton: CupertinoActionSheetAction(
            onPressed: () => Navigator.pop(context),
            isDefaultAction: true,
            child: const Text('Schließen'),
          ),
        ),
      );
    }
  }

  Future<void> _generateMonthlyPdf() async {
    final dbService = DbService();
    final users = await dbService.getAllUserProfiles();
    final drinks = await dbService.getAllDrinks();
    final cons = await dbService.getAllConsumptions();
    final data = await ReportService.generateMonthlyReport(users: users, drinks: drinks, consumptions: cons);
    await Printing.layoutPdf(onLayout: (_) async => data);
  }

  Future<void> _openLeaderboard() async {
    final dbService = DbService();
    final users = await dbService.getAllUserProfiles();
    users.sort((a, b) => b.monthlyCount.compareTo(a.monthlyCount));
    await showCupertinoModalPopup(
      context: context,
      builder: (context) {
        return CupertinoActionSheet(
          title: const Text('Leaderboard – Dieser Monat'),
          actions: [
            CupertinoActionSheetAction(
              onPressed: () => Navigator.pop(context),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ...users.take(10).toList().asMap().entries.map((e) {
                    final rank = e.key + 1;
                    final u = e.value;
                    final title = rank == 1 ? 'Beer King 👑' : (rank == 2 ? 'Thirsty Dragon 🐉' : 'Durstheld');
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6.0),
                      child: Row(
                        children: [
                          Container(width: 28, alignment: Alignment.center, child: Text('$rank')),
                          const SizedBox(width: 8),
                          Expanded(child: Text(u.name)),
                          Text('${u.monthlyCount}'),
                          const SizedBox(width: 8),
                          Text(title),
                        ],
                      ),
                    );
                  })
                ],
              ),
            )
          ],
          cancelButton: CupertinoActionSheetAction(
            onPressed: () => Navigator.pop(context),
            isDefaultAction: true,
            child: const Text('Schließen'),
          ),
        );
      },
    );
  }

  Future<void> _showCupertinoInfo(String message) async {
    await showCupertinoDialog(
      context: context,
      builder: (_) => CupertinoAlertDialog(
        content: Text(message),
        actions: [
          CupertinoDialogAction(onPressed: () => Navigator.pop(context), child: const Text('OK')),
        ],
      ),
    );
  }
}

class _TwintQrSheet extends StatelessWidget {
  final double amount;
  const _TwintQrSheet({required this.amount});

  @override
  Widget build(BuildContext context) {
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
            backgroundColor: CupertinoColors.white,
            eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.circle, color: CupertinoColors.black),
          ),
          const SizedBox(height: 16),
          CupertinoButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Schließen'),
          ),
        ],
      ),
    );
  }
}


