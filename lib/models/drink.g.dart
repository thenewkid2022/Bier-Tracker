part of 'drink.dart';

class DrinkAdapter extends TypeAdapter<Drink> {
  @override
  final int typeId = 2;

  @override
  Drink read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{};
    for (int i = 0; i < numOfFields; i++) {
      fields[reader.readByte()] = reader.read();
    }
    return Drink(
      id: fields[0] as String,
      name: fields[1] as String,
      price: fields[2] as double,
      stock: fields[3] as int,
      iconKey: fields[4] as String,
    );
  }

  @override
  void write(BinaryWriter writer, Drink obj) {
    writer
      ..writeByte(5)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.name)
      ..writeByte(2)
      ..write(obj.price)
      ..writeByte(3)
      ..write(obj.stock)
      ..writeByte(4)
      ..write(obj.iconKey);
  }
}


