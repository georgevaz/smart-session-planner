import React from 'react';
import { SvgProps } from 'react-native-svg';
import { colors } from '../theme';

// Export SVG files for direct use
export { default as CalendarSvg } from '../assets/icons/calendar.svg';
export { default as CheckSvg } from '../assets/icons/check.svg';
export { default as PlusSvg } from '../assets/icons/plus.svg';
export { default as TargetSvg } from '../assets/icons/target.svg';
export { default as HomeSvg } from '../assets/icons/home.svg';
export { default as BarGraphSvg } from '../assets/icons/bar-graph.svg';
export { default as GearSvg } from '../assets/icons/gear.svg';
export { default as ClockSvg } from '../assets/icons/clock.svg';
export { default as BrainSvg } from '../assets/icons/brain.svg';
export { default as MugSvg } from '../assets/icons/mug.svg';
export { default as WeightSvg } from '../assets/icons/weight.svg';
export { default as ArrowSvg } from '../assets/icons/arrow.svg';
export { default as LineGraphSvg } from '../assets/icons/line-graph.svg';

interface IconProps {
  icon: React.FC<SvgProps>;
  size?: number;
  color?: string;
}

/**
 * Icon - Universal icon wrapper component
 *
 * @param icon - The SVG component to render
 * @param size - The width and height of the icon (default: 24)
 * @param color - The stroke color of the icon (default: colors.primary)
 *
 * @example
 * import { Icon, CalendarSvg, CheckSvg } from '../components/Icon';
 *
 * <Icon icon={CalendarSvg} size={16} color={colors.tertiary} />
 * <Icon icon={CheckSvg} size={20} color={colors.success} />
 */
export function Icon({ icon: SvgComponent, size = 24, color = colors.primary }: IconProps) {
  return <SvgComponent width={size} height={size} stroke={color} fill="none" />;
}
