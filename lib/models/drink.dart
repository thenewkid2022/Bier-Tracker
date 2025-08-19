

class Drink {
  String id;
  String name;
  double price;
  int stock;
  String iconKey;

  Drink({
    required this.id,
    required this.name,
    required this.price,
    required this.stock,
    required this.iconKey,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'price': price,
      'stock': stock,
      'iconKey': iconKey,
    };
  }

  factory Drink.fromMap(Map<String, dynamic> map) {
    return Drink(
      id: map['id'] as String,
      name: map['name'] as String,
      price: map['price'] as double,
      stock: map['stock'] as int,
      iconKey: map['iconKey'] as String,
    );
  }
}


