

class Consumption {
  String id;
  String userId;
  String drinkId;
  DateTime timestamp;
  double price;

  Consumption({
    required this.id,
    required this.userId,
    required this.drinkId,
    required this.timestamp,
    required this.price,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'drinkId': drinkId,
      'timestamp': timestamp.millisecondsSinceEpoch,
      'price': price,
    };
  }

  factory Consumption.fromMap(Map<String, dynamic> map) {
    return Consumption(
      id: map['id'] as String,
      userId: map['userId'] as String,
      drinkId: map['drinkId'] as String,
      timestamp: DateTime.fromMillisecondsSinceEpoch(map['timestamp'] as int),
      price: map['price'] as double,
    );
  }
}


