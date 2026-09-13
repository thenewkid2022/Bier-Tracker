export interface Consumption {
  id: string;
  userId: string;
  drinkId: string;
  timestamp: number;
  price: number;
  quantity?: number;
  drinkName?: string;
}

export class ConsumptionModel implements Consumption {
  id: string;
  userId: string;
  drinkId: string;
  timestamp: number;
  price: number;
  quantity?: number;
  drinkName?: string;

  constructor({
    id,
    userId,
    drinkId,
    timestamp,
    price,
    quantity,
    drinkName,
  }: Consumption) {
    this.id = id;
    this.userId = userId;
    this.drinkId = drinkId;
    this.timestamp = timestamp;
    this.price = price;
    this.quantity = quantity;
    this.drinkName = drinkName;
  }

  toMap(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      drinkId: this.drinkId,
      timestamp: this.timestamp,
      price: this.price,
      quantity: this.quantity,
      drinkName: this.drinkName,
    };
  }

  static fromMap(map: Record<string, any>): ConsumptionModel {
    return new ConsumptionModel({
      id: map.id as string,
      userId: map.userId as string,
      drinkId: map.drinkId as string,
      timestamp: map.timestamp as number,
      price: map.price as number,
      quantity: map.quantity as number,
      drinkName: map.drinkName as string,
    });
  }

  getDate(): Date {
    return new Date(this.timestamp);
  }

  getFormattedDate(): string {
    return new Date(this.timestamp).toLocaleDateString('de-CH');
  }
}
