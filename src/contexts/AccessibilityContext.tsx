import React, { createContext, useContext, useState, useEffect } from 'react';

export type FontSizeOption = 'normal' | 'large' | 'xlarge';

export interface AccessibilityContextType {
  fontSize: FontSizeOption;
  setFontSize: (size: FontSizeOption) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  screenReaderMode: boolean;
  setScreenReaderMode: (enabled: boolean) => void;
  toggleHighContrast: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSize] = useState<FontSizeOption>('normal');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [screenReaderMode, setScreenReaderMode] = useState<boolean>(false);

  useEffect(() => {
    // Apply Font Size Classes to Body Element
    const rootClassList = document.documentElement.classList;
    rootClassList.remove('font-size-large', 'font-size-xlarge');
    if (fontSize === 'large') {
      rootClassList.add('font-size-large');
    } else if (fontSize === 'xlarge') {
      rootClassList.add('font-size-xlarge');
    }

    // Apply High Contrast Class
    if (highContrast) {
      rootClassList.add('high-contrast');
    } else {
      rootClassList.remove('high-contrast');
    }
  }, [fontSize, highContrast]);

  const toggleHighContrast = () => setHighContrast(!highContrast);

  const increaseFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
  };

  const decreaseFontSize = () => {
    if (fontSize === 'xlarge') setFontSize('large');
    else if (fontSize === 'large') setFontSize('normal');
  };

  return (
    <AccessibilityContext.Provider value={{
      fontSize,
      setFontSize,
      highContrast,
      setHighContrast,
      screenReaderMode,
      setScreenReaderMode,
      toggleHighContrast,
      increaseFontSize,
      decreaseFontSize
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
