import { Capacitor } from '@capacitor/core';

export const useNativePlatform = () => {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform(); // 'ios' | 'android' | 'web'

  return {
    isNative,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web',
    platform,
  };
};
