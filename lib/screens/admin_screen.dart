import 'package:flutter/cupertino.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:intl/intl.dart';
import 'package:uuid/uuid.dart';
import '../models/drink.dart';
import '../models/user_profile.dart';
import '../services/hive_service.dart';
import '../widgets/drink_icon.dart';

class AdminScreen extends StatefulWidget {
  const AdminScreen({super.key});

  @override
  State<AdminScreen> createState() => _AdminScreenState();
}

class _AdminScreenState extends State<AdminScreen> {
  int _selectedTabIndex = 0;

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        middle: Text('Admin'),
      ),
      child: SafeArea(
        child: Column(
          children: [
            // Custom Tab Bar
            Container(
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: CupertinoColors.separator, width: 0.5),
                ),
              ),
              child: Row(
                children: [
                  _buildTabButton('Getränke', 0),
                  _buildTabButton('Lager', 1),
                  _buildTabButton('Nutzer', 2),
                ],
              ),
            ),
            // Tab Content
            Expanded(
              child: IndexedStack(
                index: _selectedTabIndex,
                children: const [
                  _DrinksTab(),
                  _InventoryTab(),
                  _UsersTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTabButton(String title, int index) {
    final isSelected = _selectedTabIndex == index;
    return Expanded(
      child: CupertinoButton(
        padding: const EdgeInsets.symmetric(vertical: 16),
        color: CupertinoColors.systemBackground,
        borderRadius: BorderRadius.zero,
        onPressed: () => setState(() => _selectedTabIndex = index),
        child: Text(
          title,
          style: TextStyle(
            color: isSelected ? CupertinoColors.activeBlue : CupertinoColors.label,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
          ),
        ),
      ),
    );
  }
}

class _DrinksTab extends StatefulWidget {
  const _DrinksTab();

  @override
  State<_DrinksTab> createState() => _DrinksTabState();
}

class _DrinksTabState extends State<_DrinksTab> {
  final nameCtrl = TextEditingController();
  final priceCtrl = TextEditingController();
  final stockCtrl = TextEditingController(text: '0');
  String iconKey = 'beer';

  @override
  void dispose() {
    nameCtrl.dispose();
    priceCtrl.dispose();
    stockCtrl.dispose();
    super.dispose();
  }

  Future<void> addDrink() async {
    final name = nameCtrl.text.trim();
    final price = double.tryParse(priceCtrl.text.replaceAll(',', '.')) ?? 0;
    final stock = int.tryParse(stockCtrl.text) ?? 0;
    
    if (name.isEmpty || price <= 0) {
      await _showAlert('Fehler', 'Bitte fülle alle Felder korrekt aus.');
      return;
    }
    
    final d = Drink(
      id: const Uuid().v4(),
      name: name,
      price: price,
      stock: stock,
      iconKey: iconKey,
    );
    
    await HiveService.drinksBox.put(d.id, d);
    nameCtrl.clear();
    priceCtrl.clear();
    stockCtrl.text = '0';
    
    if (mounted) {
      await _showAlert('Erfolg', 'Getränk wurde gespeichert.');
    }
  }

  Future<void> _showAlert(String title, String message) async {
    await showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Getränk hinzufügen',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 16),
          // Form fields
          CupertinoTextField(
            controller: nameCtrl,
            placeholder: 'Name des Getränks',
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              border: Border.all(color: CupertinoColors.separator),
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: CupertinoTextField(
                  controller: priceCtrl,
                  placeholder: 'Preis (CHF)',
                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    border: Border.all(color: CupertinoColors.separator),
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: CupertinoTextField(
                  controller: stockCtrl,
                  placeholder: 'Start-Lager',
                  keyboardType: TextInputType.number,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    border: Border.all(color: CupertinoColors.separator),
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    border: Border.all(color: CupertinoColors.separator),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: CupertinoButton(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    color: CupertinoColors.systemBackground,
                    onPressed: () => _showIconPicker(),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(_getIconLabel(iconKey)),
                        const Icon(CupertinoIcons.chevron_down),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              CupertinoButton(
                color: CupertinoColors.activeBlue,
                onPressed: addDrink,
                child: const Text('Speichern'),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Container(
            height: 1,
            color: CupertinoColors.separator,
          ),
          const SizedBox(height: 16),
          const Text(
            'Aktuelle Getränke',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: ValueListenableBuilder<Box<Drink>>(
              valueListenable: HiveService.drinksBox.listenable(),
              builder: (context, box, _) {
                final list = box.values.toList();
                if (list.isEmpty) {
                  return const Center(
                    child: Text(
                      'Noch keine Getränke vorhanden',
                      style: TextStyle(color: CupertinoColors.secondaryLabel),
                    ),
                  );
                }
                return ListView.separated(
                  itemCount: list.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final d = list[index];
                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: CupertinoColors.secondarySystemBackground,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          DrinkIcon(iconKey: d.iconKey, size: 48),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  d.name,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Lager: ${d.stock} | ${d.price.toStringAsFixed(2)} CHF',
                                  style: const TextStyle(
                                    color: CupertinoColors.secondaryLabel,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  String _getIconLabel(String key) {
    switch (key) {
      case 'beer':
        return '🍺 Bier';
      case 'soda':
        return '🥤 Softdrink';
      case 'wine':
        return '🍷 Wein';
      case 'coffee':
        return '☕ Kaffee';
      default:
        return '🍺 Bier';
    }
  }

  void _showIconPicker() {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: const Text('Icon auswählen'),
        actions: [
          CupertinoActionSheetAction(
            onPressed: () {
              setState(() => iconKey = 'beer');
              Navigator.pop(context);
            },
            child: const Text('🍺 Bier'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              setState(() => iconKey = 'soda');
              Navigator.pop(context);
            },
            child: const Text('🥤 Softdrink'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              setState(() => iconKey = 'wine');
              Navigator.pop(context);
            },
            child: const Text('🍷 Wein'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              setState(() => iconKey = 'coffee');
              Navigator.pop(context);
            },
            child: const Text('☕ Kaffee'),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          onPressed: () => Navigator.pop(context),
          child: const Text('Abbrechen'),
        ),
      ),
    );
  }
}

class _InventoryTab extends StatelessWidget {
  const _InventoryTab();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Lagerverwaltung',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ValueListenableBuilder<Box<Drink>>(
              valueListenable: HiveService.drinksBox.listenable(),
              builder: (context, box, _) {
                final list = box.values.toList();
                if (list.isEmpty) {
                  return const Center(
                    child: Text(
                      'Keine Getränke vorhanden',
                      style: TextStyle(color: CupertinoColors.secondaryLabel),
                    ),
                  );
                }
                return ListView.separated(
                  itemCount: list.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final d = list[index];
                    return _InventoryItem(drink: d);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _InventoryItem extends StatefulWidget {
  final Drink drink;
  const _InventoryItem({required this.drink});

  @override
  State<_InventoryItem> createState() => _InventoryItemState();
}

class _InventoryItemState extends State<_InventoryItem> {
  final addCtrl = TextEditingController();

  @override
  void dispose() {
    addCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final low = widget.drink.stock < 10;
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: CupertinoColors.secondarySystemBackground,
        borderRadius: BorderRadius.circular(12),
        border: low ? Border.all(color: CupertinoColors.systemRed, width: 2) : null,
      ),
      child: Row(
        children: [
          DrinkIcon(iconKey: widget.drink.iconKey, size: 48),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.drink.name,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Text(
                      'Aktuell: ${widget.drink.stock}',
                      style: TextStyle(
                        color: low ? CupertinoColors.systemRed : CupertinoColors.secondaryLabel,
                        fontWeight: low ? FontWeight.w600 : FontWeight.w400,
                      ),
                    ),
                    if (low) ...[
                      const SizedBox(width: 8),
                      const Icon(
                        CupertinoIcons.exclamationmark_triangle_fill,
                        color: CupertinoColors.systemRed,
                        size: 16,
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 16),
          SizedBox(
            width: 80,
            child: CupertinoTextField(
              controller: addCtrl,
              placeholder: '+Menge',
              keyboardType: TextInputType.number,
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                border: Border.all(color: CupertinoColors.separator),
                borderRadius: BorderRadius.circular(6),
              ),
            ),
          ),
          const SizedBox(width: 8),
          CupertinoButton(
            color: CupertinoColors.activeGreen,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            onPressed: () async {
              final add = int.tryParse(addCtrl.text) ?? 0;
              if (add <= 0) return;
              widget.drink.stock += add;
              await widget.drink.save();
              addCtrl.clear();
              setState(() {});
            },
            child: const Text('+'),
          ),
        ],
      ),
    );
  }
}

class _UsersTab extends StatelessWidget {
  const _UsersTab();

  @override
  Widget build(BuildContext context) {
    final df = NumberFormat.currency(locale: 'de_CH', symbol: 'CHF');
    
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Nutzerverwaltung',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ValueListenableBuilder<Box<UserProfile>>(
              valueListenable: HiveService.usersBox.listenable(),
              builder: (context, box, _) {
                final users = box.values.toList();
                if (users.isEmpty) {
                  return const Center(
                    child: Text(
                      'Keine Nutzer vorhanden',
                      style: TextStyle(color: CupertinoColors.secondaryLabel),
                    ),
                  );
                }
                return ListView.separated(
                  itemCount: users.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, i) {
                    final u = users[i];
                    return Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: CupertinoColors.secondarySystemBackground,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            CupertinoIcons.person_circle_fill,
                            size: 48,
                            color: CupertinoColors.activeBlue,
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  u.name,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  'Saldo: ${df.format(u.balance)} | Monat: ${u.monthlyCount}',
                                  style: const TextStyle(
                                    color: CupertinoColors.secondaryLabel,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          CupertinoButton(
                            color: CupertinoColors.systemOrange,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            onPressed: () async {
                              final confirmed = await showCupertinoDialog<bool>(
                                context: context,
                                builder: (context) => CupertinoAlertDialog(
                                  title: const Text('Saldo zurücksetzen'),
                                  content: Text('Möchtest du den Saldo von ${u.name} wirklich auf 0 setzen?'),
                                  actions: [
                                    CupertinoDialogAction(
                                      onPressed: () => Navigator.pop(context, false),
                                      child: const Text('Abbrechen'),
                                    ),
                                    CupertinoDialogAction(
                                      onPressed: () => Navigator.pop(context, true),
                                      isDestructiveAction: true,
                                      child: const Text('Zurücksetzen'),
                                    ),
                                  ],
                                ),
                              );
                              if (confirmed == true) {
                                u.balance = 0;
                                u.monthlyCount = 0;
                                await u.save();
                              }
                            },
                            child: const Text('Reset'),
                          ),
                          const SizedBox(width: 8),
                          CupertinoButton(
                            color: CupertinoColors.systemRed,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            onPressed: () async {
                              final confirmed = await showCupertinoDialog<bool>(
                                context: context,
                                builder: (context) => CupertinoAlertDialog(
                                  title: const Text('Nutzer löschen'),
                                  content: Text('Möchtest du ${u.name} wirklich löschen?'),
                                  actions: [
                                    CupertinoDialogAction(
                                      onPressed: () => Navigator.pop(context, false),
                                      child: const Text('Abbrechen'),
                                    ),
                                    CupertinoDialogAction(
                                      onPressed: () => Navigator.pop(context, true),
                                      isDestructiveAction: true,
                                      child: const Text('Löschen'),
                                    ),
                                  ],
                                ),
                              );
                              if (confirmed == true) {
                                await box.delete(u.id);
                              }
                            },
                            child: const Text('Löschen'),
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}


