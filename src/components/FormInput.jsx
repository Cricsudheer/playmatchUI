import { classNames } from '../utils/classNameUtils';

/**
 * Reusable form input component with label and error display
 */
export function FormInput({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  required = false,
  disabled = false,
  options,
}) {
  // For select dropdown
  if (type === 'select' && options) {
    return (
      <div className="form-group">
        <label className="form-label" htmlFor={name}>
          {label}
          {required && <span style={{ color: '#f87171' }}> *</span>}
        </label>
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={classNames('form-input', error && 'error')}
          required={required}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <div className="form-error">{error}</div>}
      </div>
    );
  }

  // For regular inputs
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={name}>
        {label}
        {required && <span style={{ color: '#f87171' }}> *</span>}
      </label>
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={classNames('form-input', error && 'error')}
        required={required}
      />
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}
