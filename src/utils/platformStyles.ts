import { Platform } from 'react-native';

export const platformStyles: any = {
  // Android-spezifische Styles
  android: {
    button: {
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    card: {
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
    },
    navigation: {
      backgroundColor: '#FFFFFF',
      elevation: 8,
    },
    modal: {
      elevation: 24,
    }
  },
  
  // iOS-spezifische Styles
  ios: {
    button: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
    },
    navigation: {
      backgroundColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    modal: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
    }
  },
  
  // Gemeinsame Styles
  common: {
    container: {
      flex: 1,
      backgroundColor: '#F2F2F7',
    },
    button: {
      borderRadius: Platform.OS === 'ios' ? 8 : 4,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: Platform.OS === 'ios' ? 44 : 48, // iOS: 44pt, Android: 48dp
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: Platform.OS === 'ios' ? 16 : 8,
      padding: 20,
    },
    modal: {
      backgroundColor: '#FFFFFF',
      borderRadius: Platform.OS === 'ios' ? 16 : 8,
      padding: 20,
      width: '90%',
      maxWidth: 400,
      maxHeight: '80%',
    }
  }
};

export const getPlatformStyle = (styleKey: string): any => {
  const platform = Platform.OS === 'android' ? 'android' : 'ios';
  const commonStyle = platformStyles.common[styleKey] ?? {};
  const platformStyle = platformStyles[platform][styleKey] ?? {};
  return {
    ...commonStyle,
    ...platformStyle,
  };
};

export const getPlatformValue = (iosValue: any, androidValue: any) => {
  return Platform.OS === 'ios' ? iosValue : androidValue;
};

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';
