import { GrowthCard } from './sleep/GrowthCard';
import { SleepDiaryAdvanced } from './sleep/SleepDiaryAdvanced';
import { WakeWindowCalculator } from './sleep/WakeWindowCalculator';
import { RoutineGenerator } from './sleep/RoutineGenerator';

export function SleepGrowthPanel() {
  return (
    <div className="space-y-4">
      <GrowthCard />
      <SleepDiaryAdvanced />
      <WakeWindowCalculator />
      <RoutineGenerator />
    </div>
  );
}
