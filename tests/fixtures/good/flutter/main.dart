import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

void main() {
  runApp(const MyApp());
  if (kIsWeb) SemanticsBinding.instance.ensureSemantics();
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      ElevatedButton(onPressed: () {}, child: const Text('Buy')),
      IconButton(onPressed: () {}, icon: const Icon(Icons.share), tooltip: 'Share'),
      Image.asset('assets/hero.png', semanticLabel: 'Summer sale: 30% off all tents'),
      Image.asset('assets/divider.png', excludeFromSemantics: true),
      Semantics(
        button: true,
        label: 'Open profile',
        child: GestureDetector(onTap: () {}, child: const CircleAvatar()),
      ),
    ]);
  }
}
