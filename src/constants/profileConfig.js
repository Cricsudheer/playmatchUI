/**
 * Player Profile Configuration
 */

export const PRIMARY_ROLE_OPTIONS = [
  { value: 'BATTER', label: 'Batter' },
  { value: 'BOWLER', label: 'Bowler' },
  { value: 'ALL_ROUNDER', label: 'All-Rounder' },
  { value: 'WICKET_KEEPER', label: 'Wicket Keeper' },
];

export const JERSEY_SIZE_OPTIONS = [
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
];

export const PROFILE_GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

export const VALIDATION_RULES = {
  MOBILE_REGEX: /^[6-9]\d{9}$/,
  MOBILE_LENGTH: 10,
  FULLNAME_MIN_LENGTH: 2,
  CITY_MIN_LENGTH: 2,
  UPI_REGEX: /^[\w.-]+@[\w]+$/,
};

export const ERROR_MESSAGES = {
  FULLNAME_REQUIRED: 'Full name is required',
  FULLNAME_TOO_SHORT: 'Full name must be at least 2 characters',
  GENDER_REQUIRED: 'Please select your gender',
  MOBILE_REQUIRED: 'Mobile number is required',
  MOBILE_INVALID: 'Please enter a valid 10-digit mobile number',
  CITY_REQUIRED: 'City is required',
  CITY_TOO_SHORT: 'City must be at least 2 characters',
  PRIMARY_ROLE_REQUIRED: 'Please select your primary role',
  JERSEY_SIZE_REQUIRED: 'Please select your jersey size',
  UPI_INVALID: 'Please enter a valid UPI ID (e.g., username@bank)',
  CODE_OF_CONDUCT_REQUIRED: 'You must accept the code of conduct to continue',
};
