import React from 'react';

// --- React Native Primitives Shim for Web ---

interface ViewProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const View: React.FC<ViewProps> = ({ className = '', children, ...props }) => (
  <div className={`flex flex-col relative box-border ${className}`} {...props}>{children}</div>
);

export const Row: React.FC<ViewProps> = ({ className = '', children, ...props }) => (
  <div className={`flex flex-row relative box-border ${className}`} {...props}>{children}</div>
);

interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  numberOfLines?: number;
}

export const Text: React.FC<TextProps> = ({ className = '', children, numberOfLines, style, ...props }) => {
  const textStyle: React.CSSProperties = numberOfLines ? {
    display: '-webkit-box',
    WebkitLineClamp: numberOfLines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    ...style
  } : style;

  return (
    <span className={`block text-white leading-snug ${className}`} style={textStyle} {...props}>{children}</span>
  );
};

interface ScrollViewProps extends React.HTMLAttributes<HTMLDivElement> {
  contentContainerStyle?: string;
  horizontal?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  showsVerticalScrollIndicator?: boolean;
}

export const ScrollView: React.FC<ScrollViewProps> = ({ 
  className = '', 
  children, 
  contentContainerStyle = '', 
  horizontal = false,
  ...props 
}) => (
  <div 
    className={`
      ${horizontal ? 'overflow-x-auto flex-row' : 'overflow-y-auto flex-col'} 
      no-scrollbar flex relative ${className}
    `} 
    {...props}
  >
     <div className={`${horizontal ? 'flex flex-row' : 'flex flex-col'} ${contentContainerStyle}`}>
       {children}
     </div>
  </div>
);

interface TouchableOpacityProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  activeOpacity?: number;
  onPress?: (e?: any) => void;
}

export const TouchableOpacity: React.FC<TouchableOpacityProps> = ({ 
  className = '', 
  children, 
  onPress, 
  disabled,
  type = 'button',
  ...props 
}) => (
  <button 
    onClick={onPress} 
    type={type}
    disabled={disabled}
    className={`
      active:opacity-60 active:scale-[0.98] transition-all duration-100 cursor-pointer 
      disabled:opacity-50 disabled:cursor-not-allowed border-none bg-transparent p-0 m-0
      ${className}
    `} 
    {...props}
  >
    {children}
  </button>
);

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholderTextColor?: string;
}

export const TextInput: React.FC<TextInputProps> = ({ className = '', ...props }) => (
  <input 
    className={`bg-transparent border-none focus:outline-none text-white w-full ${className}`} 
    {...props} 
  />
);

export const SafeAreaView: React.FC<ViewProps> = ({ className = '', children, ...props }) => (
  <div className={`flex-1 w-full h-full pt-safe-top pb-safe-bottom bg-background ${className}`} {...props}>
    {children}
  </div>
);

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  source: { uri: string } | string;
}

export const Image: React.FC<ImageProps> = ({ className = '', source, ...props }) => {
  const src = typeof source === 'string' ? source : source.uri;
  return <img src={src} className={`object-cover block ${className}`} {...props} />;
};

export const StatusBar: React.FC<{barStyle?: 'light-content'|'dark-content'}> = () => (
  <div className="w-full h-safe-top bg-background fixed top-0 left-0 z-50" />
);