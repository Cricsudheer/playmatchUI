/**
 * Team Search Bar Component
 */

import React from 'react';
import { Search, X } from 'lucide-react';

export function TeamSearchBar({ 
  value, 
  onChange, 
  placeholder = 'Search teams...',
  onClear,
}) {
  return (
    <div style={styles.container}>
      <Search size={18} style={styles.icon} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
      {value && (
        <button 
          style={styles.clearButton} 
          onClick={() => onClear ? onClear() : onChange('')}
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-muted, #9ca3af)',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '12px 40px 12px 44px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
    borderRadius: '12px',
    color: 'var(--text-primary, #fff)',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'border-color 0.2s, background-color 0.2s',
  },
  clearButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted, #9ca3af)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
  },
};

export default TeamSearchBar;
