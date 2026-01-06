import { NomineeItem } from './NomineeItem';
import { buildPrimaryTag, buildAwardChips } from '../utils/awardUtils';

/**
 * Award Card Component
 * Displays a single award with nominees and details
 */
export function AwardCard({ award }) {
  const tag = buildPrimaryTag(award);
  const chips = buildAwardChips(award);

  return (
    <article className="award-card">
      <div className="award-header">
        <div>
          <div className="award-title">{award.title}</div>
        </div>
        <div className="award-tag">{tag}</div>
      </div>

      <div className="award-description">{award.description}</div>

      <div className="nominee-label">Shortlisted players</div>

      <div className="nominee-list">
        {award.nominees.map((nominee, idx) => (
          <NomineeItem key={idx} nominee={nominee} position={idx} />
        ))}
      </div>

      <div className="award-footer">
        <span>
          Use this award as a <span className="highlight">conversation starter</span> in team
          meetings, not just a trophy.
        </span>
        <div className="mini-chip-row">
          {chips.map((chip) => (
            <span
              key={chip}
              className={`mini-chip${chip.includes('Nominees') ? '' : ' accent'}`}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
