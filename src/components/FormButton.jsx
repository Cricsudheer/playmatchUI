/**
 * Reusable form submit button with loading state
 */
export function FormButton({ children, loading = false, disabled = false, onClick, type = 'submit' }) {
  return (
    <button
      type={type}
      className="auth-button"
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span className="spinner"></span>
          {typeof children === 'string' && children.includes('ing') ? children : 'Loading...'}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
