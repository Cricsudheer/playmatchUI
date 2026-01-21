export const AUTH_ENDPOINTS = {
  LOGIN: '/v1/auth/login',
  REGISTER: '/v1/auth/register',
  REFRESH_TOKEN: '/v1/auth/refresh-token',
};

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/,
  NAME_MIN_LENGTH: 2,
};

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const ERROR_MESSAGES = {
  // Validation errors
  EMAIL_REQUIRED: 'Email is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_WEAK: 'Password must contain at least one letter and one number',
  PASSWORD_MISMATCH: 'Passwords do not match',
  NAME_REQUIRED: 'Name is required',
  NAME_TOO_SHORT: 'Name must be at least 2 characters',
  GENDER_REQUIRED: 'Please select your gender',

  // API errors
  API_400: 'Invalid request. Please check your input.',
  API_401: 'Incorrect email or password.',
  API_409: 'Email already registered. Please login.',
  API_500: 'Server error. Please try again later.',
  API_DEFAULT: 'An unexpected error occurred. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'playmatch_access_token',
  REFRESH_TOKEN: 'playmatch_refresh_token',
  USER: 'playmatch_user',
};
