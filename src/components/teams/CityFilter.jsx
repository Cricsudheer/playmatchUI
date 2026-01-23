/**
 * City Filter Component
 * Horizontal scrollable filter chips for cities
 */

import React from 'react';

export function CityFilter({ 
  cities = [], 
  selected, 
  onSelect,
  showAllOption = true,
}) {
  const allCities = showAllOption ? ['All', ...cities] : cities;

  return (
    <div style={styles.container}>
      <div style={styles.scrollContainer}>
        {allCities.map((city) => {
          const isSelected = selected === city || (city === 'All' && !selected);
          return (
            <button
              key={city}
              style={{
                ...styles.chip,
                ...(isSelected ? styles.chipActive : {}),
              }}
              onClick={() => onSelect(city === 'All' ? null : city)}
            >
              {city}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginBottom: '16px',
  },
  scrollContainer: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '8px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },
  chip: {
    padding: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
    borderRadius: '20px',
    color: 'var(--text-secondary, #cbd5e1)',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  chipActive: {
    backgroundColor: 'var(--primary, #1e88e5)',
    borderColor: 'var(--primary, #1e88e5)',
    color: '#fff',
  },
};

export default CityFilter;
