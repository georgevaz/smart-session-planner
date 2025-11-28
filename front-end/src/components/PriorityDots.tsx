import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface PriorityDotsProps {
  priority: number; // 0-5
  totalDots?: number;
}

export function PriorityDots({ priority, totalDots = 5 }: PriorityDotsProps) {
  const dots = Array.from({ length: totalDots }, (_, i) => i < priority);

  return (
    <View style={styles.container}>
      {dots.map((filled, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            { backgroundColor: filled ? colors.accentDark : colors.borderLight },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
