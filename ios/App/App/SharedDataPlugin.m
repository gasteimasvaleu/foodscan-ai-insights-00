#import <Capacitor/Capacitor.h>

CAP_PLUGIN(SharedDataPlugin, "SharedData",
    CAP_PLUGIN_METHOD(saveWidgetData, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(clearWidgetData, CAPPluginReturnPromise);
)
