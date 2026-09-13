import { Platform, type ViewStyle } from 'react-native';
import { colors } from '../theme';

type StyleKey = 'button' | 'card' | 'modal' | 'navigation' | 'container';
type StyleMap = Partial<Record<StyleKey, ViewStyle>>;

const androidStyles: StyleMap = {
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
    backgroundColor: colors.surface,
    elevation: 8,
  },
  modal: {
    elevation: 24,
  },
};

const iosStyles: StyleMap = {
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
    backgroundColor: colors.surface,
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
  },
};

const commonStyles: StyleMap = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.surface,
    borderRadius: Platform.OS === 'ios' ? 16 : 8,
    padding: 20,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: Platform.OS === 'ios' ? 16 : 8,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
};

export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

export const getPlatformStyle = (styleKey: StyleKey): ViewStyle => {
  const platformMap = isAndroid ? androidStyles : iosStyles;
  return {
    ...(commonStyles[styleKey] ?? {}),
    ...(platformMap[styleKey] ?? {}),
  };
};

export const getPlatformValue = <T>(iosValue: T, androidValue: T): T => (isIOS ? iosValue : androidValue);
