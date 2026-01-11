import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { createOrUpdateProfile, getPlayerProfile } from '../services/playerProfileService';
import { mapSignupGenderToProfileGender, getChangedFields } from '../utils/profileUtils';
import {
  PlayerProfileForm,
  validateFullName,
  validateProfileGender,
  validateMobile,
  validateCity,
  validatePrimaryRole,
  validateJerseySize,
  validateUpiId,
  validateCodeOfConduct,
} from '../components/PlayerProfileForm';

export function PlayerProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Check if this is first-time profile creation (from signup)
  const isFirstTimeSetup = location.state?.fromSignup || false;

  // Initialize form with data from signup (user object)
  const getInitialFormData = () => {
    if (user) {
      return {
        fullName: user.name || '',
        gender: mapSignupGenderToProfileGender(user.gender) || '',
        mobile: '',
        city: '',
        primaryRole: '',
        jerseySize: '',
        upiId: '',
        codeOfConductAccepted: false,
      };
    }
    return {
      fullName: '',
      gender: '',
      mobile: '',
      city: '',
      primaryRole: '',
      jerseySize: '',
      upiId: '',
      codeOfConductAccepted: false,
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());

  const [errors, setErrors] = useState({
    fullName: '',
    gender: '',
    mobile: '',
    city: '',
    primaryRole: '',
    jerseySize: '',
    upiId: '',
    codeOfConductAccepted: '',
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalProfileData, setOriginalProfileData] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Load existing profile if available
  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated || !user || !user.id) return;

      try {
        setIsLoading(true);
        const profile = await getPlayerProfile(user.id);

        if (profile) {
          // Profile exists - populate form with existing data
          const profileData = {
            fullName: profile.fullName || '',
            gender: profile.gender || '',
            mobile: profile.mobile || '',
            city: profile.city || '',
            primaryRole: profile.primaryRole || '',
            jerseySize: profile.jerseySize || '',
            upiId: profile.upiId || '',
            codeOfConductAccepted: profile.codeOfConductAccepted || false,
          };
          setFormData(profileData);
          // Store a deep copy of original data for change detection (to prevent reference issues)
          setOriginalProfileData({ ...profileData });
          console.log('[PlayerProfilePage] Loaded existing profile, original data:', profileData);
          // Not in edit mode by default when viewing existing profile
          setIsEditMode(false);
        } else {
          // No profile exists - this is creation mode, keep pre-filled data from signup
          setIsEditMode(true);
          setOriginalProfileData(null);
          console.log('[PlayerProfilePage] No existing profile, first-time setup mode');
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        // If profile doesn't exist, stay in creation mode with pre-filled data
        setIsEditMode(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: fieldValue }));

    // Clear error when user starts typing/selecting
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (formError) {
      setFormError('');
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case 'fullName':
        setErrors((prev) => ({ ...prev, fullName: validateFullName(value) }));
        break;
      case 'gender':
        setErrors((prev) => ({ ...prev, gender: validateProfileGender(value) }));
        break;
      case 'mobile':
        setErrors((prev) => ({ ...prev, mobile: validateMobile(value) }));
        break;
      case 'city':
        setErrors((prev) => ({ ...prev, city: validateCity(value) }));
        break;
      case 'primaryRole':
        setErrors((prev) => ({ ...prev, primaryRole: validatePrimaryRole(value) }));
        break;
      case 'jerseySize':
        setErrors((prev) => ({ ...prev, jerseySize: validateJerseySize(value) }));
        break;
      case 'upiId':
        setErrors((prev) => ({ ...prev, upiId: validateUpiId(value) }));
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate all fields
    const fullNameError = validateFullName(formData.fullName);
    const genderError = validateProfileGender(formData.gender);
    const mobileError = validateMobile(formData.mobile);
    const cityError = validateCity(formData.city);
    const primaryRoleError = validatePrimaryRole(formData.primaryRole);
    const jerseySizeError = validateJerseySize(formData.jerseySize);
    const upiIdError = validateUpiId(formData.upiId);
    const codeOfConductError = isFirstTimeSetup
      ? validateCodeOfConduct(formData.codeOfConductAccepted)
      : '';

    setErrors({
      fullName: fullNameError,
      gender: genderError,
      mobile: mobileError,
      city: cityError,
      primaryRole: primaryRoleError,
      jerseySize: jerseySizeError,
      upiId: upiIdError,
      codeOfConductAccepted: codeOfConductError,
    });

    // If any errors, don't submit
    if (
      fullNameError ||
      genderError ||
      mobileError ||
      cityError ||
      primaryRoleError ||
      jerseySizeError ||
      upiIdError ||
      codeOfConductError
    ) {
      return;
    }

    // Submit profile
    setIsSubmitting(true);
    try {
      console.log('[PlayerProfilePage] Submitting profile...');
      console.log('[PlayerProfilePage] Is first-time setup?', isFirstTimeSetup);
      console.log('[PlayerProfilePage] Original profile data exists?', !!originalProfileData);

      // Prepare the full profile data
      const fullProfileData = {
        fullName: formData.fullName,
        gender: formData.gender,
        mobile: formData.mobile,
        city: formData.city,
        primaryRole: formData.primaryRole,
        jerseySize: formData.jerseySize,
        upiId: formData.upiId || null,
        codeOfConductAccepted: formData.codeOfConductAccepted,
      };

      console.log('[PlayerProfilePage] Full profile data:', fullProfileData);

      let dataToSend;
      let isUpdate = false;

      // For first-time setup OR when originalProfileData is null, send all fields
      if (!originalProfileData) {
        console.log('[PlayerProfilePage] First-time creation - sending all fields');
        dataToSend = fullProfileData;
        isUpdate = false; // This is a creation
      } else {
        // For updates, only send changed fields
        console.log('[PlayerProfilePage] Update mode - detecting changes');
        console.log('[PlayerProfilePage] Original data:', originalProfileData);

        dataToSend = getChangedFields(originalProfileData, fullProfileData);

        console.log('[PlayerProfilePage] Changed fields:', dataToSend);
        console.log('[PlayerProfilePage] Number of changed fields:', Object.keys(dataToSend).length);

        // If no fields have changed during update, skip the API call
        if (Object.keys(dataToSend).length === 0) {
          console.log('[PlayerProfilePage] No changes detected, skipping update');
          setIsEditMode(false);
          return;
        }

        isUpdate = true; // This is an update
      }

      console.log('[PlayerProfilePage] FINAL DATA TO SEND:', JSON.stringify(dataToSend, null, 2));
      console.log('[PlayerProfilePage] Calling API with isUpdate =', isUpdate);
      await createOrUpdateProfile(dataToSend, isUpdate);

      console.log('[PlayerProfilePage] Profile saved successfully');

      // Navigate to dashboard after successful creation/update
      navigate('/', { replace: true });
    } catch (error) {
      console.error('[PlayerProfilePage] Profile save failed:', error.message);
      setFormError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  if (isLoading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="loading-overlay">Loading profile...</div>
        </div>
      </div>
    );
  }

  // View mode - show profile details
  if (!isEditMode && !isFirstTimeSetup) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Player Profile</h1>
            <p>Your profile information</p>
          </div>

          <div className="profile-view">
            <div className="profile-field">
              <label>Full Name</label>
              <p>{formData.fullName}</p>
            </div>
            <div className="profile-field">
              <label>Gender</label>
              <p>{formData.gender}</p>
            </div>
            <div className="profile-field">
              <label>Mobile Number</label>
              <p>{formData.mobile}</p>
            </div>
            <div className="profile-field">
              <label>City</label>
              <p>{formData.city}</p>
            </div>
            <div className="profile-field">
              <label>Primary Role</label>
              <p>{formData.primaryRole}</p>
            </div>
            <div className="profile-field">
              <label>Jersey Size</label>
              <p>{formData.jerseySize}</p>
            </div>
            {formData.upiId && (
              <div className="profile-field">
                <label>UPI ID</label>
                <p>{formData.upiId}</p>
              </div>
            )}
          </div>

          <button className="auth-button" onClick={handleEditToggle}>
            Edit Profile
          </button>
        </div>
      </div>
    );
  }

  // Edit/Create mode - show form
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{isFirstTimeSetup ? 'Complete Your Profile' : 'Edit Profile'}</h1>
          <p>
            {isFirstTimeSetup
              ? 'Please provide your player details to continue'
              : 'Update your player information'}
          </p>
        </div>

        {formError && <div className="auth-error-banner">{formError}</div>}

        {isFirstTimeSetup && user && (
          <div className="profile-info-banner">
            <p>
              <strong>Name:</strong> {formData.fullName}
            </p>
            <p>
              <strong>Gender:</strong> {formData.gender}
            </p>
          </div>
        )}

        <PlayerProfileForm
          formData={formData}
          errors={errors}
          onChange={handleChange}
          onBlur={handleBlur}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitButtonText={isFirstTimeSetup ? 'Complete Profile' : 'Update Profile'}
          showCodeOfConduct={isFirstTimeSetup}
          hidePreFilledFields={isFirstTimeSetup}
        />

        {!isFirstTimeSetup && (
          <div className="auth-link">
            <button type="button" onClick={handleEditToggle} className="text-link">
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
