import 'package:hive/hive.dart';

part 'drink.g.dart';

@HiveType(typeId: 2)
class Drink extends HiveObject {
  @HiveField(0)
  String id;
  @HiveField(1)
  String name;
  @HiveField(2)
  double price;
  @HiveField(3)
  int stock;
  @HiveField(4)
  String iconKey; // z.B. 'beer', 'soda', für vorgegebene Icon-Auswahl

  Drink({
    required this.id,
    required this.name,
    required this.price,
    required this.stock,
    required this.iconKey,
  });
}


