import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { FormInput } from '../components/FormInput';
import { FormButton } from '../components/FormButton';
import { GENDER_OPTIONS } from '../constants/authConfig';
import {
  validateEmail,
  validatePassword,
  validateName,
  validateGender,
  validatePasswordMatch,
} from '../utils/validationUtils';

export function SignupPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    email: '',
    password: '',
    reEnterPassword: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    gender: '',
    email: '',
    password: '',
    reEnterPassword: '',
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (formError) {
      setFormError('');
    }

    // Real-time password match validation
    if (name === 'reEnterPassword' || name === 'password') {
      const pwd = name === 'password' ? value : formData.password;
      const rePwd = name === 'reEnterPassword' ? value : formData.reEnterPassword;

      if (rePwd && pwd !== rePwd) {
        setErrors((prev) => ({ ...prev, reEnterPassword: validatePasswordMatch(pwd, rePwd) }));
      } else {
        setErrors((prev) => ({ ...prev, reEnterPassword: '' }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case 'name':
        setErrors((prev) => ({ ...prev, name: validateName(value) }));
        break;
      case 'gender':
        setErrors((prev) => ({ ...prev, gender: validateGender(value) }));
        break;
      case 'email':
        setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
        break;
      case 'password':
        setErrors((prev) => ({ ...prev, password: validatePassword(value, true) }));
        break;
      case 'reEnterPassword':
        setErrors((prev) => ({ ...prev, reEnterPassword: validatePasswordMatch(formData.password, value) }));
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate all fields
    const nameError = validateName(formData.name);
    const genderError = validateGender(formData.gender);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password, true);
    const reEnterPasswordError = validatePasswordMatch(formData.password, formData.reEnterPassword);

    setErrors({
      name: nameError,
      gender: genderError,
      email: emailError,
      password: passwordError,
      reEnterPassword: reEnterPasswordError,
    });

    // If any errors, don't submit
    if (nameError || genderError || emailError || passwordError || reEnterPasswordError) {
      return;
    }

    // Submit registration
    setIsSubmitting(true);
    try {
      console.log('[SignupPage] Starting registration...');
      await register({
        name: formData.name,
        gender: formData.gender,
        email: formData.email,
        password: formData.password,
        reEnterPassword: formData.reEnterPassword,
      });

      console.log('[SignupPage] Registration successful, navigating to profile creation');
      // Auto-login happens in the register service, navigate to profile creation
      navigate('/profile', { replace: true, state: { fromSignup: true } });
    } catch (error) {
      console.error('[SignupPage] Registration failed:', error.message);
      setFormError(error.message);
      // Explicitly prevent navigation on error
      return;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Sign up to get started</p>
        </div>

        {formError && <div className="auth-error-banner">{formError}</div>}

        <form onSubmit={handleSubmit}>
          <FormInput
            label="Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.name}
            placeholder="Enter your full name"
            required
            disabled={isSubmitting}
          />

          <FormInput
            label="Gender"
            type="select"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.gender}
            options={GENDER_OPTIONS}
            required
            disabled={isSubmitting}
          />

          <FormInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            placeholder="Enter your email"
            required
            disabled={isSubmitting}
          />

          <FormInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            placeholder="Create a strong password"
            required
            disabled={isSubmitting}
          />

          <FormInput
            label="Confirm Password"
            type="password"
            name="reEnterPassword"
            value={formData.reEnterPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.reEnterPassword}
            placeholder="Re-enter your password"
            required
            disabled={isSubmitting}
          />

          <FormButton loading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </FormButton>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
