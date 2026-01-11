import { FormInput } from './FormInput';
import { FormButton } from './FormButton';
import {
  PRIMARY_ROLE_OPTIONS,
  JERSEY_SIZE_OPTIONS,
  PROFILE_GENDER_OPTIONS,
  VALIDATION_RULES,
  ERROR_MESSAGES,
} from '../constants/profileConfig';

/**
 * Validation functions for player profile fields
 */
export function validateFullName(value) {
  if (!value || !value.trim()) {
    return ERROR_MESSAGES.FULLNAME_REQUIRED;
  }
  if (value.trim().length < VALIDATION_RULES.FULLNAME_MIN_LENGTH) {
    return ERROR_MESSAGES.FULLNAME_TOO_SHORT;
  }
  return '';
}

export function validateProfileGender(value) {
  if (!value || !value.trim()) {
    return ERROR_MESSAGES.GENDER_REQUIRED;
  }
  return '';
}

export function validateMobile(value) {
  if (!value || !value.trim()) {
    return ERROR_MESSAGES.MOBILE_REQUIRED;
  }
  if (!VALIDATION_RULES.MOBILE_REGEX.test(value)) {
    return ERROR_MESSAGES.MOBILE_INVALID;
  }
  return '';
}

export function validateCity(value) {
  if (!value || !value.trim()) {
    return ERROR_MESSAGES.CITY_REQUIRED;
  }
  if (value.trim().length < VALIDATION_RULES.CITY_MIN_LENGTH) {
    return ERROR_MESSAGES.CITY_TOO_SHORT;
  }
  return '';
}

export function validatePrimaryRole(value) {
  if (!value || !value.trim()) {
    return ERROR_MESSAGES.PRIMARY_ROLE_REQUIRED;
  }
  return '';
}

export function validateJerseySize(value) {
  if (!value || !value.trim()) {
    return ERROR_MESSAGES.JERSEY_SIZE_REQUIRED;
  }
  return '';
}

export function validateUpiId(value) {
  // UPI is optional
  if (!value || !value.trim()) {
    return '';
  }
  if (!VALIDATION_RULES.UPI_REGEX.test(value)) {
    return ERROR_MESSAGES.UPI_INVALID;
  }
  return '';
}

export function validateCodeOfConduct(value) {
  if (!value) {
    return ERROR_MESSAGES.CODE_OF_CONDUCT_REQUIRED;
  }
  return '';
}

/**
 * Player Profile Form Component
 * Reusable form for creating and editing player profiles
 */
export function PlayerProfileForm({
  formData,
  errors,
  onChange,
  onBlur,
  onSubmit,
  isSubmitting,
  submitButtonText = 'Save Profile',
  showCodeOfConduct = false,
  hidePreFilledFields = false,
}) {
  return (
    <form onSubmit={onSubmit}>
      {/* Only show these fields if not hiding pre-filled fields */}
      {!hidePreFilledFields && (
        <>
          <FormInput
            label="Full Name"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.fullName}
            placeholder="Enter your full name"
            required
            disabled={isSubmitting}
          />

          <FormInput
            label="Gender"
            type="select"
            name="gender"
            value={formData.gender}
            onChange={onChange}
            onBlur={onBlur}
            error={errors.gender}
            options={PROFILE_GENDER_OPTIONS}
            required
            disabled={isSubmitting}
          />
        </>
      )}

      <FormInput
        label="Mobile Number"
        type="tel"
        name="mobile"
        value={formData.mobile}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.mobile}
        placeholder="Enter 10-digit mobile number"
        required
        disabled={isSubmitting}
      />

      <FormInput
        label="City"
        type="text"
        name="city"
        value={formData.city}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.city}
        placeholder="Enter your city"
        required
        disabled={isSubmitting}
      />

      <FormInput
        label="Primary Role"
        type="select"
        name="primaryRole"
        value={formData.primaryRole}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.primaryRole}
        options={PRIMARY_ROLE_OPTIONS}
        required
        disabled={isSubmitting}
      />

      <FormInput
        label="Jersey Size"
        type="select"
        name="jerseySize"
        value={formData.jerseySize}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.jerseySize}
        options={JERSEY_SIZE_OPTIONS}
        required
        disabled={isSubmitting}
      />

      <FormInput
        label="UPI ID (Optional)"
        type="text"
        name="upiId"
        value={formData.upiId}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.upiId}
        placeholder="username@bank"
        disabled={isSubmitting}
      />

      {showCodeOfConduct && (
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="codeOfConductAccepted"
              checked={formData.codeOfConductAccepted}
              onChange={onChange}
              disabled={isSubmitting}
              className="checkbox-input"
            />
            <span>I accept the code of conduct</span>
          </label>
          {errors.codeOfConductAccepted && (
            <div className="form-error">{errors.codeOfConductAccepted}</div>
          )}
        </div>
      )}

      <FormButton loading={isSubmitting} disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : submitButtonText}
      </FormButton>
    </form>
  );
}
