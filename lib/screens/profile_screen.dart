import 'package:flutter/cupertino.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:intl/intl.dart';
import '../models/user_profile.dart';
import '../services/hive_service.dart';

class ProfileScreen extends StatelessWidget {
  final String userId;
  const ProfileScreen({super.key, required this.userId});

  @override
  Widget build(BuildContext context) {
    final user = HiveService.usersBox.get(userId)!;
    final df = NumberFormat.currency(locale: 'de_CH', symbol: 'CHF');
    
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: Text(user.name),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () => Navigator.pop(context),
          child: const Text('Fertig'),
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // User Profile Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: CupertinoColors.secondarySystemBackground,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: const BoxDecoration(
                        color: CupertinoColors.activeBlue,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        CupertinoIcons.person_fill,
                        size: 48,
                        color: CupertinoColors.white,
                      ),
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user.name,
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          if (user.email != null && user.email!.isNotEmpty) ...[
                            const SizedBox(height: 4),
                            Text(
                              user.email!,
                              style: const TextStyle(
                                color: CupertinoColors.secondaryLabel,
                                fontSize: 16,
                              ),
                            ),
                          ],
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            decoration: BoxDecoration(
                              color: user.balance < 0 
                                  ? CupertinoColors.systemRed.withValues(alpha: 0.1)
                                  : CupertinoColors.systemGreen.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: user.balance < 0 
                                    ? CupertinoColors.systemRed
                                    : CupertinoColors.systemGreen,
                                width: 1,
                              ),
                            ),
                            child: Text(
                              'Saldo: ${df.format(user.balance)}',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: user.balance < 0 
                                    ? CupertinoColors.systemRed
                                    : CupertinoColors.systemGreen,
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Monatliche Getränke: ${user.monthlyCount}',
                            style: const TextStyle(
                              color: CupertinoColors.secondaryLabel,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              // Achievements Section
              if (user.monthlyCount > 0) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: CupertinoColors.systemYellow.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: CupertinoColors.systemYellow,
                      width: 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        CupertinoIcons.rosette,
                        color: CupertinoColors.systemYellow,
                        size: 32,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _getAchievementTitle(user.monthlyCount),
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                                color: CupertinoColors.systemYellow,
                              ),
                            ),
                            Text(
                              'Du hast diesen Monat ${user.monthlyCount} Getränke konsumiert!',
                              style: const TextStyle(
                                color: CupertinoColors.secondaryLabel,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
              ],
              // History Section
              Row(
                children: [
                  const Icon(
                    CupertinoIcons.clock,
                    color: CupertinoColors.activeBlue,
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Konsum-Historie',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Expanded(child: _historyList(user)),
            ],
          ),
        ),
      ),
    );
  }

  String _getAchievementTitle(int count) {
    if (count >= 20) return 'Beer King 👑';
    if (count >= 15) return 'Thirsty Dragon 🐉';
    if (count >= 10) return 'Durstheld 🦸‍♂️';
    if (count >= 5) return 'Anfänger 🍺';
    return 'Erste Schritte 🚶‍♂️';
  }

  Widget _historyList(UserProfile user) {
    final dfDate = DateFormat('dd.MM.yyyy HH:mm');
    final dfMoney = NumberFormat.currency(locale: 'de_CH', symbol: 'CHF');
    final list = HiveService.consumptionsBox.values
        .where((c) => c.userId == user.id)
        .toList()
      ..sort((a, b) => b.timestamp.compareTo(a.timestamp));
    
    if (list.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              CupertinoIcons.drop,
              size: 64,
              color: CupertinoColors.systemGrey,
            ),
            SizedBox(height: 16),
            Text(
              'Noch keine Getränke konsumiert',
              style: TextStyle(
                fontSize: 18,
                color: CupertinoColors.systemGrey,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Gehe zurück und wähle dein erstes Getränk!',
              style: TextStyle(
                color: CupertinoColors.secondaryLabel,
              ),
            ),
          ],
        ),
      );
    }
    
    return ListView.separated(
      itemCount: list.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final c = list[index];
        final drink = HiveService.drinksBox.get(c.drinkId);
        final drinkName = drink?.name ?? 'Unbekannt';
        final iconKey = drink?.iconKey ?? 'beer';
        
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: CupertinoColors.secondarySystemBackground,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: CupertinoColors.systemGrey6,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  _getIconForDrink(iconKey),
                  color: CupertinoColors.activeBlue,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      drinkName,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      dfDate.format(c.timestamp),
                      style: const TextStyle(
                        color: CupertinoColors.secondaryLabel,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                '-${dfMoney.format(c.price)}',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: CupertinoColors.systemRed,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  IconData _getIconForDrink(String iconKey) {
    switch (iconKey) {
      case 'beer':
        return CupertinoIcons.drop;
      case 'soda':
        return CupertinoIcons.drop;
      case 'wine':
        return CupertinoIcons.drop;
      case 'coffee':
        return CupertinoIcons.drop;
      default:
        return CupertinoIcons.drop;
    }
  }
}


