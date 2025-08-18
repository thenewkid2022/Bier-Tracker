import 'package:hive/hive.dart';

part 'user_profile.g.dart';

@HiveType(typeId: 1)
class UserProfile extends HiveObject {
  @HiveField(0)
  String id;
  @HiveField(1)
  String name;
  @HiveField(2)
  String? email;
  @HiveField(3)
  double balance;
  @HiveField(4)
  int monthlyCount; // Für Achievements/Leaderboard

  UserProfile({
    required this.id,
    required this.name,
    this.email,
    this.balance = 0.0,
    this.monthlyCount = 0,
  });
}


