import NativeAppleSignIn, { type AppleSignInResult } from '@/plugins/NativeAppleSignIn';

/**
 * Calls the native Apple Sign In plugin and returns the credential payload.
 * Throws if the user cancels or if the plugin returns an error.
 */
export const nativeAppleSignIn = async (): Promise<AppleSignInResult> => {
  console.log('[AppleSignIn] Requesting native authorization…');
  const result = await NativeAppleSignIn.authorize();
  console.log('[AppleSignIn] Authorization received');
  return result;
};
