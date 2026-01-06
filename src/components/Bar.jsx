/**
 * Bar Component
 * Renders a visual bar chart element
 */
export function Bar({ pct }) {
  return (
    <div className="bar-bg">
      <div
        className="bar-fill visible"
        style={{ transform: `scaleX(${pct || 0})` }}
      />
    </div>
  );
}
