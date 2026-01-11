import { VALIDATION_RULES, ERROR_MESSAGES } from '../constants/authConfig';

/**
 * Validate email address
 */
export function validateEmail(email) {
  if (!email || email.trim() === '') {
    return ERROR_MESSAGES.EMAIL_REQUIRED;
  }

  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
    return ERROR_MESSAGES.EMAIL_INVALID;
  }

  return '';
}

/**
 * Validate password
 * @param {string} password - Password to validate
 * @param {boolean} isSignup - Whether this is for signup (stricter rules)
 */
export function validatePassword(password, isSignup = false) {
  if (!password || password.trim() === '') {
    return ERROR_MESSAGES.PASSWORD_REQUIRED;
  }

  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return ERROR_MESSAGES.PASSWORD_TOO_SHORT;
  }

  if (isSignup && !VALIDATION_RULES.PASSWORD_REGEX.test(password)) {
    return ERROR_MESSAGES.PASSWORD_WEAK;
  }

  return '';
}

/**
 * Validate name
 */
export function validateName(name) {
  if (!name || name.trim() === '') {
    return ERROR_MESSAGES.NAME_REQUIRED;
  }

  if (name.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH) {
    return ERROR_MESSAGES.NAME_TOO_SHORT;
  }

  return '';
}

/**
 * Validate gender selection
 */
export function validateGender(gender) {
  if (!gender || gender.trim() === '') {
    return ERROR_MESSAGES.GENDER_REQUIRED;
  }

  return '';
}

/**
 * Validate password match
 */
export function validatePasswordMatch(password, reEnterPassword) {
  if (!reEnterPassword || reEnterPassword.trim() === '') {
    return ERROR_MESSAGES.PASSWORD_REQUIRED;
  }

  if (password !== reEnterPassword) {
    return ERROR_MESSAGES.PASSWORD_MISMATCH;
  }

  return '';
}

/**
 * Get API error message based on status code
 */
export function getAPIErrorMessage(status) {
  switch (status) {
    case 400:
      return ERROR_MESSAGES.API_400;
    case 401:
      return ERROR_MESSAGES.API_401;
    case 409:
      return ERROR_MESSAGES.API_409;
    case 500:
      return ERROR_MESSAGES.API_500;
    default:
      return ERROR_MESSAGES.API_DEFAULT;
  }
}
