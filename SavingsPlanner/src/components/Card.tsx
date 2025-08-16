import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '../utils/cn';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className,
  style,
  ...props
}) => {
  const baseClasses = 'rounded-xl';
  
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 shadow-sm',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg',
    outlined: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const cardClasses = cn(
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    className
  );

  return (
    <View className={cardClasses} style={style} {...props}>
      {children}
    </View>
  );
};