import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({
  name,
  className = 'w-5 h-5',
  size,
  color,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Sparkles;

  return <IconComponent className={className} size={size} color={color} />;
};

export const AVAILABLE_ICONS = [
  'Sun',
  'Moon',
  'Brain',
  'Dumbbell',
  'BookOpen',
  'Droplets',
  'Target',
  'Sparkles',
  'Heart',
  'Coffee',
  'Flame',
  'Zap',
  'Smile',
  'Music',
  'Footprints',
  'Code',
  'PenTool',
  'Compass',
  'Apple',
  'Bed',
];
