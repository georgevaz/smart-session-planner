import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Card } from '../components/Card';
import { Icon, PlusSvg, TrashSvg } from '../components/Icon';
import { PriorityDots } from '../components/PriorityDots';
import {
  getSessionTypes,
  createSessionType,
  deleteSessionType,
  SessionType,
  CreateSessionType,
} from '../api/session-types';
import theme from '../theme';

const SessionTypesScreen: React.FC<{ visible: boolean; onClose: () => void }> = ({
  visible,
  onClose,
}) => {
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState(3);

  useEffect(() => {
    if (visible) {
      loadSessionTypes();
    } else {
      // Reset form state when modal closes
      setShowForm(false);
      setName('');
      setCategory('');
      setPriority(3);
    }
  }, [visible]);

  const loadSessionTypes = async () => {
    try {
      setLoading(true);
      const data = await getSessionTypes();
      setSessionTypes(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load session types');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a name');
      return;
    }

    if (!category.trim()) {
      Alert.alert('Validation Error', 'Please enter a category');
      return;
    }

    try {
      setCreating(true);
      const newSessionType: CreateSessionType = {
        name: name.trim(),
        category: category.trim(),
        priority,
      };

      await createSessionType(newSessionType);
      Alert.alert('Success', 'Session type created successfully!');

      // Reset form
      setName('');
      setCategory('');
      setPriority(3);
      setShowForm(false);

      // Reload the list
      await loadSessionTypes();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create session type');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, typeName: string) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${typeName}"? This will also delete all associated sessions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSessionType(id);
              Alert.alert('Success', 'Session type deleted successfully!');
              await loadSessionTypes();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete session type');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[theme.typography.body, { color: theme.colors.buttonPrimary }]}>
              Close
            </Text>
          </TouchableOpacity>
          <Text style={theme.typography.h1}>Session Types</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Create Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowForm(!showForm)}
            activeOpacity={0.7}
          >
            <Icon icon={PlusSvg} size={20} color={theme.colors.surface} />
            <Text style={[theme.typography.label, { color: theme.colors.surface }]}>
              Add Session Type
            </Text>
          </TouchableOpacity>

          {/* Create Form */}
          {showForm && (
            <Card bordered paddingHorizontal="xl" paddingVertical="xl" style={styles.formCard}>
              <Text style={[theme.typography.h3, styles.formTitle]}>
                New Session Type
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g., Deep Work, Exercise"
                  placeholderTextColor={theme.colors.muted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <TextInput
                  style={styles.input}
                  value={category}
                  onChangeText={setCategory}
                  placeholder="e.g., Work, Health, Learning"
                  placeholderTextColor={theme.colors.muted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Priority (1-5)</Text>
                <View style={styles.prioritySelector}>
                  {[1, 2, 3, 4, 5].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityButton,
                        priority === p && styles.priorityButtonActive,
                      ]}
                      onPress={() => setPriority(p)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          priority === p && styles.priorityTextActive,
                        ]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowForm(false);
                    setName('');
                    setCategory('');
                    setPriority(3);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[theme.typography.label, { color: theme.colors.buttonText }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleCreate}
                  disabled={creating}
                  activeOpacity={0.7}
                >
                  {creating ? (
                    <ActivityIndicator size="small" color={theme.colors.surface} />
                  ) : (
                    <Text style={[theme.typography.label, { color: theme.colors.surface }]}>
                      Create
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </Card>
          )}

          {/* Session Types List */}
          <View style={styles.section}>
            <Text style={theme.typography.h2}>All Session Types</Text>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.buttonPrimary} />
              </View>
            ) : sessionTypes.length === 0 ? (
              <Text style={styles.emptyText}>
                No session types yet. Create one to get started!
              </Text>
            ) : (
              <View style={styles.typesList}>
                {sessionTypes.map((type) => (
                  <Card
                    key={type.id}
                    bordered
                    size="full"
                    noPadding
                  >
                    <View style={styles.typeCard}>
                      <View style={styles.typeInfo}>
                        <View style={styles.typeHeader}>
                          <Text style={theme.typography.h3}>{type.name}</Text>
                          <PriorityDots priority={type.priority} />
                        </View>
                        <Text style={[theme.typography.body, { color: theme.colors.secondary }]}>
                          {type.category}
                        </Text>
                        <Text style={[theme.typography.caption, { color: theme.colors.tertiary }]}>
                          {type.completedCount} completed sessions
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(type.id, type.name)}
                        activeOpacity={0.7}
                      >
                        <Icon icon={TrashSvg} size={20} color={theme.colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </Card>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: {
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
    paddingVertical: theme.spacing.sm,
  },
  scrollContent: {
    padding: theme.spacing.xl,
    gap: theme.spacing.xl,
    paddingBottom: 40,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.buttonPrimary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 16,
  },
  formCard: {
    gap: theme.spacing.lg,
  },
  formTitle: {
    marginBottom: theme.spacing.sm,
  },
  formGroup: {
    gap: theme.spacing.sm,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  input: {
    ...theme.typography.body,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.primary,
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  priorityButtonActive: {
    backgroundColor: theme.colors.buttonPrimary,
    borderColor: theme.colors.buttonPrimary,
  },
  priorityText: {
    ...theme.typography.body,
    color: theme.colors.tertiary,
  },
  priorityTextActive: {
    color: theme.colors.surface,
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    paddingVertical: theme.spacing.sm,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  submitButton: {
    flex: 1,
    backgroundColor: theme.colors.buttonPrimary,
    paddingVertical: theme.spacing.sm,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  section: {
    gap: theme.spacing.lg,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
  },
  typesList: {
    gap: theme.spacing.md,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  typeInfo: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  deleteButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.md,
  },
});

export default SessionTypesScreen;
