import React, { useState, useEffect } from 'react';
import { AlertCircle, Moon, Sun } from 'lucide-react';
import PasswordStrengthMeter from './PasswordStrengthMeter';

export default function AuthPage({ onLogin, onRegister, darkMode, setDarkMode }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isShaking, setIsShaking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setErrors({});
    setFormData({ name: '', email: '', password: '' });
    setShowConfetti(false);
  }, [isLogin]);

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 chars';

    if (!isLogin && !formData.name) newErrors.name = 'Name is required';

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      return;
    }

    if (isLogin) {
      const result = await onLogin(formData.email, formData.password);
      if (result && result.error) {
        setErrors({ form: result.error });
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
      }
    } else {
      const result = await onRegister(formData.name, formData.email, formData.password);
      if (result && result.error) {
        setErrors({ form: result.error });
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
      } else if (result && result.success) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }
  };

  return (
    <div className="auth-container">
      {showConfetti && <div className="confetti-effect">Account Created!</div>}
      <div className="theme-toggle-container">
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className={`auth-card ${isShaking ? 'shake' : ''}`}>
        <div className="auth-header">
          <h1 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="auth-subtitle">
            {isLogin
              ? 'Enter your credentials to access your domains'
              : 'Sign up to start managing your digital assets'}
          </p>
        </div>

        {errors.form && (
          <div className="error-message" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            <AlertCircle size={14} /> {errors.form}
          </div>
        )}

        <div className="auth-form">
          <button className="social-btn" onClick={() => alert('Google Login not implemented yet')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="divider">or</div>

          {!isLogin && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                type="text"
                className={`auth-input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && (
                <div className="error-message">
                  <AlertCircle size={14} /> {errors.name}
                </div>
              )}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              className={`auth-input ${errors.email ? 'input-error' : ''}`}
              placeholder="name@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && (
              <div className="error-message">
                <AlertCircle size={14} /> {errors.email}
              </div>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              className={`auth-input ${errors.password ? 'input-error' : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            {!isLogin && <PasswordStrengthMeter password={formData.password} />}
            {errors.password && (
              <div className="error-message">
                <AlertCircle size={14} /> {errors.password}
              </div>
            )}
          </div>

          <button className="primary-btn" onClick={handleSubmit}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <div className="toggle-auth">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <span className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Log In'}
          </span>
        </div>
      </div>
    </div>
  );
}
