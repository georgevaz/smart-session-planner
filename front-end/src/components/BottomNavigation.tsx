import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../theme';

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

type Props = {
  items: NavItem[];
  activeId: string;
  onPress: (id: string) => void;
};

const BottomNavigation: React.FC<Props> = ({ items, activeId, onPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() => onPress(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>{item.icon}</View>
              <Text
                style={[
                  theme.typography.caption,
                  { color: isActive ? theme.colors.primary : theme.colors.iconGray },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 1,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 43,
    paddingVertical: 16,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BottomNavigation;
