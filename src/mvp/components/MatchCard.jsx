/**
 * Match Card component for MVP
 * Displays match summary in lists - optimized for cricket captains
 * API returns: matchId, teamName, status, startTime, userRole, isCaptain, teamCount, backupCount, emergencyCount, requiredPlayers
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  formatMatchDateShort,
  formatTimeOnly,
  getMatchHealth,
  getDaysUntilMatch,
} from '../utils/matchUtils';
import { MATCH_HEALTH, MIN_PLAYERS, MATCH_STATUS } from '../constants';

// Health indicator dot
function HealthDot({ health }) {
  const colorMap = {
    [MATCH_HEALTH.SAFE]: 'var(--mvp-safe)',
    [MATCH_HEALTH.RISK]: 'var(--mvp-risk)',
    [MATCH_HEALTH.CRITICAL]: 'var(--mvp-critical)',
  };
  return (
    <span 
      className="mvp-match-health-dot" 
      style={{ backgroundColor: colorMap[health] || colorMap[MATCH_HEALTH.RISK] }}
      title={health}
    />
  );
}

// Format relative time (e.g., "Tomorrow", "In 3 days", "Today")
function getRelativeTime(startTime) {
  const days = getDaysUntilMatch(startTime);
  if (days < 0) return null;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `In ${days} days`;
  return null;
}

// Format match description line (e.g., "20 overs · Tournament · Pink leather")
function formatMatchDescription(match) {
  const parts = [];
  
  if (match.overs) {
    parts.push(`${match.overs} overs`);
  }
  
  if (match.eventType) {
    const eventLabels = {
      'TOURNAMENT': 'Tournament',
      'FRIENDLY': 'Friendly',
      'LEAGUE': 'League',
      'PRACTICE': 'Practice',
    };
    parts.push(eventLabels[match.eventType] || match.eventType);
  }
  
  // Ball info: combine variant + category (e.g., "Pink leather")
  if (match.ballCategory) {
    const variant = match.ballVariant ? `${match.ballVariant.charAt(0)}${match.ballVariant.slice(1).toLowerCase()} ` : '';
    const category = match.ballCategory.toLowerCase();
    parts.push(`${variant}${category}`);
  }
  
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function MatchCard({ match, userId }) {
  const navigate = useNavigate();
  
  // Player counts from API
  const teamCount = match.teamCount || 0;
  const backupCount = match.backupCount || 0;
  const emergencyCount = match.emergencyCount || 0;
  const confirmedCount = teamCount + backupCount + emergencyCount;
  const requiredPlayers = match.requiredPlayers || MIN_PLAYERS;
  const health = getMatchHealth(confirmedCount);
  const shortage = Math.max(0, requiredPlayers - confirmedCount);
  
  // Status
  const isCompleted = match.status === MATCH_STATUS.COMPLETED;
  const isCancelled = match.status === MATCH_STATUS.CANCELLED;
  const isPast = isCompleted || isCancelled;
  
  // Role
  const isCaptain = match.isCaptain || match.userRole === 'CAPTAIN';
  
  // Time
  const relativeTime = !isPast ? getRelativeTime(match.startTime) : null;
  
  const handleClick = () => {
    navigate(`/matches/${match.matchId}`);
  };

  return (
    <div 
      className={`mvp-match-card ${isPast ? 'mvp-match-card--past' : ''}`} 
      onClick={handleClick}
    >
      {/* Top Row: Date/Time + Status */}
      <div className="mvp-match-card-header">
        <div className="mvp-match-card-datetime">
          <span className="mvp-match-date">{formatMatchDateShort(match.startTime)}</span>
          <span className="mvp-match-time">{formatTimeOnly(match.startTime)}</span>
        </div>
        
        <div className="mvp-match-card-status">
          {isPast ? (
            <span className={`mvp-match-status-tag mvp-match-status-tag--${isCompleted ? 'done' : 'cancelled'}`}>
              {isCompleted ? 'Done' : 'Cancelled'}
            </span>
          ) : (
            <>
              {relativeTime && (
                <span className="mvp-match-relative-time">{relativeTime}</span>
              )}
              <HealthDot health={health} />
            </>
          )}
        </div>
      </div>
      
      {/* Team Name + Role */}
      <div className="mvp-match-card-body">
        <div className="mvp-match-team-row">
          <span className="mvp-match-team">{match.teamName || 'Match'}</span>
          {isCaptain && <span className="mvp-match-role-tag">C</span>}
        </div>
        
        {/* Match Format - Informative single line */}
        {formatMatchDescription(match) && (
          <div className="mvp-match-description">
            {formatMatchDescription(match)}
          </div>
        )}
      </div>
      
      {/* Bottom Row: Squad Status */}
      {!isPast && (
        <div className="mvp-match-card-footer">
          <div className="mvp-match-squad-status">
            <div className="mvp-match-squad-bar">
              <div 
                className="mvp-match-squad-fill"
                style={{ 
                  width: `${Math.min(100, (confirmedCount / requiredPlayers) * 100)}%`,
                  backgroundColor: health === MATCH_HEALTH.SAFE ? 'var(--mvp-safe)' : 
                                   health === MATCH_HEALTH.RISK ? 'var(--mvp-risk)' : 'var(--mvp-critical)'
                }}
              />
            </div>
            <span className="mvp-match-squad-count">
              {confirmedCount}/{requiredPlayers}
            </span>
          </div>
          
          {/* Quick breakdown for captain */}
          {isCaptain && (
            <div className="mvp-match-breakdown">
              {teamCount > 0 && <span className="mvp-match-breakdown-item">{teamCount} team</span>}
              {backupCount > 0 && <span className="mvp-match-breakdown-item mvp-match-breakdown-item--backup">{backupCount} backup</span>}
              {emergencyCount > 0 && <span className="mvp-match-breakdown-item mvp-match-breakdown-item--emergency">{emergencyCount} emergency</span>}
              {shortage > 0 && <span className="mvp-match-breakdown-item mvp-match-breakdown-item--shortage">Need {shortage}</span>}
            </div>
          )}
        </div>
      )}
      
      {/* Fee indicator */}
      {match.feePerPerson > 0 && (
        <div className="mvp-match-fee-tag">₹{match.feePerPerson}</div>
      )}
    </div>
  );
}

/**
 * Compact match card for attention items
 */
export function MatchCardCompact({ match, label, onClick }) {
  const days = getDaysUntilMatch(match.startTime);
  const isUrgent = days <= 2;
  
  return (
    <div className={`mvp-match-card-compact ${isUrgent ? 'mvp-match-card-compact--urgent' : ''}`} onClick={onClick}>
      <div className="mvp-match-card-compact-info">
        <span className="mvp-match-date">{formatMatchDateShort(match.startTime)}</span>
        <span className="mvp-match-team">{match.teamName || 'Match'}</span>
      </div>
      <span className="mvp-attention-label">{label}</span>
    </div>
  );
}

/**
 * Empty state for match lists
 */
export function NoMatches({ message = 'No matches yet' }) {
  return (
    <div className="mvp-empty-state">
      <div className="mvp-empty-icon">+</div>
      <p className="mvp-empty-title">{message}</p>
      <p>Create a match to get started</p>
    </div>
  );
}
