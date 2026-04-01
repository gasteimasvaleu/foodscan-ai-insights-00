import Foundation
import WidgetKit
import Capacitor

@objc(SharedDataPlugin)
public class SharedDataPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SharedDataPlugin"
    public let jsName = "SharedData"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "saveWidgetData", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "clearWidgetData", returnType: CAPPluginReturnPromise)
    ]

    private let suiteName = "group.app.dietainteligente"

    @objc func saveWidgetData(_ call: CAPPluginCall) {
        guard let defaults = UserDefaults(suiteName: suiteName) else {
            call.reject("Failed to access App Group UserDefaults")
            return
        }

        let data: [String: Any] = [
            "caloriesTarget": call.getInt("caloriesTarget") ?? 0,
            "caloriesConsumed": call.getInt("caloriesConsumed") ?? 0,
            "caloriesRemaining": call.getInt("caloriesRemaining") ?? 0,
            "proteinsTarget": call.getInt("proteinsTarget") ?? 0,
            "proteinsConsumed": call.getInt("proteinsConsumed") ?? 0,
            "carbsTarget": call.getInt("carbsTarget") ?? 0,
            "carbsConsumed": call.getInt("carbsConsumed") ?? 0,
            "fatsTarget": call.getInt("fatsTarget") ?? 0,
            "fatsConsumed": call.getInt("fatsConsumed") ?? 0,
            "mealsCount": call.getInt("mealsCount") ?? 0,
            "hydrationMl": call.getInt("hydrationMl") ?? 0,
            "hydrationTarget": call.getInt("hydrationTarget") ?? 2000,
            "lastUpdate": call.getString("lastUpdate") ?? ISO8601DateFormatter().string(from: Date())
        ]

        defaults.set(data, forKey: "widgetData")

        // Request widget timeline reload
        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }

        call.resolve(["success": true])
    }

    @objc func clearWidgetData(_ call: CAPPluginCall) {
        guard let defaults = UserDefaults(suiteName: suiteName) else {
            call.reject("Failed to access App Group UserDefaults")
            return
        }

        defaults.removeObject(forKey: "widgetData")

        if #available(iOS 14.0, *) {
            WidgetCenter.shared.reloadAllTimelines()
        }

        call.resolve(["success": true])
    }
}
