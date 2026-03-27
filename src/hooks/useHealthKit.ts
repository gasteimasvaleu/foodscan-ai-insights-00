import { useState, useCallback, useEffect, useRef } from 'react';
import { useNativePlatform } from './useNativePlatform';
import { Capacitor } from '@capacitor/core';

const HEALTHKIT_CONNECTED_KEY = 'healthkit_connected';
const BUILD_ID = 'HK-BUILD-2026-03-27-A';

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
  const pluginRef = useRef<any>(null);

  const isSupported = isIOS && isNative;

  // Log build ID once to confirm bundle is fresh
  console.log(`[HealthKit] ${BUILD_ID} | isIOS:${isIOS} isNative:${isNative} isSupported:${isSupported}`);

  useEffect(() => {
    const stored = localStorage.getItem(HEALTHKIT_CONNECTED_KEY);
    if (stored === 'true' && isSupported) {
      setIsConnected(true);
    }
  }, [isSupported]);

  const getHealthPlugin = useCallback(async () => {
    if (pluginRef.current) return pluginRef.current;
    try {
      // 1. Check if the native side registered the plugin
      const pluginName = 'CapgoCapacitorHealth';
      const isRegistered = Capacitor.isPluginAvailable(pluginName);
      console.log(`[HealthKit] Capacitor.isPluginAvailable('${pluginName}'):`, isRegistered);

      // 2. List ALL registered plugins for debugging
      try {
        const allPlugins = Object.keys((Capacitor as any).Plugins || {});
        console.log('[HealthKit] All registered Capacitor.Plugins:', JSON.stringify(allPlugins));
      } catch (e) {
        console.log('[HealthKit] Could not list Capacitor.Plugins:', String(e));
      }

      // 3. Also try the alternative name
      const altRegistered = Capacitor.isPluginAvailable('Health');
      console.log(`[HealthKit] Capacitor.isPluginAvailable('Health'):`, altRegistered);

      // 4. Import the JS wrapper
      console.log('[HealthKit] Importing @capgo/capacitor-health...');
      const module = await import('@capgo/capacitor-health');
      console.log('[HealthKit] Import OK, keys:', Object.keys(module));
      const { Health } = module;

      // 5. Log what methods are available on the proxy
      console.log('[HealthKit] Health typeof:', typeof Health);
      console.log('[HealthKit] Health.isAvailable typeof:', typeof Health?.isAvailable);
      console.log('[HealthKit] Health.requestAuthorization typeof:', typeof Health?.requestAuthorization);

      pluginRef.current = Health;
      return Health;
    } catch (error) {
      console.error('[HealthKit] getHealthPlugin FAILED:', String(error));
      return null;
    }
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    console.log('[HealthKit] === requestPermissions START ===');
    setDebugStatus('starting...');
    if (!isSupported) {
      const msg = `Not supported (isIOS=${isIOS}, isNative=${isNative})`;
      console.warn('[HealthKit]', msg);
      setDebugStatus(msg);
      return false;
    }
    setIsLoading(true);
    try {
      // Step 1: Get plugin
      setDebugStatus('getting plugin...');
      const Health = await getHealthPlugin();
      if (!Health) {
        setDebugStatus('ERROR: plugin is null');
        return false;
      }

      // Step 2: isAvailable (NO timeout – let it run or fail naturally)
      setDebugStatus('calling isAvailable...');
      console.log('[HealthKit] >>> calling Health.isAvailable() NOW');
      try {
        const availResult = await Health.isAvailable();
        console.log('[HealthKit] <<< isAvailable returned:', JSON.stringify(availResult));
        if (!availResult?.available) {
          setDebugStatus('HealthKit not available on device');
          return false;
        }
      } catch (availErr: any) {
        console.error('[HealthKit] isAvailable ERROR message:', availErr?.message);
        console.error('[HealthKit] isAvailable ERROR string:', String(availErr));
        setDebugStatus(`isAvailable error: ${availErr?.message || String(availErr)}`);
        return false;
      }

      // Step 3: requestAuthorization (NO timeout – let iOS show the dialog)
      setDebugStatus('requesting authorization...');
      console.log('[HealthKit] >>> calling Health.requestAuthorization() NOW');
      try {
        const authResult = await Health.requestAuthorization({
          read: ['steps', 'calories', 'weight'],
          write: ['calories'],
        });
        console.log('[HealthKit] <<< requestAuthorization returned:', JSON.stringify(authResult));
      } catch (authErr: any) {
        console.error('[HealthKit] requestAuthorization ERROR message:', authErr?.message);
        console.error('[HealthKit] requestAuthorization ERROR string:', String(authErr));
        setDebugStatus(`auth error: ${authErr?.message || String(authErr)}`);
        return false;
      }

      // Success
      setDebugStatus('Connected!');
      localStorage.setItem(HEALTHKIT_CONNECTED_KEY, 'true');
      setIsConnected(true);
      console.log('[HealthKit] === requestPermissions SUCCESS ===');
      return true;
    } catch (error: any) {
      console.error('[HealthKit] requestPermissions UNEXPECTED error message:', error?.message);
      console.error('[HealthKit] requestPermissions UNEXPECTED error string:', String(error));
      setDebugStatus(`ERROR: ${error?.message || String(error)}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, isIOS, isNative, getHealthPlugin]);

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
      const result = await Health.readSamples({
        dataType: 'workout' as any,
        startDate: sevenDaysAgo.toISOString(),
        endDate: now.toISOString(),
        limit: 20,
        ascending: false,
      });
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
