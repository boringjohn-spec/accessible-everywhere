import React from 'react';
import { View, Text, Pressable, AccessibilityInfo } from 'react-native';

export function Screen({ status, navigation }) {
  React.useEffect(() => { AccessibilityInfo.announceForAccessibility(status); }, [status]);
  return (
    <View>
      <Text role="heading">Balance</Text>
      <Text maxFontSizeMultiplier={2.5}>Total</Text>
      <Pressable onPress={share} accessibilityRole="button" accessibilityLabel="Share" hitSlop={10}>
        <ShareIcon />
      </Pressable>
      <Pressable accessibilityLabel="Play" accessibilityRole="button" onPress={play}><Text>Play</Text></Pressable>
      <Text accessibilityLiveRegion="polite">{status}</Text>
      <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Details')}><Text>Details</Text></Pressable>
    </View>
  );
}
