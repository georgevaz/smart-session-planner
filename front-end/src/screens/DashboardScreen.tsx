import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Header from '../components/Header';
import { Card } from '../components/Card';
import BottomNavigation from '../components/BottomNavigation';
import {
  Icon,
  CalendarSvg,
  CheckSvg,
  PlusSvg,
  HomeSvg,
  BarGraphSvg,
  GearSvg,
  BrainSvg,
  MugSvg,
  ArrowSvg,
} from '../components/Icon';
import AvailabilityScreen from './AvailabilityScreen';
import {
  Session,
  Suggestion,
  getSessions,
  getSuggestions,
  acceptSuggestion,
  updateSession,
  formatTime,
  getRelativeDay,
} from '../api/sessions';
import { getStats, Stats } from '../api/stats';
import { getSessionTypes, SessionType } from '../api/sessionTypes';
import { getAvailabilityWindows, AvailabilityWindow } from '../api/availability';
import { summarizeAvailability, getWeekAvailability } from '../utils/availabilityHelpers';
import theme from '../theme';

// Get the current date for the application (Monday, November 17, 2025 for demo)
const getCurrentDate = () => {
  return new Date('2025-11-17T12:00:00');
};

// Helper function to get today's date range
const getTodayRange = () => {
  const today = getCurrentDate();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { today, tomorrow };
};

// Helper function to calculate session end time
const getSessionEndTime = (scheduledAt: string, durationMinutes: number): string => {
  const endDate = new Date(new Date(scheduledAt).getTime() + durationMinutes * 60000);
  return formatTime(endDate.toISOString());
};

// Helper function to get icon for session type
const getSessionIcon = (sessionTypeName: string, index: number) => {
  // This is a temporary mapping based on index
  // TODO: Map based on actual session type properties
  const iconMap = [
    { svg: BrainSvg, bgColor: theme.colors.cardMint, color: theme.colors.workoutStroke },
    { svg: MugSvg, bgColor: theme.colors.cardGray, color: theme.colors.primary },
    { svg: BrainSvg, bgColor: theme.colors.cardLavender, color: theme.colors.deepWorkStroke },
  ];

  const mapping = iconMap[index % iconMap.length];
  return {
    icon: <Icon icon={mapping.svg} size={16} color={mapping.color} />,
    bgColor: mapping.bgColor,
  };
};

const DashboardScreen: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'today' | 'week'>('today');
  const [activeNavItem, setActiveNavItem] = useState('home');
  const [availabilityModalVisible, setAvailabilityModalVisible] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [availabilityWindows, setAvailabilityWindows] = useState<AvailabilityWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get today's date range for filtering sessions
      const { today, tomorrow } = getTodayRange();

      const [sessionsData, statsData, sessionTypesData, availabilityData] = await Promise.all([
        getSessions({
          startDate: today.toISOString(),
          endDate: tomorrow.toISOString(),
        }),
        getStats(),
        getSessionTypes(),
        getAvailabilityWindows(),
      ]);

      setSessions(sessionsData);
      setStats(statsData);
      setSessionTypes(sessionTypesData);
      setAvailabilityWindows(availabilityData);

      // Get suggestions for all session types
      if (sessionTypesData.length > 0) {
        const allSuggestions: Suggestion[] = [];

        for (const sessionType of sessionTypesData) {
          try {
            const suggestionsData = await getSuggestions({
              sessionTypeId: sessionType.id,
              duration: sessionType.name === 'Language Practice' ? 30 : 60,
              daysAhead: 7,
              limit: 1, // Get top suggestion for each type
            });
            if (suggestionsData.suggestions.length > 0) {
              allSuggestions.push(suggestionsData.suggestions[0]);
            }
          } catch (error) {
            console.error(`Error getting suggestions for ${sessionType.name}:`, error);
          }
        }

        // Sort by score and take top 3
        allSuggestions.sort((a, b) => b.score - a.score);
        setSuggestions(allSuggestions.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = useCallback(async (suggestion: Suggestion) => {
    try {
      setRefreshing(true);
      await acceptSuggestion({
        sessionTypeId: suggestion.sessionType.id,
        scheduledAt: suggestion.suggestedStart,
        duration: suggestion.duration,
      });
      Alert.alert('Success', 'Session scheduled successfully!');
      await loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept suggestion');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleAdjust = useCallback((suggestion: Suggestion) => {
    Alert.alert('Adjust Time', 'Time adjustment feature coming soon!');
  }, []);

  const handleToggleComplete = useCallback(async (session: Session) => {
    // Optimistic update - update UI immediately
    const updatedCompleted = !session.completed;
    setSessions(prevSessions =>
      prevSessions.map(s =>
        s.id === session.id ? { ...s, completed: updatedCompleted } : s
      )
    );

    try {
      // Update in backend
      await updateSession(session.id, {
        completed: updatedCompleted,
      });
    } catch (error: any) {
      // Revert on error
      setSessions(prevSessions =>
        prevSessions.map(s =>
          s.id === session.id ? { ...s, completed: session.completed } : s
        )
      );
      Alert.alert('Error', error.message || 'Failed to update session');
    }
  }, []);

  // Memoized today's sessions calculation
  const todaySessions = useMemo(() => {
    const { today, tomorrow } = getTodayRange();
    return sessions.filter(s => {
      const sessionDate = new Date(s.scheduledAt);
      return sessionDate >= today && sessionDate < tomorrow;
    });
  }, [sessions]);

  // Count of completed sessions today
  const completedCount = useMemo(() => {
    return todaySessions.filter(s => s.completed).length;
  }, [todaySessions]);

  // Navigation items configuration
  const navItems = useMemo(() => [
    {
      id: 'home',
      label: 'Home',
      icon: <Icon icon={HomeSvg} size={24} color={activeNavItem === 'home' ? theme.colors.primary : theme.colors.iconGray} />
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Icon icon={CalendarSvg} size={24} color={activeNavItem === 'calendar' ? theme.colors.primary : theme.colors.iconGray} />
    },
    {
      id: 'stats',
      label: 'Stats',
      icon: <Icon icon={BarGraphSvg} size={24} color={activeNavItem === 'stats' ? theme.colors.primary : theme.colors.iconGray} />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Icon icon={GearSvg} size={24} color={activeNavItem === 'settings' ? theme.colors.primary : theme.colors.iconGray} />
    },
  ], [activeNavItem]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.section}>
          <Header
            title="Dashboard"
            date={getCurrentDate().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
            subtitle="Your schedule today"
            selectedView={selectedView}
            onViewChange={setSelectedView}
          />

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.buttonPrimary} />
            </View>
          ) : (
            <Card bordered paddingHorizontal="lg" paddingVertical="lg">
              <View style={styles.summaryInner}>
                <View style={styles.stat}>
                  <Icon icon={CalendarSvg} size={16} color={theme.colors.tertiary} />
                  <Text style={theme.typography.body}>{todaySessions.length} sessions</Text>
                </View>

                <View style={styles.dot} />

                <View style={styles.stat}>
                  <Icon icon={CheckSvg} size={16} color={theme.colors.tertiary} />
                  <Text style={theme.typography.body}>{completedCount} done</Text>
                </View>
              </View>
            </Card>
          )}
        </View>

        {/* Smart Suggestions Section */}
        {!loading && suggestions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={theme.typography.h2}>Smart Suggestions</Text>
              <View style={styles.sectionHeaderRight}>
                {refreshing && <ActivityIndicator size="small" color={theme.colors.buttonPrimary} />}
                <TouchableOpacity onPress={() => Alert.alert('View All Suggestions', 'Feature coming soon!')}>
                  <Icon icon={ArrowSvg} size={20} color={theme.colors.tertiary} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContent}
            >
              {suggestions.map((suggestion, index) => {
                const description = suggestion.reasons.slice(0, 2).join('. ') + '.';
                const timeRange = `${getRelativeDay(suggestion.suggestedStart)} · ${formatTime(suggestion.suggestedStart)}–${formatTime(suggestion.suggestedEnd)}`;

                return (
                  <Card
                    key={suggestion.suggestionId || index}
                    type="suggestion"
                    color="purple"
                    size="md"
                    noPadding
                    title={suggestion.sessionType.name}
                    time={timeRange}
                    description={description}
                    priority={suggestion.sessionType.priority}
                    onAccept={() => handleAccept(suggestion)}
                    onAdjust={() => handleAdjust(suggestion)}
                  />
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Today's Sessions Section */}
        {!loading && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={theme.typography.h2}>Today's Sessions</Text>
              <TouchableOpacity style={styles.addButton}>
                <Icon icon={PlusSvg} size={20} color={theme.colors.surface} />
              </TouchableOpacity>
            </View>

            {todaySessions.length === 0 ? (
              <Text style={styles.emptyText}>No sessions scheduled for today</Text>
            ) : (
              <View style={styles.sessionsList}>
                {todaySessions.map((session, index) => {
                  const { icon, bgColor } = getSessionIcon(session.sessionType.name, index);
                  const endTime = getSessionEndTime(session.scheduledAt, session.duration);
                  const timeRange = `${formatTime(session.scheduledAt)}–${endTime}`;

                  return (
                    <Card
                      key={session.id}
                      type="session"
                      size="full"
                      noPadding
                      bordered
                      title={session.sessionType.name}
                      time={timeRange}
                      iconBgColor={bgColor}
                      icon={icon}
                      status={session.completed ? 'completed' : 'upcoming'}
                      onToggleComplete={() => handleToggleComplete(session)}
                    />
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Progress Section */}
        {!loading && stats && (
          <View style={styles.section}>
            <Card
              type="progress"
              color="blue"
              size="full"
              noPadding
              scheduled={stats.overview.totalSessions}
              completed={stats.overview.completedSessions}
              completionRate={Math.round(stats.overview.completionRate * 100)}
              sessionsByType={stats.byType.map(t => ({
                name: t.name,
                count: t.count,
                color: t.color,
              }))}
              averageSpacing={parseFloat(stats.derivedMetrics.averageSpacing)}
            />
          </View>
        )}

        {/* Config Cards Section */}
        <View style={styles.configRow}>
          <Card
            type="config"
            configType="types"
            color="green"
            size="auto"
            noPadding
            style={styles.configCard}
            totalTypes={sessionTypes.length}
            types={stats?.byType.slice(0, 5).map(t => ({
              name: t.name,
              count: t.count,
            })) || []}
            onManage={() => console.log('Manage types')}
          />
          <Card
            type="config"
            configType="availability"
            color="purple"
            size="auto"
            noPadding
            style={styles.configCard}
            availabilityText={summarizeAvailability(availabilityWindows)}
            weekAvailability={getWeekAvailability(availabilityWindows)}
            onEdit={() => setAvailabilityModalVisible(true)}
          />
        </View>
      </ScrollView>

      <BottomNavigation
        items={navItems}
        activeId={activeNavItem}
        onPress={setActiveNavItem}
      />

      <AvailabilityScreen
        visible={availabilityModalVisible}
        onClose={() => {
          setAvailabilityModalVisible(false);
          loadData();
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.xl,
    gap: theme.spacing.xxl,
    paddingBottom: 40,
  },
  section: {
    gap: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  summaryInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dot: {
    width: theme.spacing.xs,
    height: theme.spacing.xs,
    backgroundColor: theme.colors.borderLight,
    borderRadius: 2,
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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselContent: {
    paddingLeft: 0,
    gap: theme.spacing.lg,
  },
  sessionsList: {
    gap: theme.spacing.md,
  },
  configRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  configCard: {
    flex: 0.5,
  },
});

export default DashboardScreen;
