export interface Consumption {
  id: string;
  userId: string;
  drinkId: string;
  timestamp: number;
  price: number;
}

export class ConsumptionModel implements Consumption {
  id: string;
  userId: string;
  drinkId: string;
  timestamp: number;
  price: number;

  constructor({
    id,
    userId,
    drinkId,
    timestamp,
    price,
  }: Consumption) {
    this.id = id;
    this.userId = userId;
    this.drinkId = drinkId;
    this.timestamp = timestamp;
    this.price = price;
  }

  toMap(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      drinkId: this.drinkId,
      timestamp: this.timestamp,
      price: this.price,
    };
  }

  static fromMap(map: Record<string, any>): ConsumptionModel {
    return new ConsumptionModel({
      id: map.id as string,
      userId: map.userId as string,
      drinkId: map.drinkId as string,
      timestamp: map.timestamp as number,
      price: map.price as number,
    });
  }

  getDate(): Date {
    return new Date(this.timestamp);
  }

  getFormattedDate(): string {
    return new Date(this.timestamp).toLocaleDateString('de-CH');
  }
}
