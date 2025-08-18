part of 'consumption.dart';

class ConsumptionAdapter extends TypeAdapter<Consumption> {
  @override
  final int typeId = 3;

  @override
  Consumption read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{};
    for (int i = 0; i < numOfFields; i++) {
      fields[reader.readByte()] = reader.read();
    }
    return Consumption(
      id: fields[0] as String,
      userId: fields[1] as String,
      drinkId: fields[2] as String,
      timestamp: fields[3] as DateTime,
      price: fields[4] as double,
    );
  }

  @override
  void write(BinaryWriter writer, Consumption obj) {
    writer
      ..writeByte(5)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.userId)
      ..writeByte(2)
      ..write(obj.drinkId)
      ..writeByte(3)
      ..write(obj.timestamp)
      ..writeByte(4)
      ..write(obj.price);
  }
}


