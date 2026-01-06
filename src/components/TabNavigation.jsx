import { classNames } from '../utils/classNameUtils';
import { TABS } from '../constants/config';

/**
 * TabNavigation Component
 * Displays tab buttons for different views
 */
export function TabNavigation({
  activeTab,
  setActiveTab,
  playerCounts,
}) {
  const tabs = [
    { id: TABS.OVERVIEW, label: 'Overview', count: playerCounts.all },
    { id: TABS.BATTING, label: 'Batting', count: playerCounts.batting },
    { id: TABS.BOWLING, label: 'Bowling', count: playerCounts.bowling },
    { id: TABS.FIELDING, label: 'Fielding', count: playerCounts.fielding },
  ];

  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={classNames(
            'tab-button',
            activeTab === tab.id && 'active'
          )}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
          <span className="count">{tab.count}</span>
        </button>
      ))}
    </div>
  );
}
