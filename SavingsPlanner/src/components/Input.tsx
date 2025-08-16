import React, { forwardRef } from 'react';
import { TextInput, Text, View, TextInputProps } from 'react-native';
import { cn } from '../utils/cn';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  style,
  ...props
}, ref) => {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </Text>
      )}
      
      <View className="relative">
        {leftIcon && (
          <View className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            {leftIcon}
          </View>
        )}
        
        <TextInput
          ref={ref}
          className={cn(
            'border rounded-lg px-4 py-3 text-base',
            'bg-white dark:bg-gray-800',
            'border-gray-300 dark:border-gray-600',
            'text-gray-900 dark:text-white',
            'placeholder:text-gray-500 dark:placeholder:text-gray-400',
            leftIcon && 'pl-12',
            rightIcon && 'pr-12',
            error ? 'border-danger-500' : 'focus:border-primary-500',
            'focus:outline-none'
          )}
          placeholderTextColor="#6b7280"
          style={style}
          {...props}
        />
        
        {rightIcon && (
          <View className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text className="text-sm text-danger-600 dark:text-danger-400 mt-1">
          {error}
        </Text>
      )}
      
      {helperText && !error && (
        <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {helperText}
        </Text>
      )}
    </View>
  );
});