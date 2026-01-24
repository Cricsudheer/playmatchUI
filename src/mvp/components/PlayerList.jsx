/**
 * Player list components for MVP
 * Used in Match Control dashboard
 * Per FRONTEND.md: participants have { userId, name, phoneNumber, role, status, feeAmount, paymentStatus, paymentMode }
 */

import React from 'react';
import { ParticipantStatusBadge, ParticipantRoleBadge, PaymentBadge } from './Badge';
import { IconButton } from './Button';
import { PARTICIPANT_STATUS, PARTICIPANT_ROLES } from '../constants';

/**
 * Single player/participant item in list
 */
export function PlayerItem({
  player,
  showPayment = false,
  showActions = false,
  onRemove,
  isCaptain = false,
}) {
  const isConfirmed = player.status === PARTICIPANT_STATUS.CONFIRMED;
  const isBackedOut = player.status === PARTICIPANT_STATUS.BACKED_OUT;
  const isNoShow = player.status === PARTICIPANT_STATUS.NO_SHOW;
  
  return (
    <div className={`mvp-player-item ${!isConfirmed ? 'mvp-player-item--inactive' : ''}`}>
      <div className="mvp-player-avatar">
        {player.name?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="mvp-player-info">
        <span className="mvp-player-name">
          {player.name || 'Unknown'}
          {player.role === PARTICIPANT_ROLES.EMERGENCY && <span className="mvp-player-emergency-tag">Emergency</span>}
        </span>
        <span className="mvp-player-phone">
          {player.phoneNumber ? `+91 ****${player.phoneNumber.slice(-4)}` : ''}
        </span>
      </div>
      <div className="mvp-player-status">
        <ParticipantRoleBadge role={player.role} />
        {showPayment && isConfirmed && (
          <PaymentBadge status={player.paymentStatus} />
        )}
      </div>
      {showActions && isCaptain && isConfirmed && (
        <IconButton
          icon="✕"
          onClick={() => onRemove?.(player)}
          variant="danger"
          label="Remove player"
        />
      )}
    </div>
  );
}

/**
 * Grouped player list (per FRONTEND.md - grouped by role: TEAM, BACKUP, EMERGENCY)
 */
export function PlayerList({
  players = [],
  groupByStatus = true,
  showPayment = false,
  showActions = false,
  onRemove,
  isCaptain = false,
}) {
  if (!groupByStatus) {
    return (
      <div className="mvp-player-list">
        {players.map(player => (
          <PlayerItem
            key={player.userId}
            player={player}
            showPayment={showPayment}
            showActions={showActions}
            onRemove={onRemove}
            isCaptain={isCaptain}
          />
        ))}
      </div>
    );
  }

  // Group by role per FRONTEND.md
  const teamPlayers = players.filter(p => p.role === PARTICIPANT_ROLES.TEAM && p.status === PARTICIPANT_STATUS.CONFIRMED);
  const backupPlayers = players.filter(p => p.role === PARTICIPANT_ROLES.BACKUP && p.status === PARTICIPANT_STATUS.CONFIRMED);
  const emergencyPlayers = players.filter(p => p.role === PARTICIPANT_ROLES.EMERGENCY && p.status === PARTICIPANT_STATUS.CONFIRMED);
  const backedOut = players.filter(p => 
    p.status === PARTICIPANT_STATUS.BACKED_OUT ||
    p.status === PARTICIPANT_STATUS.NO_SHOW
  );

  return (
    <div className="mvp-player-list-grouped">
      {teamPlayers.length > 0 && (
        <div className="mvp-player-group">
          <h4 className="mvp-player-group-title mvp-player-group-title--confirmed">
            Team ({teamPlayers.length})
          </h4>
          {teamPlayers.map(player => (
            <PlayerItem
              key={player.userId}
              player={player}
              showPayment={showPayment}
              showActions={showActions}
              onRemove={onRemove}
              isCaptain={isCaptain}
            />
          ))}
        </div>
      )}

      {backupPlayers.length > 0 && (
        <div className="mvp-player-group">
          <h4 className="mvp-player-group-title mvp-player-group-title--pending">
            Backup ({backupPlayers.length})
          </h4>
          {backupPlayers.map(player => (
            <PlayerItem
              key={player.userId}
              player={player}
              showPayment={showPayment}
              showActions={showActions}
              onRemove={onRemove}
              isCaptain={isCaptain}
            />
          ))}
        </div>
      )}

      {emergencyPlayers.length > 0 && (
        <div className="mvp-player-group">
          <h4 className="mvp-player-group-title mvp-player-group-title--emergency">
            Emergency ({emergencyPlayers.length})
          </h4>
          {emergencyPlayers.map(player => (
            <PlayerItem
              key={player.userId}
              player={player}
              showPayment={showPayment}
              showActions={showActions}
              onRemove={onRemove}
              isCaptain={isCaptain}
            />
          ))}
        </div>
      )}

      {backedOut.length > 0 && (
        <div className="mvp-player-group">
          <h4 className="mvp-player-group-title mvp-player-group-title--backedout">
            Backed Out ({backedOut.length})
          </h4>
          {backedOut.map(player => (
            <PlayerItem
              key={player.userId}
              player={player}
              showPayment={false}
              showActions={false}
              isCaptain={isCaptain}
            />
          ))}
        </div>
      )}

      {players.length === 0 && (
        <div className="mvp-player-list-empty">
          No players yet
        </div>
      )}
    </div>
  );
}

/**
 * Player count display
 */
export function PlayerCount({ confirmed, total = 11 }) {
  const percentage = Math.min((confirmed / total) * 100, 100);
  const isSafe = confirmed >= total;
  const isRisk = confirmed >= 8 && confirmed < total;
  
  let statusClass = 'mvp-player-count--critical';
  if (isSafe) statusClass = 'mvp-player-count--safe';
  else if (isRisk) statusClass = 'mvp-player-count--risk';

  return (
    <div className={`mvp-player-count ${statusClass}`}>
      <div className="mvp-player-count-bar">
        <div 
          className="mvp-player-count-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mvp-player-count-text">
        <span className="mvp-player-count-number">{confirmed}</span>
        <span className="mvp-player-count-separator">/</span>
        <span className="mvp-player-count-total">{total}</span>
        <span className="mvp-player-count-label">players confirmed</span>
      </div>
    </div>
  );
}
