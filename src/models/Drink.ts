export interface Drink {
  id: string;
  name: string;
  price: number;
  stock: number;
  iconKey: string;
}

export class DrinkModel implements Drink {
  id: string;
  name: string;
  price: number;
  stock: number;
  iconKey: string;

  constructor({
    id,
    name,
    price,
    stock,
    iconKey,
  }: Drink) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.stock = stock;
    this.iconKey = iconKey;
  }

  toMap(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      stock: this.stock,
      iconKey: this.iconKey,
    };
  }

  static fromMap(map: Record<string, any>): DrinkModel {
    return new DrinkModel({
      id: map.id as string,
      name: map.name as string,
      price: map.price as number,
      stock: map.stock as number,
      iconKey: map.iconKey as string,
    });
  }
}
