import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MediaQuery(
      data: MediaQuery.of(context).copyWith(textScaler: TextScaler.noScaling),
      child: Column(children: [
        GestureDetector(onTap: () {}, child: const Text('Buy')),
        IconButton(onPressed: () {}, icon: const Icon(Icons.share)),
        Image.asset('assets/hero.png'),
        TextButton(
          style: TextButton.styleFrom(tapTargetSize: MaterialTapTargetSize.shrinkWrap),
          onPressed: () {},
          child: const Text('More'),
        ),
      ]),
    );
  }
}
