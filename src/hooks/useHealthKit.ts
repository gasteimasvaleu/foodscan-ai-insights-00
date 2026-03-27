import { useState, useCallback, useEffect } from 'react';
import { useNativePlatform } from './useNativePlatform';

const HEALTHKIT_CONNECTED_KEY = 'healthkit_connected';

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('HealthKit timeout')), ms)
    ),
  ]);

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

  // Log environment on every render (will appear in Xcode console)
  console.log('[HealthKit] Hook loaded | isIOS:', isIOS, '| isNative:', isNative, '| isSupported:', isSupported);

  useEffect(() => {
    const stored = localStorage.getItem(HEALTHKIT_CONNECTED_KEY);
    if (stored === 'true' && isSupported) {
      setIsConnected(true);
    }
  }, [isSupported]);

  const getHealthPlugin = useCallback(async () => {
    try {
      console.log('[HealthKit] Attempting dynamic import of @capgo/capacitor-health...');
      const module = await import('@capgo/capacitor-health');
      console.log('[HealthKit] Import successful, module keys:', Object.keys(module));
      const { Health } = module;
      console.log('[HealthKit] Health plugin object:', Health);
      return Health;
    } catch (error) {
      console.error('[HealthKit] Failed to import plugin:', error);
      return null;
    }
  }, []);

  const checkAvailability = useCallback(async (): Promise<boolean> => {
    console.log('[HealthKit] checkAvailability called, isSupported:', isSupported);
    if (!isSupported) return false;
    try {
      const Health = await getHealthPlugin();
      if (!Health) {
        console.warn('[HealthKit] checkAvailability: plugin is null');
        return false;
      }
      console.log('[HealthKit] Calling Health.isAvailable()...');
      console.log('[HealthKit] Health methods:', typeof Health.isAvailable, typeof Health.requestAuthorization);
      const result = await withTimeout(Health.isAvailable(), 10000);
      console.log('[HealthKit] isAvailable result:', JSON.stringify(result));
      return result.available;
    } catch (error: any) {
      console.error('[HealthKit] checkAvailability error:', JSON.stringify(error, Object.getOwnPropertyNames(error ?? {})));
      return false;
    }
  }, [isSupported, getHealthPlugin]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    console.log('[HealthKit] requestPermissions called, isSupported:', isSupported);
    setDebugStatus('requestPermissions called');
    if (!isSupported) {
      const msg = `Not supported (isIOS=${isIOS}, isNative=${isNative})`;
      console.warn('[HealthKit]', msg);
      setDebugStatus(msg);
      return false;
    }
    setIsLoading(true);
    try {
      setDebugStatus('Importing plugin...');
      console.log('[HealthKit] Getting health plugin...');
      const Health = await getHealthPlugin();
      if (!Health) {
        setDebugStatus('ERROR: plugin is null');
        console.error('[HealthKit] Plugin is null after import');
        return false;
      }

      setDebugStatus('Checking availability...');
      console.log('[HealthKit] Checking availability...');
      const available = await checkAvailability();
      console.log('[HealthKit] Available:', available);
      if (!available) {
        setDebugStatus('ERROR: HealthKit not available');
        console.warn('[HealthKit] HealthKit not available on this device');
        return false;
      }

      setDebugStatus('Requesting authorization...');
      console.log('[HealthKit] Calling requestAuthorization...');
      await withTimeout(
        Health.requestAuthorization({
          read: ['steps', 'calories', 'weight'],
          write: ['calories'],
        }),
        15000
      );
      console.log('[HealthKit] requestAuthorization succeeded!');
      setDebugStatus('Connected!');

      localStorage.setItem(HEALTHKIT_CONNECTED_KEY, 'true');
      setIsConnected(true);
      return true;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('[HealthKit] requestPermissions error:', error);
      setDebugStatus(`ERROR: ${errMsg}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isIOS, isNative, getHealthPlugin, checkAvailability]);

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
      const Health = await getHealthPlugin();
      if (!Health) return 0;

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
      console.error('Error reading steps:', error);
      return 0;
    }
  }, [isConnected, isSupported, getHealthPlugin]);

  const getDailyActiveCalories = useCallback(async (): Promise<number> => {
    if (!isConnected || !isSupported) return 0;
    try {
      const Health = await getHealthPlugin();
      if (!Health) return 0;

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
      console.error('Error reading calories:', error);
      return 0;
    }
  }, [isConnected, isSupported, getHealthPlugin]);

  const getWeight = useCallback(async (): Promise<number | null> => {
    if (!isConnected || !isSupported) return null;
    try {
      const Health = await getHealthPlugin();
      if (!Health) return null;

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
      console.error('Error reading weight:', error);
      return null;
    }
  }, [isConnected, isSupported, getHealthPlugin]);

  const saveMealCalories = useCallback(async (calories: number): Promise<boolean> => {
    if (!isConnected || !isSupported || calories <= 0) return false;
    try {
      const Health = await getHealthPlugin();
      if (!Health) return false;

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
      console.error('Error saving meal to HealthKit:', error);
      return false;
    }
  }, [isConnected, isSupported, getHealthPlugin]);

  const getWeeklyData = useCallback(async (): Promise<WeeklyDataPoint[]> => {
    if (!isConnected || !isSupported) return [];
    try {
      const Health = await getHealthPlugin();
      if (!Health) return [];

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const [stepsResult, caloriesResult] = await Promise.all([
        withTimeout(Health.queryAggregated({
          dataType: 'steps',
          startDate: sevenDaysAgo.toISOString(),
          endDate: now.toISOString(),
          bucket: 'day',
          aggregation: 'sum',
        }), 10000),
        withTimeout(Health.queryAggregated({
          dataType: 'calories',
          startDate: sevenDaysAgo.toISOString(),
          endDate: now.toISOString(),
          bucket: 'day',
          aggregation: 'sum',
        }), 10000),
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
      console.error('Error reading weekly data:', error);
      return [];
    }
  }, [isConnected, isSupported, getHealthPlugin]);

  const getRecentWorkouts = useCallback(async (): Promise<RecentWorkout[]> => {
    if (!isConnected || !isSupported) return [];
    try {
      const Health = await getHealthPlugin();
      if (!Health) return [];

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const result = await withTimeout(Health.readSamples({
        dataType: 'workout' as any,
        startDate: sevenDaysAgo.toISOString(),
        endDate: now.toISOString(),
        limit: 20,
        ascending: false,
      }), 10000);

      const workouts: RecentWorkout[] = (result?.samples ?? []).map((s: any) => ({
        sourceName: s.sourceName ?? 'Apple Health',
        value: s.value ?? 0,
        startDate: s.startDate ?? '',
        endDate: s.endDate ?? '',
        unit: s.unit ?? 'min',
      }));

      setRecentWorkouts(workouts);
      return workouts;
    } catch (error) {
      console.error('Error reading workouts:', error);
      return [];
    }
  }, [isConnected, isSupported, getHealthPlugin]);

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
