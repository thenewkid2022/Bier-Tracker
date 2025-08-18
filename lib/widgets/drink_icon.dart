import 'package:flutter/cupertino.dart';

IconData iconForKey(String key) {
  switch (key) {
    case 'beer':
      return CupertinoIcons.drop;
    case 'soda':
      return CupertinoIcons.drop;
    case 'wine':
      return CupertinoIcons.drop;
    case 'coffee':
      return CupertinoIcons.drop;
    default:
      return CupertinoIcons.drop;
  }
}

class DrinkIcon extends StatelessWidget {
  final String iconKey;
  final double size;
  final Color? color;
  
  const DrinkIcon({
    super.key,
    required this.iconKey,
    this.size = 48,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Icon(
      iconForKey(iconKey),
      size: size,
      color: color ?? CupertinoColors.activeBlue,
    );
  }
}


