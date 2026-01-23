/**
 * Discoverable Team Card Component
 * Modern compact card for teams in the discovery/browse view
 */

import React from 'react';
import { MapPin, Crown } from 'lucide-react';
import { JoinRequestButton } from '../joinRequests/JoinRequestButton';

export function DiscoverTeamCard({
  team,
  isMember = false,
  onRequestJoin,
  onCancelRequest,
  onClick,
}) {
  const { 
    id, 
    name, 
    city, 
    logoUrl, 
    description,
    adminName,
    captainName,
  } = team;

  // Get the captain/admin display name
  const leaderName = adminName || captainName || null;
  
  // Generate initials for avatar fallback
  const getInitials = (teamName) => {
    if (!teamName) return '🏏';
    const words = teamName.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return teamName.substring(0, 2).toUpperCase();
  };

  // Generate a consistent gradient based on team name
  const getGradient = (teamName) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    ];
    const index = teamName ? teamName.charCodeAt(0) % gradients.length : 0;
    return gradients[index];
  };

  return (
    <div 
      style={styles.card} 
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.25)';
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
      }}
    >
      {/* Card Header with Logo & Name */}
      <div style={styles.header}>
        {/* Team Logo/Avatar */}
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt={name} 
            style={styles.logo}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          style={{ 
            ...styles.avatarFallback, 
            background: getGradient(name),
            display: logoUrl ? 'none' : 'flex' 
          }}
        >
          {getInitials(name)}
        </div>

        {/* Team Name & Location */}
        <div style={styles.headerInfo}>
          <h3 style={styles.name}>{name}</h3>
          <div style={styles.metaRow}>
            <MapPin size={12} style={styles.metaIcon} />
            <span style={styles.metaText}>{city || 'TBD'}</span>
            {leaderName && (
              <>
                <span style={styles.metaDot}>•</span>
                <Crown size={12} style={{ ...styles.metaIcon, color: '#fbbf24' }} />
                <span style={styles.metaText}>{leaderName}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description (if exists) */}
      {description && (
        <p style={styles.description}>{description}</p>
      )}

      {/* Action Button */}
      <div style={styles.action} onClick={(e) => e.stopPropagation()}>
        <JoinRequestButton
          teamId={id}
          teamName={name}
          isMember={isMember}
          onRequestJoin={onRequestJoin}
          onCancelRequest={onCancelRequest}
          size="small"
          fullWidth
        />
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--card-bg, #1e293b)',
    borderRadius: '14px',
    padding: '14px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    objectFit: 'cover',
    flexShrink: 0,
  },
  avatarFallback: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    color: 'var(--text-primary, #fff)',
    margin: '0 0 4px 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexWrap: 'wrap',
  },
  metaIcon: {
    color: 'var(--text-muted, #9ca3af)',
    flexShrink: 0,
  },
  metaText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted, #9ca3af)',
  },
  metaDot: {
    color: 'var(--text-muted, #9ca3af)',
    fontSize: '0.75rem',
    margin: '0 2px',
  },
  description: {
    fontSize: '0.8125rem',
    color: 'var(--text-muted, #9ca3af)',
    margin: 0,
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  action: {
    marginTop: 'auto',
  },
};

export default DiscoverTeamCard;
