import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import emblem from '../assets/kerala-emblem.png';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, refreshUser } = useAuth(); // Get auth context
  const { showSuccess, showError, showWarning } = useNotification();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between login and signup
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });



  const [oldErrors, setOldErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]+$/;
    return nameRegex.test(name) && name.trim().length >= 2;
  };

  const validatePassword = (password) => {
    const hasAlphabet = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= 8 && hasAlphabet && hasNumber && hasSymbol;
  };

  // Real-time email availability check
  const checkEmailAvailability = async (email) => {
    if (!validateEmail(email)) return;

    setIsCheckingEmail(true);
    try {
      const res = await fetch(`http://localhost:5000/api/auth/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (data.exists) {
        setErrors(prev => ({ ...prev, email: 'Email already exists' }));
      } else {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    } catch (error) {
      console.error('Email check error:', error);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));

    // Real-time validation
    let error = '';

    if (name === 'name' && isSignUp) {
      if (!value.trim()) {
        error = 'Full name is required';
      } else if (!validateName(value)) {
        error = 'Full name should contain only letters and spaces';
      }
    } else if (name === 'email') {
      if (!value.trim()) {
        error = 'Email is required';
      } else if (!validateEmail(value)) {
        error = 'Please enter a valid email address';
      } else if (isSignUp) {
        // Check email availability for signup
        checkEmailAvailability(value);
      }
    } else if (name === 'password') {
      if (!value) {
        error = 'Password is required';
      } else if (isSignUp && !validatePassword(value)) {
        error = 'Password must be 8+ characters with letters, numbers, and symbols';
      }
    } else if (name === 'confirmPassword' && isSignUp) {
      if (!value) {
        error = 'Please confirm your password';
      } else if (value !== formData.password) {
        error = 'Passwords do not match';
      }
    }

    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Clear all errors
    setErrors({ name: '', email: '', password: '', confirmPassword: '' });

    // Validation
    let hasErrors = false;
    const newErrors = { name: '', email: '', password: '', confirmPassword: '' };

    if (isSignUp) {
      // Signup validation
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required';
        hasErrors = true;
      } else if (!validateName(formData.name)) {
        newErrors.name = 'Full name should contain only letters and spaces';
        hasErrors = true;
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
        hasErrors = true;
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        hasErrors = true;
      }

      if (!validatePassword(formData.password)) {
        newErrors.password = 'Password must be 8+ characters with letters, numbers, and symbols';
        hasErrors = true;
      }
    }

    // Common validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      hasErrors = true;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      hasErrors = true;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const endpoint = isSignUp ? '/register' : '/login';
      const requestBody = isSignUp
        ? {
            name: formData.name,
            email: formData.email,
            password: formData.password
          }
        : { email: formData.email, password: formData.password };

      console.log('Attempting login with:', { email: formData.email, endpoint });
      console.log('Request URL:', `http://localhost:5000/api/auth${endpoint}`);

      const res = await fetch(`http://localhost:5000/api/auth${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);

      const data = await res.json();
      console.log('Response data:', data);

      if (!res.ok) {
        console.log('Login failed with data:', data);
        setErrors(prev => ({ ...prev, email: data.msg || `${isSignUp ? 'Registration' : 'Login'} failed` }));
        setIsLoading(false);
        return;
      }

      if (isSignUp) {
        // For signup: show success message and redirect to login
        showSuccess('Account created successfully! Please sign in with your credentials.', 'Registration Successful');

        // Switch to login mode
        setIsSignUp(false);

        // Clear form data
        setFormData({
          name: '',
          email: formData.email, // Keep email for convenience
          password: '',
          confirmPassword: ''
        });
        setErrors({ name: '', email: '', password: '', confirmPassword: '' });
        setTouched({ name: false, email: false, password: false, confirmPassword: false });

      } else {
        // For login: use AuthContext login function
        login(data.user, data.token);

        // Show success notification
        showSuccess(`Welcome back, ${data.user.name}!`, 'Login Successful');

        // Navigate to appropriate dashboard based on user role
        let dashboardPath;
        if (data.user.role === 'admin') {
          dashboardPath = '/admin';
        } else if (data.user.role === 'warden') {
          dashboardPath = '/warden/dashboard';
        } else if (data.user.role === 'staff') {
          dashboardPath = '/staff/dashboard';
        } else {
          dashboardPath = '/dashboard';
        }
        navigate(dashboardPath, { replace: true });
      }
    } catch (err) {
      console.error('Network error details:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      setErrors(prev => ({ ...prev, email: 'Network error. Please try again.' }));
      console.error(`${isSignUp ? 'Registration' : 'Login'} error:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      // Import the signInWithGoogle function from Supabase
      const { signInWithGoogle } = await import('../lib/supabase');
      
      // Use the proper Supabase Google OAuth
      const result = await signInWithGoogle();
      
      if (result.error) {
        throw new Error(result.error);
      }

      // The OAuth flow will redirect to the dashboard
      // The auth state change will be handled by the AuthContext
      showSuccess('Redirecting to Google...', 'Google Sign-In Initiated');

    } catch (error) {
      console.error('Google sign-in error:', error);
      showError(error.message || 'Failed to sign in with Google', 'Sign-In Error');
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 w-full bg-white/95 backdrop-blur-sm shadow-lg z-[9999] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src={emblem} alt="Kerala Emblem" className="h-10 w-10" />
              <span className="text-xl font-bold text-black">Smart Prison</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
              >
                About
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
              >
                Features
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
              >
                Gallery
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
              >
                Contact
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium border border-gray-300"
              >
                Login
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation - Separate from header to prevent height changes */}
      {isMenuOpen && (
        <div className="fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-[9998] md:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                className="text-left text-gray-700 hover:text-black transition-colors duration-200 font-medium py-2"
              >
                Home
              </button>
              <button
                onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                className="text-left text-gray-700 hover:text-black transition-colors duration-200 font-medium py-2"
              >
                About
              </button>
              <button
                onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                className="text-left text-gray-700 hover:text-black transition-colors duration-200 font-medium py-2"
              >
                Features
              </button>
              <button
                onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                className="text-left text-gray-700 hover:text-black transition-colors duration-200 font-medium py-2"
              >
                Gallery
              </button>
              <button
                onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                className="text-left text-gray-700 hover:text-black transition-colors duration-200 font-medium py-2"
              >
                Contact
              </button>
              <button
                onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                className="text-left bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium w-fit border border-gray-300"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 relative flex items-center justify-center p-4 pt-20 pb-4">
      {/* Enhanced Background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>

        {/* Geometric pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="login-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#login-grid)" />
          </svg>
        </div>

        {/* Abstract gradient shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-gray-400/30 to-gray-500/20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-gray-600/25 to-gray-700/15 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-1/2 w-72 h-72 bg-gradient-to-br from-gray-500/20 to-gray-600/15 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-gray-900/50 to-gray-800/30"></div>
      </div>

      {/* Enhanced floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-32 h-32 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full opacity-15 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full opacity-15 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full opacity-15 animate-pulse delay-500"></div>
        <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full opacity-10 animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 right-1/3 w-28 h-28 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full opacity-10 animate-pulse delay-300"></div>
      </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={emblem} alt="Kerala Emblem" className="h-16 w-16" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field - only for signup */}
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    touched.name && errors.name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-gray-500'
                  }`}
                  placeholder="Enter your full name"
                />
                {touched.name && errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    touched.email && errors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-gray-500'
                  }`}
                  placeholder="Enter your email address"
                />
                {isCheckingEmail && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                  </div>
                )}
              </div>
              {touched.email && errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
              {isCheckingEmail && (
                <p className="mt-1 text-sm text-gray-500">Checking email availability...</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 pr-12 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                    touched.password && errors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-gray-500'
                  }`}
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password field - only for signup */}
            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 pr-12 bg-gray-50 border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
                      touched.confirmPassword && errors.confirmPassword
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-gray-500'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            )}



            {/* Forgot password link - only for login */}
            {!isSignUp && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800 transform hover:scale-105'
              }`}
            >
              {isLoading
                ? (isSignUp ? 'Creating Account...' : 'Signing In...')
                : (isSignUp ? 'Create Account' : 'Sign In')
              }
            </button>
          </form>

          {/* Divider */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-600">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Google Sign In/Up */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Official Google Logo */}
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
          </button>

          {/* Sign up/Sign in link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                      setErrors({ name: '', email: '', password: '', confirmPassword: '' });
                      setTouched({ name: false, email: false, password: false, confirmPassword: false });
                    }}
                    className="text-gray-900 hover:text-gray-700 font-medium"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                      setErrors({ name: '', email: '', password: '', confirmPassword: '' });
                      setTouched({ name: false, email: false, password: false, confirmPassword: false });
                    }}
                    className="text-gray-900 hover:text-gray-700 font-medium"
                  >
                    Sign up
                  </button>
                </>
              )}
            </p>
          </div>

        </div>
      </div>
      </div>

      <Footer />
    </div>
  );
}
