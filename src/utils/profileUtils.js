/**
 * Convert gender from signup format (lowercase) to profile format (uppercase)
 */
export function mapSignupGenderToProfileGender(signupGender) {
  if (!signupGender) return '';

  const genderMap = {
    'male': 'MALE',
    'female': 'FEMALE',
    'other': 'OTHER',
  };

  return genderMap[signupGender.toLowerCase()] || signupGender.toUpperCase();
}

/**
 * Convert gender from profile format (uppercase) to display format
 */
export function formatGenderForDisplay(profileGender) {
  if (!profileGender) return '';

  const genderMap = {
    'MALE': 'Male',
    'FEMALE': 'Female',
    'OTHER': 'Other',
  };

  return genderMap[profileGender] || profileGender;
}

/**
 * Get only the fields that have changed between original and current data
 * Returns an object with only the modified fields
 */
export function getChangedFields(originalData, currentData) {
  if (!originalData) {
    // If no original data, this is a create operation - return all current data
    return currentData;
  }

  const changedFields = {};

  // Compare each field
  Object.keys(currentData).forEach((key) => {
    const originalValue = originalData[key];
    const currentValue = currentData[key];

    // Handle null/undefined/empty string equivalence
    const normalizedOriginal = originalValue === null || originalValue === undefined ? '' : originalValue;
    const normalizedCurrent = currentValue === null || currentValue === undefined ? '' : currentValue;

    // Only include if values are different
    if (normalizedOriginal !== normalizedCurrent) {
      changedFields[key] = currentValue;
    }
  });

  return changedFields;
}
