import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import theme from '../theme';
import {
  AvailabilityWindow,
  getAvailabilityWindows,
  createAvailabilityWindow,
  deleteAvailabilityWindow,
  getDayName,
  getShortDayName,
} from '../api/availability';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const AvailabilityScreen: React.FC<Props> = ({ visible, onClose }) => {
  const [windows, setWindows] = useState<AvailabilityWindow[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1); // Default to Monday
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  useEffect(() => {
    if (visible) {
      loadWindows();
    }
  }, [visible]);

  const loadWindows = async () => {
    try {
      setLoading(true);
      const data = await getAvailabilityWindows();
      setWindows(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load availability windows');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = useCallback(async () => {
    try {
      setLoading(true);
      await createAvailabilityWindow({
        dayOfWeek: selectedDay,
        startTime,
        endTime,
      });
      setShowAddForm(false);
      await loadWindows();
      Alert.alert('Success', 'Availability window added');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add availability window');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedDay, startTime, endTime]);

  const handleDelete = useCallback(async (id: string) => {
    Alert.alert(
      'Delete Window',
      'Are you sure you want to delete this availability window?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteAvailabilityWindow(id);
              await loadWindows();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete availability window');
              console.error(error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }, []);

  // Group windows by day of week
  const groupedWindows = useMemo(() => {
    return windows.reduce((acc, window) => {
      const day = window.dayOfWeek;
      if (!acc[day]) acc[day] = [];
      acc[day].push(window);
      return acc;
    }, {} as Record<number, AvailabilityWindow[]>);
  }, [windows]);

  const toggleAddForm = useCallback(() => {
    setShowAddForm(prev => !prev);
  }, []);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
          <Text style={theme.typography.h2}>Availability</Text>
          <TouchableOpacity onPress={toggleAddForm}>
            <Text style={styles.addButton}>{showAddForm ? 'Cancel' : 'Add'}</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.buttonPrimary} />
          </View>
        )}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Add Form */}
          {showAddForm && (
            <View style={styles.addForm}>
              <Text style={theme.typography.h3}>Add Availability Window</Text>

              {/* Day Selector */}
              <View style={styles.daySelector}>
                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      selectedDay === day && styles.dayButtonActive,
                    ]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        selectedDay === day && styles.dayButtonTextActive,
                      ]}
                    >
                      {getShortDayName(day)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Time Display (TODO: Add proper time picker) */}
              <View style={styles.timeRow}>
                <View style={styles.timeInput}>
                  <Text style={theme.typography.caption}>Start Time</Text>
                  <Text style={theme.typography.body}>{startTime}</Text>
                </View>
                <Text style={theme.typography.body}>-</Text>
                <View style={styles.timeInput}>
                  <Text style={theme.typography.caption}>End Time</Text>
                  <Text style={theme.typography.body}>{endTime}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAdd}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>Add Window</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* List of Windows */}
          <View style={styles.windowsList}>
            {windows.length === 0 && !loading && (
              <Text style={styles.emptyText}>
                No availability windows yet. Add some to get started!
              </Text>
            )}

            {[0, 1, 2, 3, 4, 5, 6].map((day) => {
              const dayWindows = groupedWindows[day] || [];
              if (dayWindows.length === 0) return null;

              return (
                <View key={day} style={styles.daySection}>
                  <Text style={theme.typography.h3}>{getDayName(day)}</Text>
                  {dayWindows.map((window) => (
                    <View key={window.id} style={styles.windowCard}>
                      <View style={styles.windowInfo}>
                        <Text style={theme.typography.body}>
                          {window.startTime} - {window.endTime}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(window.id)}
                        disabled={loading}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    ...theme.typography.body,
    color: theme.colors.buttonPrimary,
    fontWeight: '500',
  },
  addButton: {
    ...theme.typography.body,
    color: theme.colors.buttonPrimary,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
  },
  addForm: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
  },
  daySelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  dayButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  dayButtonActive: {
    backgroundColor: theme.colors.buttonPrimary,
  },
  dayButtonText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  dayButtonTextActive: {
    color: theme.colors.surface,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
  },
  timeInput: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    gap: theme.spacing.xs,
  },
  submitButton: {
    paddingVertical: 14,
    backgroundColor: theme.colors.buttonPrimary,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
  },
  submitButtonText: {
    ...theme.typography.body,
    color: theme.colors.surface,
    fontWeight: '600',
  },
  windowsList: {
    gap: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 40,
  },
  daySection: {
    gap: theme.spacing.md,
  },
  windowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
  },
  windowInfo: {
    flex: 1,
  },
  deleteButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.cardRed,
    borderRadius: theme.radius.md,
  },
  deleteButtonText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    fontWeight: '500',
  },
});

export default AvailabilityScreen;
