import { useState, useCallback, useEffect } from 'react';
import { useNativePlatform } from './useNativePlatform';
import { Health } from '@capgo/capacitor-health';

const HEALTHKIT_CONNECTED_KEY = 'healthkit_connected';
const BUILD_ID = 'HK-BUILD-2026-03-27-C';

export interface WeeklyDataPoint {
  date: string;
  steps: number;
  calories: number;
}

export interface RecentWorkout {
  sourceName: string;
  value: number;
  startDate: string;
  endDate: string;
  unit: string;
  sourceId?: string;
  workoutType?: string;
  title?: string;
  calories?: number;
  caloriesUnit?: string;
  distance?: number;
  distanceUnit?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  rawData: Record<string, unknown>;
}

export interface HeartRateData {
  restingBPM: number | null;
  averageBPM: number | null;
}

export interface SleepData {
  totalMinutes: number | null;
  bedtime: string | null;
  wakeTime: string | null;
}

const extractNumber = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
};

const extractString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value;
  }
  return undefined;
};

const extractObject = (value: unknown): Record<string, unknown> | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
};

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout: ${label} não respondeu em ${ms / 1000}s`)), ms)
    ),
  ]);
}

export const useHealthKit = () => {
  const { isIOS, isNative } = useNativePlatform();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debugStatus, setDebugStatus] = useState<string>('idle');
  const [dailySteps, setDailySteps] = useState<number>(0);
  const [dailyCalories, setDailyCalories] = useState<number>(0);
  const [weight, setWeight] = useState<number | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyDataPoint[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);

  const isSupported = isIOS && isNative;

  // Log only once per mount cycle, not every render
  useEffect(() => {
    console.log(`[HealthKit] ${BUILD_ID} | isIOS:${isIOS} isNative:${isNative} isSupported:${isSupported}`);
  }, [isIOS, isNative, isSupported]);

  useEffect(() => {
    const stored = localStorage.getItem(HEALTHKIT_CONNECTED_KEY);
    if (stored === 'true' && isSupported) {
      setIsConnected(true);
    }
  }, [isSupported]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    console.log('[HealthKit] === requestPermissions START ===');

    if (!isSupported) {
      const msg = `Não suportado (isIOS=${isIOS}, isNative=${isNative})`;
      console.warn('[HealthKit]', msg);
      setDebugStatus(msg);
      return false;
    }

    setIsLoading(true);
    setDebugStatus('carregando bridge...');

    try {
      // Step 1: Ping the native bridge to confirm it's alive
      console.log('[HealthKit] >>> Health object type:', typeof Health);
      console.log('[HealthKit] >>> Health keys:', Object.keys(Health || {}));

      // Step 2: isAvailable — 10s timeout
      setDebugStatus('verificando disponibilidade...');
      console.log('[HealthKit] >>> Health.isAvailable()');
      try {
        const availResult: any = await withTimeout(Health.isAvailable(), 10000, 'isAvailable');
        console.log('[HealthKit] <<< isAvailable result:', JSON.stringify(availResult));
        if (!availResult?.available) {
          setDebugStatus('HealthKit indisponível neste dispositivo');
          return false;
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        console.error('[HealthKit] isAvailable error:', errMsg);
        setDebugStatus(`timeout/erro disponibilidade: ${errMsg}`);
        return false;
      }

      setDebugStatus('plugin nativo respondeu ✓');

      // Step 3: requestAuthorization — 20s timeout (iOS dialog can take time)
      setDebugStatus('solicitando permissão...');
      console.log('[HealthKit] >>> Health.requestAuthorization()');
      try {
        const authResult = await withTimeout(
          Health.requestAuthorization({
            read: ['steps', 'calories', 'weight', 'workouts' as any],
            write: ['calories'],
          }),
          60000,
          'requestAuthorization'
        );
        console.log('[HealthKit] <<< requestAuthorization result:', JSON.stringify(authResult));
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        console.error('[HealthKit] requestAuthorization error:', errMsg);
        setDebugStatus(`timeout/erro autorização: ${errMsg}`);
        return false;
      }

      setDebugStatus('Conectado!');
      localStorage.setItem(HEALTHKIT_CONNECTED_KEY, 'true');
      setIsConnected(true);
      console.log('[HealthKit] === requestPermissions SUCCESS ===');
      return true;
    } catch (error: any) {
      const errMsg = error?.message || String(error);
      console.error('[HealthKit] Unexpected error:', errMsg);
      setDebugStatus(`ERRO: ${errMsg}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isIOS, isNative]);

  const disconnect = useCallback(() => {
    localStorage.removeItem(HEALTHKIT_CONNECTED_KEY);
    setIsConnected(false);
    setDailySteps(0);
    setDailyCalories(0);
    setWeight(null);
    setWeeklyData([]);
    setRecentWorkouts([]);
  }, []);

  const getDailySteps = useCallback(async (): Promise<number> => {
    if (!isConnected || !isSupported) return 0;
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const result = await Health.queryAggregated({
        dataType: 'steps',
        startDate: startOfDay.toISOString(),
        endDate: now.toISOString(),
        bucket: 'day',
        aggregation: 'sum',
      });
      const steps = result?.samples?.[0]?.value ?? 0;
      setDailySteps(Math.round(steps));
      return steps;
    } catch (error) {
      console.error('[HealthKit] Error reading steps:', error);
      return 0;
    }
  }, [isConnected, isSupported]);

  const getDailyActiveCalories = useCallback(async (): Promise<number> => {
    if (!isConnected || !isSupported) return 0;
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const result = await Health.queryAggregated({
        dataType: 'calories',
        startDate: startOfDay.toISOString(),
        endDate: now.toISOString(),
        bucket: 'day',
        aggregation: 'sum',
      });
      const cals = Math.round(result?.samples?.[0]?.value ?? 0);
      setDailyCalories(cals);
      return cals;
    } catch (error) {
      console.error('[HealthKit] Error reading calories:', error);
      return 0;
    }
  }, [isConnected, isSupported]);

  const getWeight = useCallback(async (): Promise<number | null> => {
    if (!isConnected || !isSupported) return null;
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const result = await Health.readSamples({
        dataType: 'weight',
        startDate: thirtyDaysAgo.toISOString(),
        endDate: now.toISOString(),
        limit: 1,
        ascending: false,
      });
      const samples = result?.samples ?? [];
      if (samples.length > 0) {
        const w = samples[0].value;
        setWeight(w);
        return w;
      }
      return null;
    } catch (error) {
      console.error('[HealthKit] Error reading weight:', error);
      return null;
    }
  }, [isConnected, isSupported]);

  const saveMealCalories = useCallback(async (calories: number): Promise<boolean> => {
    if (!isConnected || !isSupported || calories <= 0) return false;
    try {
      const now = new Date().toISOString();
      await Health.saveSample({
        dataType: 'calories',
        value: calories,
        unit: 'kilocalorie',
        startDate: now,
        endDate: now,
      });
      return true;
    } catch (error) {
      console.error('[HealthKit] Error saving meal:', error);
      return false;
    }
  }, [isConnected, isSupported]);

  const getWeeklyData = useCallback(async (): Promise<WeeklyDataPoint[]> => {
    if (!isConnected || !isSupported) return [];
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      const [stepsResult, caloriesResult] = await Promise.all([
        Health.queryAggregated({
          dataType: 'steps',
          startDate: sevenDaysAgo.toISOString(),
          endDate: now.toISOString(),
          bucket: 'day',
          aggregation: 'sum',
        }),
        Health.queryAggregated({
          dataType: 'calories',
          startDate: sevenDaysAgo.toISOString(),
          endDate: now.toISOString(),
          bucket: 'day',
          aggregation: 'sum',
        }),
      ]);
      const stepsMap = new Map<string, number>();
      const caloriesMap = new Map<string, number>();
      stepsResult?.samples?.forEach((s: any) => {
        const dateKey = new Date(s.startDate).toISOString().split('T')[0];
        stepsMap.set(dateKey, Math.round(s.value ?? 0));
      });
      caloriesResult?.samples?.forEach((s: any) => {
        const dateKey = new Date(s.startDate).toISOString().split('T')[0];
        caloriesMap.set(dateKey, Math.round(s.value ?? 0));
      });
      const data: WeeklyDataPoint[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        data.push({
          date: dateKey,
          steps: stepsMap.get(dateKey) ?? 0,
          calories: caloriesMap.get(dateKey) ?? 0,
        });
      }
      setWeeklyData(data);
      return data;
    } catch (error) {
      console.error('[HealthKit] Error reading weekly data:', error);
      return [];
    }
  }, [isConnected, isSupported]);

  const getHeartRate = useCallback(async (): Promise<HeartRateData> => {
    const empty: HeartRateData = { restingBPM: null, averageBPM: null };
    if (!isConnected || !isSupported) return empty;
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Average BPM today
      let averageBPM: number | null = null;
      try {
        const avgResult = await Health.queryAggregated({
          dataType: 'heart_rate' as any,
          startDate: startOfDay.toISOString(),
          endDate: now.toISOString(),
          bucket: 'day',
          aggregation: 'avg' as any,
        });
        const val = avgResult?.samples?.[0]?.value;
        if (typeof val === 'number' && val > 0) averageBPM = Math.round(val);
      } catch (e) {
        console.warn('[HealthKit] heart_rate aggregated error:', e);
      }

      // Resting BPM — most recent sample
      let restingBPM: number | null = null;
      try {
        const restResult = await Health.readSamples({
          dataType: 'heart_rate' as any,
          startDate: startOfDay.toISOString(),
          endDate: now.toISOString(),
          limit: 1,
          ascending: false,
        });
        const val = restResult?.samples?.[0]?.value;
        if (typeof val === 'number' && val > 0) restingBPM = Math.round(val);
      } catch (e) {
        console.warn('[HealthKit] heart_rate samples error:', e);
      }

      const data: HeartRateData = { restingBPM, averageBPM };
      setHeartRate(data);
      return data;
    } catch (error) {
      console.error('[HealthKit] Error reading heart rate:', error);
      return empty;
    }
  }, [isConnected, isSupported]);

  const getSleepAnalysis = useCallback(async (): Promise<SleepData> => {
    const empty: SleepData = { totalMinutes: null, bedtime: null, wakeTime: null };
    if (!isConnected || !isSupported) return empty;
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const result = await Health.readSamples({
        dataType: 'sleep' as any,
        startDate: yesterday.toISOString(),
        endDate: now.toISOString(),
        limit: 100,
        ascending: true,
      });

      const samples = result?.samples ?? [];
      console.log('[HealthKit] sleep raw samples:', JSON.stringify(samples));

      // Filter asleep samples (exclude "inBed" and "awake")
      const asleepSamples = samples.filter((s: any) => {
        const val = s.value;
        // Some plugins use numeric values (1=inBed, 2=asleep, 3=awake), others use strings
        if (typeof val === 'string') {
          const lower = val.toLowerCase();
          return lower.includes('asleep') || lower.includes('core') || lower.includes('deep') || lower.includes('rem');
        }
        // Numeric: 2 = asleep in some implementations
        if (typeof val === 'number') return val === 2;
        return false;
      });

      if (asleepSamples.length === 0 && samples.length > 0) {
        // Fallback: use all samples if no asleep-specific ones found
        let totalMs = 0;
        let earliest = samples[0].startDate;
        let latest = samples[samples.length - 1].endDate;
        for (const s of samples) {
          const start = new Date(s.startDate).getTime();
          const end = new Date(s.endDate).getTime();
          if (end > start) totalMs += end - start;
        }
        const data: SleepData = {
          totalMinutes: totalMs > 0 ? Math.round(totalMs / 60000) : null,
          bedtime: earliest ?? null,
          wakeTime: latest ?? null,
        };
        setSleepData(data);
        return data;
      }

      if (asleepSamples.length === 0) return empty;

      let totalMs = 0;
      for (const s of asleepSamples) {
        const start = new Date(s.startDate).getTime();
        const end = new Date(s.endDate).getTime();
        if (end > start) totalMs += end - start;
      }

      const data: SleepData = {
        totalMinutes: totalMs > 0 ? Math.round(totalMs / 60000) : null,
        bedtime: asleepSamples[0]?.startDate ?? null,
        wakeTime: asleepSamples[asleepSamples.length - 1]?.endDate ?? null,
      };
      setSleepData(data);
      return data;
    } catch (error) {
      console.error('[HealthKit] Error reading sleep:', error);
      return empty;
    }
  }, [isConnected, isSupported]);

  const getRecentWorkouts = useCallback(async (): Promise<RecentWorkout[]> => {
    if (!isConnected || !isSupported) return [];
    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const result = await Health.queryWorkouts({
        startDate: sevenDaysAgo.toISOString(),
        endDate: now.toISOString(),
        limit: 20,
      });
      console.log('[HealthKit] queryWorkouts raw result:', JSON.stringify(result));
      const workouts: RecentWorkout[] = ((result as any)?.workouts ?? []).map((s: any) => {
        const rawData = extractObject(s) ?? {};

        return {
          sourceName: extractString(s.sourceName, s.source, s.appName) ?? 'Apple Health',
          value: extractNumber(s.duration, s.value, s.totalDuration) ?? 0,
          startDate: extractString(s.startDate, s.dateFrom) ?? '',
          endDate: extractString(s.endDate, s.dateTo) ?? '',
          unit: extractString(s.unit, s.durationUnit) ?? 'min',
          sourceId: extractString(s.sourceId, s.bundleIdentifier, s.bundleId),
          workoutType: extractString(s.workoutType, s.activityType, s.type, s.workoutActivityType),
          title: extractString(s.title, s.name),
          calories: extractNumber(s.calories, s.totalEnergyBurned, s.activeEnergyBurned, s.energyBurned),
          caloriesUnit: extractString(s.caloriesUnit, s.energyUnit) ?? 'kcal',
          distance: extractNumber(s.distance, s.totalDistance, s.distanceWalkingRunning),
          distanceUnit: extractString(s.distanceUnit, s.lengthUnit, s.distanceMeasurementUnit),
          notes: extractString(s.notes, s.description),
          metadata: extractObject(s.metadata) ?? extractObject(s.workoutStatistics),
          rawData,
        };
      });
      setRecentWorkouts(workouts);
      return workouts;
    } catch (error) {
      console.error('[HealthKit] Error reading workouts:', error);
      return [];
    }
  }, [isConnected, isSupported]);

  const refreshData = useCallback(async () => {
    if (!isConnected || !isSupported) return;
    setIsLoading(true);
    try {
      await Promise.all([
        getDailySteps(),
        getDailyActiveCalories(),
        getWeight(),
        getWeeklyData(),
        getRecentWorkouts(),
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, isSupported, getDailySteps, getDailyActiveCalories, getWeight, getWeeklyData, getRecentWorkouts]);

  return {
    isSupported,
    isConnected,
    isLoading,
    debugStatus,
    dailySteps,
    dailyCalories,
    weight,
    weeklyData,
    recentWorkouts,
    requestPermissions,
    disconnect,
    getDailySteps,
    getDailyActiveCalories,
    getWeight,
    getWeeklyData,
    getRecentWorkouts,
    saveMealCalories,
    refreshData,
  };
};
