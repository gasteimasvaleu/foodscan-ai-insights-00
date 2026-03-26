#import <Capacitor/Capacitor.h>

CAP_PLUGIN(NativeAppleSignInPlugin, "NativeAppleSignIn",
    CAP_PLUGIN_METHOD(authorize, CAPPluginReturnPromise);
)
