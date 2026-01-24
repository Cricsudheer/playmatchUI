/**
 * Custom hook for countdown timer
 * Used for emergency request expiry countdown
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getRemainingTime, isExpired } from '../utils/timerUtils';

/**
 * Hook for countdown timer with automatic updates
 */
export function useCountdown(expiresAt, onExpire) {
  const [time, setTime] = useState(() => getRemainingTime(expiresAt));
  const intervalRef = useRef(null);

  const updateTime = useCallback(() => {
    const newTime = getRemainingTime(expiresAt);
    setTime(newTime);

    if (newTime?.expired && onExpire) {
      onExpire();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [expiresAt, onExpire]);

  useEffect(() => {
    // Initial update
    updateTime();

    // Don't start interval if already expired or no expiry time
    if (!expiresAt || isExpired(expiresAt)) {
      return;
    }

    // Update every second
    intervalRef.current = setInterval(updateTime, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [expiresAt, updateTime]);

  return time;
}

/**
 * Hook for multiple countdowns (e.g., list of emergency requests)
 */
export function useMultipleCountdowns(items, expiresAtKey = 'expiresAt') {
  const [times, setTimes] = useState({});

  useEffect(() => {
    const updateTimes = () => {
      const newTimes = {};
      items.forEach(item => {
        if (item.id && item[expiresAtKey]) {
          newTimes[item.id] = getRemainingTime(item[expiresAtKey]);
        }
      });
      setTimes(newTimes);
    };

    updateTimes();

    // Only run interval if there are non-expired items
    const hasActiveCountdowns = items.some(
      item => item[expiresAtKey] && !isExpired(item[expiresAtKey])
    );

    if (!hasActiveCountdowns) {
      return;
    }

    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [items, expiresAtKey]);

  return times;
}
