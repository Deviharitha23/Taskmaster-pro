import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Styles object - moved to the top and properly structured
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    },
    backgroundOrb1: {
      position: 'absolute',
      top: '15%',
      left: '8%',
      width: '300px',
      height: '300px',
      background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)',
      borderRadius: '50%',
      animation: 'float 6s ease-in-out infinite'
    },
    backgroundOrb2: {
      position: 'absolute',
      bottom: '15%',
      right: '8%',
      width: '250px',
      height: '250px',
      background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
      borderRadius: '50%',
      animation: 'float 8s ease-in-out infinite 1s'
    },
    backgroundOrb3: {
      position: 'absolute',
      top: '60%',
      left: '70%',
      width: '180px',
      height: '180px',
      background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
      borderRadius: '50%',
      animation: 'float 10s ease-in-out infinite 0.5s'
    },
    registerCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      padding: '50px 40px',
      borderRadius: '24px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      width: '100%',
      maxWidth: '480px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      position: 'relative',
      zIndex: 10,
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px',
    },
    logo: {
      fontSize: '32px',
      fontWeight: '800',
      marginBottom: '8px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    subtitle: {
      color: '#718096',
      fontSize: '16px',
      fontWeight: '500',
      lineHeight: '1.5',
    },
    formGroup: {
      marginBottom: '24px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#2d3748',
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    input: {
      width: '100%',
      padding: '16px 20px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '16px',
      fontFamily: 'inherit',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      background: 'rgba(255, 255, 255, 0.8)',
      color: '#1a202c',
    },
    inputFocus: {
      outline: 'none',
      borderColor: '#667eea',
      boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)',
      background: 'rgba(255, 255, 255, 0.95)',
      transform: 'translateY(-1px)',
    },
    errorMessage: {
      backgroundColor: 'rgba(254, 215, 215, 0.9)',
      color: '#742a2a',
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '24px',
      borderLeft: '4px solid #e53e3e',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    errorIcon: {
      fontSize: '18px',
    },
    successMessage: {
      backgroundColor: 'rgba(198, 246, 213, 0.9)',
      color: '#1f5e2f',
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '24px',
      borderLeft: '4px solid #38a169',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    successIcon: {
      fontSize: '18px',
    },
    btnPrimary: {
      width: '100%',
      padding: '18px 24px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '14px',
      fontSize: '16px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
      letterSpacing: '0.5px',
      textTransform: 'uppercase',
      position: 'relative',
      overflow: 'hidden',
    },
    btnPrimaryHover: {
      transform: 'translateY(-3px)',
      boxShadow: '0 15px 35px rgba(102, 126, 234, 0.4)',
    },
    btnDisabled: {
      background: '#cbd5e0',
      transform: 'none',
      boxShadow: 'none',
      cursor: 'not-allowed',
      opacity: '0.6',
    },
    loadingSpinner: {
      display: 'inline-block',
      width: '20px',
      height: '20px',
      border: '2px solid transparent',
      borderTop: '2px solid currentColor',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginRight: '8px',
    },
    footer: {
      textAlign: 'center',
      marginTop: '30px',
      color: '#718096',
      fontSize: '14px',
    },
    loginLink: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '600',
      transition: 'all 0.3s ease',
    },
    loginLinkHover: {
      color: '#764ba2',
      textDecoration: 'underline',
    },
    passwordStrength: {
      marginTop: '8px',
      height: '4px',
      borderRadius: '2px',
      background: '#e2e8f0',
      overflow: 'hidden',
    },
    strengthBar: {
      height: '100%',
      transition: 'all 0.3s ease',
      borderRadius: '2px',
    },
    strengthWeak: {
      background: '#e53e3e',
      width: '33%',
    },
    strengthMedium: {
      background: '#dd6b20',
      width: '66%',
    },
    strengthStrong: {
      background: '#38a169',
      width: '100%',
    },
    formRow: {
      display: 'flex',
      gap: '16px',
    },
    formRowGroup: {
      flex: 1,
    },
    terms: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '24px',
      padding: '16px',
      background: 'rgba(102, 126, 234, 0.05)',
      borderRadius: '12px',
      border: '1px solid rgba(102, 126, 234, 0.1)',
    },
    termsCheckbox: {
      marginTop: '2px',
      transform: 'scale(1.2)',
      accentColor: '#667eea',
    },
    termsText: {
      fontSize: '14px',
      color: '#718096',
      lineHeight: '1.5',
    },
    termsLink: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '500',
    },
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      console.log('Sending registration request...');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const result = await response.json();
      console.log('Registration response:', result);
      
      if (response.ok && result.success) {
        // Registration successful
        console.log('Registration successful:', result.user);
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Call the onLogin prop if it exists
        if (onLogin) {
          onLogin(result.token, result.user);
        }
        
        // Show success message and redirect
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Network error. Please check if server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Interactive effects
  const handleMouseEnter = (e) => {
    if (loading) return;
    const btn = e.target;
    Object.assign(btn.style, {
      transform: 'translateY(-3px)',
      boxShadow: '0 15px 35px rgba(102, 126, 234, 0.4)'
    });
  };

  const handleMouseLeave = (e) => {
    if (loading) return;
    const btn = e.target;
    Object.assign(btn.style, {
      transform: 'none',
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
    });
  };

  const handleFocus = (e) => {
    Object.assign(e.target.style, {
      outline: 'none',
      borderColor: '#667eea',
      boxShadow: '0 0 0 4px rgba(102, 126, 234, 0.1)',
      background: 'rgba(255, 255, 255, 0.95)',
      transform: 'translateY(-1px)'
    });
  };

  const handleBlur = (e) => {
    Object.assign(e.target.style, {
      outline: 'none',
      borderColor: '#e2e8f0',
      boxShadow: 'none',
      background: 'rgba(255, 255, 255, 0.8)',
      transform: 'none'
    });
  };

  const handleLoginHover = (e) => {
    Object.assign(e.target.style, {
      color: '#764ba2',
      textDecoration: 'underline'
    });
  };

  const handleLoginLeave = (e) => {
    Object.assign(e.target.style, {
      color: '#667eea',
      textDecoration: 'none'
    });
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', width: '0%' };
    
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
    if (password.match(/\d/)) strength += 1;
    if (password.match(/[^a-zA-Z\d]/)) strength += 1;
    
    const strengthMap = {
      0: { label: 'Very Weak', width: '20%', color: '#e53e3e' },
      1: { label: 'Weak', width: '40%', color: '#e53e3e' },
      2: { label: 'Fair', width: '60%', color: '#dd6b20' },
      3: { label: 'Good', width: '80%', color: '#3182ce' },
      4: { label: 'Strong', width: '100%', color: '#38a169' }
    };
    
    return strengthMap[strength] || strengthMap[0];
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div style={styles.container}>
      {/* Background Elements */}
      <div style={styles.backgroundOrb1}></div>
      <div style={styles.backgroundOrb2}></div>
      <div style={styles.backgroundOrb3}></div>
      
      <div style={styles.registerCard}>
        <div style={styles.header}>
          <h1 style={styles.logo}>Join TaskMaster Pro</h1>
          <p style={styles.subtitle}>
            Create your account and start managing tasks like a pro
          </p>
        </div>
        
        {error && (
          <div style={styles.errorMessage}>
            <span style={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="name" style={styles.label}>
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={loading}
              style={styles.input}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              disabled={loading}
              style={styles.input}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              disabled={loading}
              style={styles.input}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
            />
            {formData.password && (
              <div style={styles.passwordStrength}>
                <div 
                  style={{
                    ...styles.strengthBar,
                    width: passwordStrength.width,
                    background: passwordStrength.color
                  }}
                ></div>
              </div>
            )}
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={loading}
              style={styles.input}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
            />
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <div style={{ color: '#38a169', fontSize: '14px', marginTop: '8px' }}>
                ✅ Passwords match
              </div>
            )}
          </div>

          <div style={styles.terms}>
            <input
              type="checkbox"
              id="terms"
              style={styles.termsCheckbox}
              required
            />
            <label htmlFor="terms" style={styles.termsText}>
              I agree to the <a href="#" style={styles.termsLink}>Terms of Service</a> and{' '}
              <a href="#" style={styles.termsLink}>Privacy Policy</a>
            </label>
          </div>

          <button 
            type="submit" 
            style={{
              ...styles.btnPrimary,
              ...(loading ? styles.btnDisabled : {})
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={styles.loadingSpinner}></span>
                Creating Account...
              </>
            ) : (
              '🚀 Create Account'
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p>
            Already have an account?{' '}
            <a 
              href="/login" 
              style={styles.loginLink}
              onMouseEnter={handleLoginHover}
              onMouseLeave={handleLoginLeave}
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>

      {/* Add CSS animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
          *:focus {
            outline: none;
          }
        `}
      </style>
    </div>
  );
};

export default Register;