export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  balance: number;
  monthlyCount: number;
}

export class UserProfileModel implements UserProfile {
  id: string;
  name: string;
  email?: string;
  balance: number;
  monthlyCount: number;

  constructor({
    id,
    name,
    email,
    balance = 0.0,
    monthlyCount = 0,
  }: UserProfile) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.balance = balance;
    this.monthlyCount = monthlyCount;
  }

  toMap(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      balance: this.balance,
      monthlyCount: this.monthlyCount,
    };
  }

  static fromMap(map: Record<string, any>): UserProfileModel {
    return new UserProfileModel({
      id: map.id as string,
      name: map.name as string,
      email: map.email as string,
      balance: map.balance as number,
      monthlyCount: map.monthlyCount as number,
    });
  }
}
