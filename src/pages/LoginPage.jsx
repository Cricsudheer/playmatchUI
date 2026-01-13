import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { FormInput } from '../components/FormInput';
import { FormButton } from '../components/FormButton';
import { validateEmail, validatePassword } from '../utils/validationUtils';
import '../styles/auth.css';

export function LoginPage() {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Don't redirect here - let PublicOnlyRoute handle it after teams load
  // This prevents race conditions between login and myTeams fetch

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
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === 'email') {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    } else if (name === 'password') {
      setErrors((prev) => ({ ...prev, password: validatePassword(value, false) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validate all fields
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password, false);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    // If any errors, don't submit
    if (emailError || passwordError) {
      return;
    }

    // Submit login
    setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);

      // Don't navigate here - PublicOnlyRoute will handle redirect
      // after myTeams query completes to prevent race conditions
    } catch (error) {
      setFormError(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        {formError && <div className="auth-error-banner">{formError}</div>}

        <form onSubmit={handleSubmit}>
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
            placeholder="Enter your password"
            required
            disabled={isSubmitting}
          />

          <FormButton loading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </FormButton>
        </form>

        <div className="auth-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
