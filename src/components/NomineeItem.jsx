import { buildStatPills, formatStatLabel } from '../utils/nomineeUtils';
import { getNomineeRank } from '../utils/awardUtils';

/**
 * Nominee Item Component
 * Displays individual nominee with stats and ranking
 */
export function NomineeItem({ nominee, position }) {
  const isMain = position === 0;
  const { emoji, label: rankLabel } = getNomineeRank(position);
  const statPills = buildStatPills(nominee);

  return (
    <div className={`nominee ${isMain ? 'main' : ''}`}>
      <div className="nominee-main">
        <div className="nominee-name-row">
          <div className="nominee-name">{nominee.name}</div>
          {isMain && <span className="nominee-chip">Likely Winner</span>}
        </div>
        <div className="nominee stats">
          {statPills.map((pill) => (
            <span key={pill.label} className="stat-pill">
              <strong>{pill.value}</strong> {formatStatLabel(pill.label)}
            </span>
          ))}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="nominee-rank">{emoji}</div>
        <div className="nominee-rank-label">{rankLabel}</div>
      </div>
    </div>
  );
}
