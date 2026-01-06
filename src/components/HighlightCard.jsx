/**
 * HighlightCard Component
 * Displays key player statistics in a card format
 */
export function HighlightCard({
  title,
  pill,
  player,
  primaryValue,
  primaryLabel,
  subText,
  chip,
}) {
  return (
    <div className="card-highlight">
      <div className="card-highlight-header">
        <div className="card-highlight-title">{title}</div>
        <div className="pill-small">{pill}</div>
      </div>
      <div className="card-highlight-main">
        <div className="card-highlight-name">{player}</div>
        <div className="card-highlight-stat">
          <div className="card-highlight-stat-value">{primaryValue}</div>
          <div className="card-highlight-stat-label">{primaryLabel}</div>
        </div>
      </div>
      <div className="card-highlight-footer">
        <span>{subText}</span>
        {chip && <span className="chip chip-accent">{chip}</span>}
      </div>
    </div>
  );
}
