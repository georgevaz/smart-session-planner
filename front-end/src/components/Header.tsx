import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../theme';

type Props = {
  title: string;
  date: string;
  subtitle: string;
  selectedView?: 'today' | 'week';
  onViewChange?: (view: 'today' | 'week') => void;
};

const Header: React.FC<Props> = ({ title, date, subtitle, selectedView, onViewChange }) => {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={theme.typography.h1}>{title}</Text>
        <Text style={[theme.typography.body, { color: theme.colors.primary, marginTop: 4 }]}>
          {date}
        </Text>
        <Text style={[theme.typography.body, { color: theme.colors.muted, marginTop: 4 }]}>
          {subtitle}
        </Text>
      </View>

      {selectedView && onViewChange && (
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedView === 'today' && styles.toggleButtonActive,
            ]}
            onPress={() => onViewChange('today')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                theme.typography.label,
                { color: theme.colors.buttonText },
              ]}
            >
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedView === 'week' && styles.toggleButtonActive,
            ]}
            onPress={() => onViewChange('week')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                theme.typography.label,
                { color: theme.colors.buttonText },
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 34,
  },
  textContainer: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 15,
  },
  toggleButtonActive: {
    backgroundColor: '#EDEDED',
  },
});

export default Header;
