import React from 'react';
import { View, Text, Pressable, TouchableOpacity, Image, AccessibilityInfo, PanResponder } from 'react-native';

export function Screen({ status, navigation }) {
  const pan = PanResponder.create({});
  AccessibilityInfo.setAccessibilityFocus(1);
  return (
    <View experimental_accessibilityOrder={['a', 'b']}>
      <Text allowFontScaling={false}>Balance</Text>
      <Text maxFontSizeMultiplier={1.2}>Total</Text>
      <TouchableOpacity onPress={share}>
        <Image source={shareIcon} />
      </TouchableOpacity>
      <Pressable accessibilityLabel="Play button" onPress={play}><Text>Play</Text></Pressable>
      <Text accessibilityLiveRegion="polite">{status}</Text>
      <Pressable accessibilityRole="link" onPress={() => navigation.navigate('Details')}><Text>Details</Text></Pressable>
    </View>
  );
}
