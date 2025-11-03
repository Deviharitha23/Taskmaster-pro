import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const styles = {
    // Main container
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
    
    // Background elements
    backgroundOrb1: {
      position: 'absolute',
      top: '10%',
      left: '10%',
      width: '300px',
      height: '300px',
      background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)',
      borderRadius: '50%',
      animation: 'float 6s ease-in-out infinite'
    },
    backgroundOrb2: {
      position: 'absolute',
      bottom: '10%',
      right: '10%',
      width: '200px',
      height: '200px',
      background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
      borderRadius: '50%',
      animation: 'float 8s ease-in-out infinite 1s'
    },
    
    // Login card
    loginCard: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      padding: '50px 40px',
      borderRadius: '24px',
      boxShadow: `
        0 25px 50px -12px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(255, 255, 255, 0.1)
      `,
      width: '100%',
      maxWidth: '440px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      position: 'relative',
      zIndex: 10,
    },
    
    // Header
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
    },
    
    // Form elements
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
    
    // Error message
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
    
    // Buttons
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
    
    // Loading spinner
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
    
    // Footer links
    footer: {
      textAlign: 'center',
      marginTop: '30px',
      color: '#718096',
      fontSize: '14px',
    },
    registerLink: {
      color: '#667eea',
      textDecoration: 'none',
      fontWeight: '600',
      transition: 'all 0.3s ease',
    },
    registerLinkHover: {
      color: '#764ba2',
      textDecoration: 'underline',
    },
    
    // Demo credentials
    demoCredentials: {
      background: 'rgba(102, 126, 234, 0.1)',
      border: '1px solid rgba(102, 126, 234, 0.2)',
      borderRadius: '12px',
      padding: '16px',
      marginTop: '20px',
      textAlign: 'center',
    },
    demoTitle: {
      color: '#667eea',
      fontWeight: '600',
      marginBottom: '8px',
      fontSize: '14px',
    },
    demoText: {
      color: '#718096',
      fontSize: '12px',
      lineHeight: '1.4',
    },
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Demo credentials for testing - INSTANT LOGIN
      if (email === 'demo@taskmaster.com' && password === 'password') {
        const mockToken = 'demo-jwt-token-' + Date.now();
        const mockUser = {
          _id: '1',
          name: 'Demo User',
          email: 'demo@taskmaster.com',
          emailNotifications: true,
          taskReminders: true,
          weeklyDigest: true,
          productivityReports: true
        };
        
        // Immediate login without timeout
        if (onLogin) {
          onLogin(mockToken, mockUser);
        }
        return;
      }

      // For real users, try to connect to backend with better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`,  {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email: email, 
            password: password 
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          console.log('Login successful:', result.user);
          localStorage.setItem('token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          
          if (onLogin) {
            onLogin(result.token, result.user);
          }
        } else {
          throw new Error(result.message || 'Login failed. Please check your credentials.');
        }
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Server is not responding. Please check if the backend server is running on port 5000.');
        } else if (fetchError.name === 'TypeError') {
          throw new Error('Cannot connect to server. Make sure the backend is running on http://localhost:5000');
        }
        throw fetchError;
      }
    } catch (error) {
      setError(error.message);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fixed interactive effects with proper error handling
  const handleMouseEnter = (e) => {
    if (loading) return;
    const btn = e.target;
    if (styles.btnPrimaryHover && styles.btnPrimaryHover.transform) {
      btn.style.transform = styles.btnPrimaryHover.transform;
      btn.style.boxShadow = styles.btnPrimaryHover.boxShadow;
    } else {
      // Fallback values
      btn.style.transform = 'translateY(-3px)';
      btn.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)';
    }
  };

  const handleMouseLeave = (e) => {
    if (loading) return;
    const btn = e.target;
    if (styles.btnPrimary && styles.btnPrimary.boxShadow) {
      btn.style.transform = 'none';
      btn.style.boxShadow = styles.btnPrimary.boxShadow;
    } else {
      // Fallback values
      btn.style.transform = 'none';
      btn.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
    }
  };

  const handleFocus = (e) => {
    const input = e.target;
    if (styles.inputFocus) {
      input.style.outline = styles.inputFocus.outline || 'none';
      input.style.borderColor = styles.inputFocus.borderColor || '#667eea';
      input.style.boxShadow = styles.inputFocus.boxShadow || '0 0 0 4px rgba(102, 126, 234, 0.1)';
      input.style.background = styles.inputFocus.background || 'rgba(255, 255, 255, 0.95)';
      input.style.transform = styles.inputFocus.transform || 'translateY(-1px)';
    }
  };

  const handleBlur = (e) => {
    const input = e.target;
    if (styles.input) {
      input.style.outline = 'none';
      input.style.borderColor = '#e2e8f0';
      input.style.boxShadow = 'none';
      input.style.background = styles.input.background || 'rgba(255, 255, 255, 0.8)';
      input.style.transform = 'none';
    }
  };

  const handleRegisterHover = (e) => {
    const link = e.target;
    if (styles.registerLinkHover) {
      link.style.color = styles.registerLinkHover.color || '#764ba2';
      link.style.textDecoration = styles.registerLinkHover.textDecoration || 'underline';
    }
  };

  const handleRegisterLeave = (e) => {
    const link = e.target;
    if (styles.registerLink) {
      link.style.color = styles.registerLink.color || '#667eea';
      link.style.textDecoration = 'none';
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Elements */}
      <div style={styles.backgroundOrb1}></div>
      <div style={styles.backgroundOrb2}></div>
      
      <div style={styles.loginCard}>
        <div style={styles.header}>
          <h1 style={styles.logo}>TaskMaster Pro</h1>
          <p style={styles.subtitle}>Welcome back! Please sign in to your account</p>
        </div>
        
        {error && (
          <div style={styles.errorMessage}>
            <span style={styles.errorIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
              style={styles.input}
              onFocus={handleFocus}
              onBlur={handleBlur}
              required
            />
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
                Signing In...
              </>
            ) : (
              '🔐 Sign In'
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div style={styles.demoCredentials}>
          <div style={styles.demoTitle}>Demo Credentials (Instant Login)</div>
          <div style={styles.demoText}>
            Email: demo@taskmaster.com<br />
            Password: password
          </div>
        </div>

        <div style={styles.footer}>
          <p>
            Don't have an account?{' '}
            <a 
              href="/register" 
              style={styles.registerLink}
              onMouseEnter={handleRegisterHover}
              onMouseLeave={handleRegisterLeave}
            >
              Create account
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

export default Login;