import { useState } from 'react';
import { signupUser, loginUser } from '../services/authService';

/**
 * Login Modal Component
 * Handles user authentication with signup and login forms
 */
export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    gender: '',
    email: '',
    password: '',
    reEnterPassword: '',
  });

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!loginData.email || !loginData.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      const response = await loginUser({
        email: loginData.email,
        password: loginData.password,
      });

      // Store tokens and user info
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));

      onLoginSuccess(response.user);
      onClose();
      setLoginData({ email: '', password: '' });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (
        !signupData.name ||
        !signupData.gender ||
        !signupData.email ||
        !signupData.password ||
        !signupData.reEnterPassword
      ) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (signupData.password !== signupData.reEnterPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      // Signup
      await signupUser({
        name: signupData.name,
        gender: signupData.gender,
        email: signupData.email,
        password: signupData.password,
      });

      // Auto login after signup
      const loginResponse = await loginUser({
        email: signupData.email,
        password: signupData.password,
      });

      localStorage.setItem('accessToken', loginResponse.accessToken);
      localStorage.setItem('refreshToken', loginResponse.refreshToken);
      localStorage.setItem('user', JSON.stringify(loginResponse.user));

      onLoginSuccess(loginResponse.user);
      onClose();
      setSignupData({
        name: '',
        gender: '',
        email: '',
        password: '',
        reEnterPassword: '',
      });
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="modal-backdrop" onClick={onClose}></div>

      {/* Modal */}
      <div className="modal-container">
        <div className="modal-shell">
          {/* Close button */}
          <button className="modal-close" onClick={onClose} title="Close">
            ✕
          </button>

          {/* Brand */}
          <div className="modal-brand">
            <h1>PlayMatch</h1>
            <p>Login or create your account</p>
          </div>

          {/* Tabs */}
          <div className="modal-tabs">
            <button
              className={`modal-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setError('');
              }}
            >
              Login
            </button>
            <button
              className={`modal-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setMode('signup');
                setError('');
              }}
            >
              Sign up
            </button>
          </div>

          {/* Error Message */}
          {error && <div className="modal-error">{error}</div>}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit}>
              <div className="modal-field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  disabled={loading}
                />
              </div>

              <div className="modal-field">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  disabled={loading}
                />
              </div>

              <button className="modal-primary" type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <p className="modal-hint">
                New here?{' '}
                <span
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                >
                  Create account
                </span>
              </p>
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit}>
              <div className="modal-field">
                <label>Full name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={signupData.name}
                  onChange={handleSignupChange}
                  disabled={loading}
                />
              </div>

              <div className="modal-field">
                <label>Gender</label>
                <select
                  name="gender"
                  value={signupData.gender}
                  onChange={handleSignupChange}
                  disabled={loading}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="modal-field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  disabled={loading}
                />
              </div>

              <div className="modal-field">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  disabled={loading}
                />
              </div>

              <div className="modal-field">
                <label>Re-enter password</label>
                <input
                  type="password"
                  name="reEnterPassword"
                  placeholder="Repeat password"
                  value={signupData.reEnterPassword}
                  onChange={handleSignupChange}
                  disabled={loading}
                />
              </div>

              <button className="modal-primary" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create account'}
              </button>

              <p className="modal-hint">
                Already registered?{' '}
                <span
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                >
                  Login
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
