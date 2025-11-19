
import React from 'react';
import { View, TouchableOpacity } from '../native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  if (onClick) {
    return (
      <TouchableOpacity 
        onPress={onClick}
        className={`bg-surface/50 backdrop-blur-xl border border-white/5 rounded-2xl p-4 w-full ${className}`}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={`bg-surface/50 backdrop-blur-xl border border-white/5 rounded-2xl p-4 w-full ${className}`}>
      {children}
    </View>
  );
};
