/**
 * Countdown timer display component
 */

import React from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { formatRemainingTime } from '../utils/timerUtils';

/**
 * Countdown timer display
 */
export function CountdownTimer({
  expiresAt,
  onExpire,
  label = 'Time remaining',
  showLabel = true,
  size = 'default', // 'small' | 'default' | 'large'
}) {
  const time = useCountdown(expiresAt, onExpire);

  if (!time || time.expired) {
    return (
      <div className={`mvp-countdown mvp-countdown--${size} mvp-countdown--expired`}>
        {showLabel && <span className="mvp-countdown-label">{label}</span>}
        <span className="mvp-countdown-time">Expired</span>
      </div>
    );
  }

  const timeStr = formatRemainingTime(expiresAt);
  const isUrgent = time.minutes < 5;

  return (
    <div className={`mvp-countdown mvp-countdown--${size} ${isUrgent ? 'mvp-countdown--urgent' : ''}`}>
      {showLabel && <span className="mvp-countdown-label">{label}</span>}
      <span className="mvp-countdown-time">{timeStr}</span>
    </div>
  );
}

/**
 * Circular progress countdown
 */
export function CircularCountdown({
  expiresAt,
  createdAt,
  onExpire,
  size = 80,
}) {
  const time = useCountdown(expiresAt, onExpire);

  if (!time) return null;

  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Calculate progress
  const start = new Date(createdAt).getTime();
  const end = new Date(expiresAt).getTime();
  const now = Date.now();
  const total = end - start;
  const elapsed = now - start;
  const progress = Math.min(elapsed / total, 1);
  const offset = circumference - progress * circumference;

  const isUrgent = time.minutes < 5;
  const timeStr = formatRemainingTime(expiresAt);

  return (
    <div className="mvp-circular-countdown" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          className="mvp-countdown-bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          className={`mvp-countdown-progress ${isUrgent ? 'mvp-countdown-progress--urgent' : ''}`}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="mvp-countdown-center">
        <span className={`mvp-countdown-value ${time.expired ? 'expired' : ''}`}>
          {time.expired ? '00:00' : timeStr}
        </span>
      </div>
    </div>
  );
}

/**
 * Inline countdown badge
 */
export function CountdownBadge({ expiresAt, onExpire }) {
  const time = useCountdown(expiresAt, onExpire);

  if (!time || time.expired) {
    return <span className="mvp-countdown-badge mvp-countdown-badge--expired">Expired</span>;
  }

  const timeStr = formatRemainingTime(expiresAt);
  const isUrgent = time.minutes < 5;

  return (
    <span className={`mvp-countdown-badge ${isUrgent ? 'mvp-countdown-badge--urgent' : ''}`}>
      {timeStr}
    </span>
  );
}
