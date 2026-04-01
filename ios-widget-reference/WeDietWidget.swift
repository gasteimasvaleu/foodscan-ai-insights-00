import WidgetKit
import SwiftUI

// MARK: - Data Model

struct WidgetData {
    let caloriesTarget: Int
    let caloriesConsumed: Int
    let caloriesRemaining: Int
    let proteinsTarget: Int
    let proteinsConsumed: Int
    let carbsTarget: Int
    let carbsConsumed: Int
    let fatsTarget: Int
    let fatsConsumed: Int
    let mealsCount: Int
    let hydrationMl: Int
    let hydrationTarget: Int
    let lastUpdate: String

    static let placeholder = WidgetData(
        caloriesTarget: 2000, caloriesConsumed: 1250, caloriesRemaining: 750,
        proteinsTarget: 150, proteinsConsumed: 85,
        carbsTarget: 250, carbsConsumed: 160,
        fatsTarget: 65, fatsConsumed: 40,
        mealsCount: 3, hydrationMl: 1200, hydrationTarget: 2000,
        lastUpdate: ""
    )

    static func load() -> WidgetData {
        guard let defaults = UserDefaults(suiteName: "group.app.dietainteligente"),
              let dict = defaults.dictionary(forKey: "widgetData") else {
            return .placeholder
        }
        return WidgetData(
            caloriesTarget: dict["caloriesTarget"] as? Int ?? 0,
            caloriesConsumed: dict["caloriesConsumed"] as? Int ?? 0,
            caloriesRemaining: dict["caloriesRemaining"] as? Int ?? 0,
            proteinsTarget: dict["proteinsTarget"] as? Int ?? 0,
            proteinsConsumed: dict["proteinsConsumed"] as? Int ?? 0,
            carbsTarget: dict["carbsTarget"] as? Int ?? 0,
            carbsConsumed: dict["carbsConsumed"] as? Int ?? 0,
            fatsTarget: dict["fatsTarget"] as? Int ?? 0,
            fatsConsumed: dict["fatsConsumed"] as? Int ?? 0,
            mealsCount: dict["mealsCount"] as? Int ?? 0,
            hydrationMl: dict["hydrationMl"] as? Int ?? 0,
            hydrationTarget: dict["hydrationTarget"] as? Int ?? 2000,
            lastUpdate: dict["lastUpdate"] as? String ?? ""
        )
    }
}

// MARK: - Timeline

struct WeDietEntry: TimelineEntry {
    let date: Date
    let data: WidgetData
}

struct WeDietProvider: TimelineProvider {
    func placeholder(in context: Context) -> WeDietEntry {
        WeDietEntry(date: Date(), data: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (WeDietEntry) -> Void) {
        completion(WeDietEntry(date: Date(), data: .load()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<WeDietEntry>) -> Void) {
        let entry = WeDietEntry(date: Date(), data: .load())
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }
}

// MARK: - Views

struct CalorieRingView: View {
    let consumed: Int
    let target: Int

    private var progress: Double {
        guard target > 0 else { return 0 }
        return min(Double(consumed) / Double(target), 1.0)
    }

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.pink.opacity(0.2), lineWidth: 8)
            Circle()
                .trim(from: 0, to: progress)
                .stroke(
                    LinearGradient(colors: [Color.pink, Color(red: 1, green: 0.18, blue: 0.62)],
                                   startPoint: .topLeading, endPoint: .bottomTrailing),
                    style: StrokeStyle(lineWidth: 8, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
            VStack(spacing: 2) {
                Text("\(max(0, target - consumed))")
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)
                Text("restam")
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)
                Text("kcal")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(.pink)
            }
        }
    }
}

struct MacroBarView: View {
    let label: String
    let consumed: Int
    let target: Int
    let color: Color

    private var progress: Double {
        guard target > 0 else { return 0 }
        return min(Double(consumed) / Double(target), 1.0)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(label)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(.secondary)
                Spacer()
                Text("\(consumed)/\(target)g")
                    .font(.system(size: 10, weight: .semibold, design: .rounded))
                    .foregroundColor(.primary)
            }
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(color.opacity(0.2))
                    RoundedRectangle(cornerRadius: 3)
                        .fill(color)
                        .frame(width: geo.size.width * progress)
                }
            }
            .frame(height: 6)
        }
    }
}

struct WeDietWidgetSmallView: View {
    let data: WidgetData

    var body: some View {
        VStack(spacing: 8) {
            CalorieRingView(consumed: data.caloriesConsumed, target: data.caloriesTarget)
                .frame(width: 80, height: 80)

            HStack(spacing: 12) {
                Label("\(data.mealsCount)", systemImage: "fork.knife")
                    .font(.system(size: 11, weight: .medium))
                Label("\(data.hydrationMl)ml", systemImage: "drop.fill")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(.blue)
            }
        }
        .padding()
    }
}

struct WeDietWidgetMediumView: View {
    let data: WidgetData

    var body: some View {
        HStack(spacing: 16) {
            CalorieRingView(consumed: data.caloriesConsumed, target: data.caloriesTarget)
                .frame(width: 90, height: 90)

            VStack(spacing: 6) {
                MacroBarView(label: "Proteínas", consumed: data.proteinsConsumed, target: data.proteinsTarget, color: .orange)
                MacroBarView(label: "Carboidratos", consumed: data.carbsConsumed, target: data.carbsTarget, color: .blue)
                MacroBarView(label: "Gorduras", consumed: data.fatsConsumed, target: data.fatsTarget, color: .purple)

                HStack(spacing: 12) {
                    Label("\(data.mealsCount) refeições", systemImage: "fork.knife")
                        .font(.system(size: 10))
                    Spacer()
                    Label("\(data.hydrationMl)/\(data.hydrationTarget)ml", systemImage: "drop.fill")
                        .font(.system(size: 10))
                        .foregroundColor(.blue)
                }
            }
        }
        .padding()
    }
}

// MARK: - Widget

@main
struct WeDietWidget: Widget {
    let kind = "WeDietWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: WeDietProvider()) { entry in
            if #available(iOS 17.0, *) {
                Group {
                    switch WidgetFamily(rawValue: 0) {
                    default:
                        WeDietWidgetMediumView(data: entry.data)
                    }
                }
                .containerBackground(.fill.tertiary, for: .widget)
            } else {
                WeDietWidgetMediumView(data: entry.data)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("Dieta Inteligente")
        .description("Acompanhe suas calorias, macros e hidratação.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Preview

struct WeDietWidget_Previews: PreviewProvider {
    static var previews: some View {
        WeDietWidgetSmallView(data: .placeholder)
            .previewContext(WidgetPreviewContext(family: .systemSmall))
        WeDietWidgetMediumView(data: .placeholder)
            .previewContext(WidgetPreviewContext(family: .systemMedium))
    }
}
