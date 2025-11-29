import React from 'react';
import { View, ViewStyle, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';
import { PriorityDots } from './PriorityDots';
import { Icon, CalendarSvg, CheckSvg, ClockSvg, TargetSvg } from './Icon';

export type CardColor =
  | 'default'
  | 'purple'
  | 'blue'
  | 'green'
  | 'mint'
  | 'lavender'
  | 'gray'
  | 'red'
  | 'transparent';

export type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';
export type CardRadius = 'sm' | 'md' | 'lg' | 'xl' | 'none';
export type CardType = 'default' | 'suggestion' | 'session' | 'progress' | 'config';

// Base props shared by all card types
interface BaseCardProps {
  color?: CardColor;
  size?: CardSize;
  padding?: keyof typeof spacing;
  paddingHorizontal?: keyof typeof spacing;
  paddingVertical?: keyof typeof spacing;
  noPadding?: boolean;
  style?: ViewStyle;
  bordered?: boolean;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: CardRadius;
  shadow?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

// Default card with children
interface DefaultCardProps extends BaseCardProps {
  type?: 'default';
  children: React.ReactNode;
}

// Suggestion card
interface SuggestionCardProps extends BaseCardProps {
  type: 'suggestion';
  title: string;
  time: string;
  description: string;
  priority: number;
  onAccept?: () => void;
  onAdjust?: () => void;
}

// Session card
interface SessionCardProps extends BaseCardProps {
  type: 'session';
  title: string;
  time: string;
  icon: React.ReactNode;
  iconBgColor: string;
  status?: 'completed' | 'upcoming';
  onToggleComplete?: () => void;
}

// Progress card
interface ProgressCardProps extends BaseCardProps {
  type: 'progress';
  scheduled: number;
  completed: number;
  completionRate: number;
  sessionsByType: Array<{ name: string; count: number; color: string }>;
  averageSpacing: number;
}

// Config card
interface ConfigCardProps extends BaseCardProps {
  type: 'config';
  configType: 'types' | 'availability';
  onManage?: () => void;
  onEdit?: () => void;
  types?: Array<{ name: string; count: number }>;
  totalTypes?: number;
  availabilityText?: string;
  weekAvailability?: boolean[];
}

export type CardProps =
  | DefaultCardProps
  | SuggestionCardProps
  | SessionCardProps
  | ProgressCardProps
  | ConfigCardProps;

const COLOR_MAP: Record<CardColor, string> = {
  default: colors.surface,
  purple: colors.cardPurple,
  blue: colors.cardBlue,
  green: colors.cardGreen,
  mint: colors.cardMint,
  lavender: colors.cardLavender,
  gray: colors.cardGray,
  red: colors.cardRed,
  transparent: 'transparent',
};

const SIZE_WIDTHS: Record<CardSize, number | string> = {
  xs: 120,
  sm: 152,
  md: 280,
  lg: 320,
  xl: 360,
  full: '100%',
  auto: '100%',
};

const RADIUS_VALUES: Record<CardRadius, number> = {
  none: 0,
  sm: radius.sm,
  md: radius.md,
  lg: radius.lg,
  xl: radius.xl,
};

/**
 * Card - Universal card component
 *
 * Supports multiple card types via the 'type' prop:
 * - 'default': Simple container with children
 * - 'suggestion': Smart suggestion card with priority, title, time, description, and actions
 * - 'session': Session row with icon, title, time, and completion status
 * - 'progress': Progress card with stats and charts
 * - 'config': Configuration card for types or availability
 */
export function Card(props: CardProps) {
  const {
    color = 'default',
    size = 'auto',
    padding,
    paddingHorizontal,
    paddingVertical,
    noPadding = false,
    style,
    bordered = false,
    borderColor = colors.border,
    borderWidth = 1,
    borderRadius: customRadius = 'xl',
    shadow = false,
    onPress,
    disabled = false,
  } = props;

  const type = props.type || 'default';

  const backgroundColor = COLOR_MAP[color];
  const width = SIZE_WIDTHS[size];
  const borderRadiusValue = RADIUS_VALUES[customRadius];

  const containerStyle: ViewStyle = {
    backgroundColor,
    width,
    borderRadius: borderRadiusValue,
  };

  // Handle padding
  if (!noPadding) {
    if (padding) {
      containerStyle.padding = spacing[padding];
    } else {
      if (paddingHorizontal) {
        containerStyle.paddingHorizontal = spacing[paddingHorizontal];
      }
      if (paddingVertical) {
        containerStyle.paddingVertical = spacing[paddingVertical];
      }
      // Default padding if none specified
      if (!paddingHorizontal && !paddingVertical && type === 'default') {
        containerStyle.padding = spacing.xl;
      }
    }
  }

  // Handle border
  if (bordered) {
    containerStyle.borderWidth = borderWidth;
    containerStyle.borderColor = borderColor;
  }

  const finalStyle = [
    styles.card,
    containerStyle,
    shadow && styles.shadow,
    style,
  ];

  // Render different card types
  let content: React.ReactNode;

  switch (type) {
    case 'suggestion':
      content = renderSuggestionCard(props as SuggestionCardProps);
      break;
    case 'session':
      content = renderSessionCard(props as SessionCardProps);
      break;
    case 'progress':
      content = renderProgressCard(props as ProgressCardProps);
      break;
    case 'config':
      content = renderConfigCard(props as ConfigCardProps);
      break;
    case 'default':
    default:
      content = (props as DefaultCardProps).children;
      break;
  }

  // If interactive, wrap in TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity
        style={finalStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={finalStyle}>{content}</View>;
}

// Render functions for each card type

function renderSuggestionCard(props: SuggestionCardProps) {
  const { title, time, description, priority, onAccept, onAdjust } = props;

  return (
    <View style={styles.suggestionContainer}>
      <View style={styles.suggestionHeader}>
        <View style={styles.suggestionHeaderContent}>
          <Text style={typography.h3}>{title}</Text>
          <View style={styles.timeRow}>
            <Icon icon={ClockSvg} size={16} color={colors.tertiary} />
            <Text style={[typography.body, { color: colors.tertiary }]}>{time}</Text>
          </View>
        </View>
        <PriorityDots priority={priority} />
      </View>

      <Text style={[typography.bodyLarge, { color: colors.secondary }]}>
        {description}
      </Text>

      <View style={styles.suggestionActions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={onAccept}
          activeOpacity={0.8}
        >
          <Text style={[typography.label, { color: colors.surface }]}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adjustButton}
          onPress={onAdjust}
          activeOpacity={0.8}
        >
          <Text style={[typography.label, { color: colors.buttonText }]}>Adjust</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function renderSessionCard(props: SessionCardProps) {
  const { title, time, icon, iconBgColor, status = 'upcoming', onToggleComplete } = props;
  const isCompleted = status === 'completed';

  return (
    <View style={styles.sessionContainer}>
      <View style={[styles.sessionIconContainer, { backgroundColor: iconBgColor }]}>
        {icon}
      </View>

      <View style={styles.sessionContent}>
        <Text style={typography.h4}>{title}</Text>
        <View style={styles.timeRow}>
          <Icon icon={ClockSvg} size={14} color={colors.muted} />
          <Text style={[typography.body, { color: colors.muted }]}>{time}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.sessionCheckbox,
          isCompleted && styles.sessionCheckboxChecked,
        ]}
        onPress={onToggleComplete}
        activeOpacity={0.7}
      >
        {isCompleted && (
          <Icon icon={CheckSvg} size={16} color={colors.surface} />
        )}
      </TouchableOpacity>
    </View>
  );
}

function renderProgressCard(props: ProgressCardProps) {
  const { scheduled, completed, completionRate, sessionsByType, averageSpacing } = props;

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Icon icon={TargetSvg} size={20} color={colors.primary} />
        <Text style={typography.h2}>Your Progress</Text>
      </View>

      <View style={styles.progressStatsRow}>
        <View style={styles.progressStatItem}>
          <Text style={typography.statNumber}>{scheduled}</Text>
          <Text style={typography.caption}>Scheduled</Text>
        </View>
        <View style={styles.progressStatItem}>
          <Text style={typography.statNumber}>{completed}</Text>
          <Text style={typography.caption}>Completed</Text>
        </View>
        <View style={styles.progressStatItem}>
          <Text style={typography.statNumber}>{completionRate}%</Text>
          <Text style={typography.caption}>Rate</Text>
        </View>
      </View>

      <View style={styles.progressSessionsSection}>
        <Text style={typography.caption}>Sessions by type</Text>

        <View style={styles.progressBar}>
          {sessionsByType.map((type, index) => (
            <View
              key={index}
              style={[
                styles.progressSegment,
                {
                  backgroundColor: type.color,
                  flex: type.count,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.progressLegend}>
          {sessionsByType.map((type, index) => (
            <View key={index} style={styles.progressLegendItem}>
              <View style={[styles.progressLegendDot, { backgroundColor: type.color }]} />
              <Text style={[typography.body, { color: colors.secondary }]}>
                {type.name} ·{' '}
              </Text>
              <Text style={[typography.body, { color: colors.tertiary }]}>
                {type.count}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.progressSpacingCard}>
        <Icon icon={CalendarSvg} size={16} color={colors.primary} />
        <View style={styles.progressSpacingText}>
          <Text style={[typography.body, { color: colors.primary }]}>
            {averageSpacing} days
          </Text>
          <Text style={typography.caption}>Average spacing between sessions</Text>
        </View>
      </View>
    </View>
  );
}

function renderConfigCard(props: ConfigCardProps) {
  const {
    configType,
    onManage,
    onEdit,
    types,
    totalTypes,
    availabilityText,
    weekAvailability = [true, true, true, true, false, true, false],
  } = props;

  const isTypes = configType === 'types';
  const buttonAction = isTypes ? onManage : onEdit;
  const buttonText = isTypes ? 'Manage' : 'Edit';

  return (
    <View style={styles.configContainer}>
      <View style={styles.configHeader}>
        <Icon icon={isTypes ? TargetSvg : CalendarSvg} size={16} color={colors.primary} />
        <Text style={[typography.body, { color: colors.primary }]}>
          {isTypes ? 'Types' : 'Available'}
        </Text>
      </View>

      {isTypes ? (
        <View style={styles.configContent}>
          <Text style={typography.body}>
            <Text style={{ color: colors.primary }}>{totalTypes}</Text>
            <Text style={{ color: colors.secondary }}> types</Text>
          </Text>

          <View style={styles.configTypesList}>
            {types?.slice(0, 2).map((type, index) => (
              <View key={index} style={styles.configTypeRow}>
                <Text style={[typography.caption, { color: colors.primary }]}>
                  {type.name}
                </Text>
                <Text style={[typography.caption, { color: colors.tertiary }]}>
                  {type.count}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.configContent}>
          <Text style={[typography.body, { color: colors.secondary }]}>
            {availabilityText}
          </Text>

          <View style={styles.configWeekRow}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <View key={index} style={styles.configDayColumn}>
                <Text style={[typography.caption, { color: colors.tertiary }]}>
                  {day}
                </Text>
                <View
                  style={[
                    styles.configDayBar,
                    {
                      backgroundColor: weekAvailability[index]
                        ? colors.buttonPrimary
                        : colors.surface,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.configButton}
        onPress={buttonAction}
        activeOpacity={0.7}
      >
        <Text style={[typography.caption, { fontWeight: '500', color: colors.buttonText }]}>
          {buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    // Base card style
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Suggestion card styles
  suggestionContainer: {
    padding: spacing.xl,
    paddingBottom: 0,
    gap: spacing.lg,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  suggestionHeaderContent: {
    flex: 1,
    gap: spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  suggestionActions: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: spacing.xl,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.buttonPrimary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  adjustButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },

  // Session card styles
  sessionContainer: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 50,
  },
  sessionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 14,
    padding: 10,
    paddingBottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  sessionContent: {
    flex: 1,
    gap: 4,
  },
  sessionCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  sessionCheckboxChecked: {
    backgroundColor: colors.accentDark,
    borderColor: colors.accentDark,
  },

  // Progress card styles
  progressContainer: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStatItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  progressSessionsSection: {
    gap: spacing.md,
  },
  progressBar: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 100,
    overflow: 'hidden',
    gap: 4,
  },
  progressSegment: {
    height: '100%',
  },
  progressLegend: {
    gap: spacing.md,
  },
  progressLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressSpacingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 16,
  },
  progressSpacingText: {
    flex: 1,
    gap: 2,
  },

  // Config card styles
  configContainer: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  configHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  configContent: {
    gap: spacing.lg,
  },
  configTypesList: {
    gap: spacing.sm,
  },
  configTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: 14,
    height: 32,
  },
  configWeekRow: {
    flexDirection: 'row',
    gap: 4,
  },
  configDayColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  configDayBar: {
    width: '100%',
    height: 32,
    borderRadius: 10,
  },
  configButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
});
