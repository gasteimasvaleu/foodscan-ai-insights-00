import { registerPlugin } from '@capacitor/core';

export interface AppleSignInResult {
  identityToken: string;
  authorizationCode: string;
  givenName?: string | null;
  familyName?: string | null;
  email?: string | null;
}

export interface NativeAppleSignInPlugin {
  authorize(): Promise<AppleSignInResult>;
}

const NativeAppleSignIn = registerPlugin<NativeAppleSignInPlugin>('NativeAppleSignIn');

export default NativeAppleSignIn;
