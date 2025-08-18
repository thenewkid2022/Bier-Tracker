import 'package:hive/hive.dart';

part 'consumption.g.dart';

@HiveType(typeId: 3)
class Consumption extends HiveObject {
  @HiveField(0)
  String id;
  @HiveField(1)
  String userId;
  @HiveField(2)
  String drinkId;
  @HiveField(3)
  DateTime timestamp;
  @HiveField(4)
  double price;

  Consumption({
    required this.id,
    required this.userId,
    required this.drinkId,
    required this.timestamp,
    required this.price,
  });
}


