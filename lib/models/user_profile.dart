

class UserProfile {
  String id;
  String name;
  String? email;
  double balance;
  int monthlyCount;

  UserProfile({
    required this.id,
    required this.name,
    this.email,
    this.balance = 0.0,
    this.monthlyCount = 0,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'balance': balance,
      'monthlyCount': monthlyCount,
    };
  }

  factory UserProfile.fromMap(Map<String, dynamic> map) {
    return UserProfile(
      id: map['id'] as String,
      name: map['name'] as String,
      email: map['email'] as String?,
      balance: map['balance'] as double,
      monthlyCount: map['monthlyCount'] as int,
    );
  }
}


