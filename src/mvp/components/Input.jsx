/**
 * Form Input components for MVP
 * Mobile-first form controls
 */

import React from 'react';

/**
 * Text input with label
 */
export function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  autoFocus = false,
}) {
  return (
    <div className="mvp-form-group">
      {label && (
        <label className="mvp-form-label" htmlFor={name}>
          {label}
          {required && <span className="mvp-required">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`mvp-input ${error ? 'mvp-input-error' : ''}`}
      />
      {error && <span className="mvp-form-error">{error}</span>}
    </div>
  );
}

/**
 * Phone input with country code
 */
export function PhoneInput({
  label = 'Phone Number',
  name = 'phone',
  value,
  onChange,
  error,
  required = true,
  disabled = false,
  autoFocus = false,
}) {
  return (
    <div className="mvp-form-group">
      {label && (
        <label className="mvp-form-label" htmlFor={name}>
          {label}
          {required && <span className="mvp-required">*</span>}
        </label>
      )}
      <div className="mvp-phone-input-wrapper">
        <span className="mvp-phone-prefix">+91</span>
        <input
          id={name}
          name={name}
          type="tel"
          value={value}
          onChange={onChange}
          placeholder="10-digit mobile number"
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          maxLength={10}
          pattern="[0-9]{10}"
          className={`mvp-input mvp-phone-input ${error ? 'mvp-input-error' : ''}`}
        />
      </div>
      {error && <span className="mvp-form-error">{error}</span>}
    </div>
  );
}

/**
 * OTP input (6 digits)
 */
export function OtpInput({
  value,
  onChange,
  error,
  disabled = false,
  autoFocus = true,
}) {
  return (
    <div className="mvp-form-group">
      <label className="mvp-form-label">Enter OTP</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Enter 6-digit OTP"
        maxLength={6}
        pattern="[0-9]{6}"
        disabled={disabled}
        autoFocus={autoFocus}
        className={`mvp-input mvp-otp-input ${error ? 'mvp-input-error' : ''}`}
        inputMode="numeric"
        autoComplete="one-time-code"
      />
      {error && <span className="mvp-form-error">{error}</span>}
    </div>
  );
}

/**
 * Select dropdown
 */
export function Select({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  error,
  required = false,
  disabled = false,
}) {
  return (
    <div className="mvp-form-group">
      {label && (
        <label className="mvp-form-label" htmlFor={name}>
          {label}
          {required && <span className="mvp-required">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`mvp-select ${error ? 'mvp-input-error' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="mvp-form-error">{error}</span>}
    </div>
  );
}

/**
 * Number input with min/max
 */
export function NumberInput({
  label,
  name,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  error,
  required = false,
  disabled = false,
  placeholder,
}) {
  return (
    <div className="mvp-form-group">
      {label && (
        <label className="mvp-form-label" htmlFor={name}>
          {label}
          {required && <span className="mvp-required">*</span>}
        </label>
      )}
      <div className="mvp-number-input-wrapper">
        {prefix && <span className="mvp-input-prefix">{prefix}</span>}
        <input
          id={name}
          name={name}
          type="number"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={`mvp-input ${prefix ? 'has-prefix' : ''} ${suffix ? 'has-suffix' : ''} ${error ? 'mvp-input-error' : ''}`}
        />
        {suffix && <span className="mvp-input-suffix">{suffix}</span>}
      </div>
      {error && <span className="mvp-form-error">{error}</span>}
    </div>
  );
}

/**
 * DateTime picker - simple native input
 */
export function DateTimeInput({
  label,
  name,
  value,
  onChange,
  min,
  error,
  required = false,
  disabled = false,
}) {
  return (
    <div className="mvp-form-group">
      {label && (
        <label className="mvp-form-label" htmlFor={name}>
          {label}
          {required && <span className="mvp-required">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type="datetime-local"
        value={value}
        onChange={onChange}
        min={min}
        required={required}
        disabled={disabled}
        className={`mvp-input ${error ? 'mvp-input-error' : ''}`}
      />
      {error && <span className="mvp-form-error">{error}</span>}
    </div>
  );
}

/**
 * Toggle switch
 */
export function Toggle({
  label,
  name,
  checked,
  onChange,
  disabled = false,
}) {
  return (
    <div className="mvp-toggle-group">
      <label className="mvp-toggle-label" htmlFor={name}>
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="mvp-toggle-input"
        />
        <span className="mvp-toggle-switch" />
        <span className="mvp-toggle-text">{label}</span>
      </label>
    </div>
  );
}

/**
 * Text area
 */
export function TextArea({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
  required = false,
  disabled = false,
}) {
  return (
    <div className="mvp-form-group">
      {label && (
        <label className="mvp-form-label" htmlFor={name}>
          {label}
          {required && <span className="mvp-required">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        className={`mvp-input mvp-textarea ${error ? 'mvp-input-error' : ''}`}
      />
      {error && <span className="mvp-form-error">{error}</span>}
    </div>
  );
}

/**
 * Radio group
 */
export function RadioGroup({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
}) {
  return (
    <div className="mvp-form-group">
      {label && (
        <span className="mvp-form-label">
          {label}
          {required && <span className="mvp-required">*</span>}
        </span>
      )}
      <div className="mvp-radio-group">
        {options.map(opt => (
          <label key={opt.value} className="mvp-radio-label">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
              className="mvp-radio-input"
            />
            <span className="mvp-radio-custom" />
            <span className="mvp-radio-text">{opt.label}</span>
          </label>
        ))}
      </div>
      {error && <span className="mvp-form-error">{error}</span>}
    </div>
  );
}
