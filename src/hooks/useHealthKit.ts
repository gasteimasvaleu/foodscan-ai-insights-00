import { useState, useCallback, useEffect } from 'react';
import { useNativePlatform } from './useNativePlatform';

const HEALTHKIT_CONNECTED_KEY = 'healthkit_connected';

export const useHealthKit = () => {
  const { isIOS, isNative } = useNativePlatform();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dailySteps, setDailySteps] = useState<number>(0);
  const [dailyCalories, setDailyCalories] = useState<number>(0);
  const [weight, setWeight] = useState<number | null>(null);

  const isSupported = isIOS && isNative;

  useEffect(() => {
    const stored = localStorage.getItem(HEALTHKIT_CONNECTED_KEY);
    if (stored === 'true' && isSupported) {
      setIsConnected(true);
    }
  }, [isSupported]);

  const getHealthPlugin = useCallback(async () => {
    try {
      const { Health } = await import('@capgo/capacitor-health');
      return Health;
    } catch {
      console.warn('HealthKit plugin not available');
      return null;
    }
  }, []);

  const checkAvailability = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    try {
      const Health = await getHealthPlugin();
      if (!Health) return false;
      const { available } = await Health.isAvailable();
      return available;
    } catch {
      return false;
    }
  }, [isSupported, getHealthPlugin]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    setIsLoading(true);
    try {
      const Health = await getHealthPlugin();
      if (!Health) return false;

      const available = await checkAvailability();
      if (!available) {
        console.warn('HealthKit not available on this device');
        return false;
      }

      await Health.requestAuthorization({
        read: ['steps', 'calories', 'weight'],
        write: ['calories'],
      });

      localStorage.setItem(HEALTHKIT_CONNECTED_KEY, 'true');
      setIsConnected(true);
      return true;
    } catch (error) {
      console.error('Error requesting HealthKit permissions:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, getHealthPlugin, checkAvailability]);

  const disconnect = useCallback(() => {
    localStorage.removeItem(HEALTHKIT_CONNECTED_KEY);
    setIsConnected(false);
    setDailySteps(0);
    setDailyCalories(0);
    setWeight(null);
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

  const refreshData = useCallback(async () => {
    if (!isConnected || !isSupported) return;
    setIsLoading(true);
    try {
      await Promise.all([getDailySteps(), getDailyActiveCalories(), getWeight()]);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, isSupported, getDailySteps, getDailyActiveCalories, getWeight]);

  return {
    isSupported,
    isConnected,
    isLoading,
    dailySteps,
    dailyCalories,
    weight,
    requestPermissions,
    disconnect,
    getDailySteps,
    getDailyActiveCalories,
    getWeight,
    saveMealCalories,
    refreshData,
  };
};
