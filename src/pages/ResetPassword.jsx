import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { XCircle, CheckCircle } from 'lucide-react';
import ValidatedInput from '../components/ValidatedInput';
import emblem from '../assets/kerala-emblem.png';
import Footer from '../components/Footer';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/verify-reset-token/${token}`);
        const data = await res.json();
        
        if (res.ok && data.valid) {
          setTokenValid(true);
          setUserEmail(data.email);
        } else {
          setTokenValid(false);
        }
      } catch (err) {
        setTokenValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setIsVerifying(false);
      setTokenValid(false);
    }
  }, [token]);

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-zA-Z])/.test(password)) return 'Password must contain at least one letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    if (!/(?=.*[@$!%*?&])/.test(password)) return 'Password must contain at least one special character (@$!%*?&)';
    return '';
  };

  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    let error = '';
    if (name === 'password') {
      error = validatePassword(value);
      // Also revalidate confirm password if it exists
      if (formData.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: validateConfirmPassword(formData.confirmPassword, value)
        }));
      }
    } else if (name === 'confirmPassword') {
      error = validateConfirmPassword(value, formData.password);
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate all fields
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);

    setErrors({
      password: passwordError,
      confirmPassword: confirmPasswordError
    });

    if (passwordError || confirmPasswordError) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: formData.password })
      });

      const data = await res.json();
      
      if (res.ok) {
        setResetSuccess(true);
      } else {
        setErrors(prev => ({
          ...prev,
          password: data.msg || 'Failed to reset password'
        }));
      }
    } catch (err) {
      setErrors(prev => ({
        ...prev,
        password: 'Network error. Please try again.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying reset token...</p>
        </div>
      </div>
    );
  }

  // Invalid token
  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <img src={emblem} alt="Kerala Emblem" className="h-10 w-10" />
                <span className="text-xl font-bold text-gray-900">Smart Prison</span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <button
                  onClick={() => navigate('/')}
                  className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                >
                  Home
                </button>
                <button
                  onClick={() => navigate('/about')}
                  className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                >
                  About
                </button>
                <button
                  onClick={() => navigate('/features')}
                  className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                >
                  Features
                </button>
                <button
                  onClick={() => navigate('/gallery')}
                  className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                >
                  Gallery
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                >
                  Contact
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                >
                  Login
                </button>
              </nav>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-700 hover:text-black focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
              <div className="md:hidden bg-white border-t border-gray-200">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  <button
                    onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                    className="block text-left w-full px-3 py-2 text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => { navigate('/about'); setIsMenuOpen(false); }}
                    className="block text-left w-full px-3 py-2 text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                  >
                    About
                  </button>
                  <button
                    onClick={() => { navigate('/features'); setIsMenuOpen(false); }}
                    className="block text-left w-full px-3 py-2 text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                  >
                    Features
                  </button>
                  <button
                    onClick={() => { navigate('/gallery'); setIsMenuOpen(false); }}
                    className="block text-left w-full px-3 py-2 text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                  >
                    Gallery
                  </button>
                  <button
                    onClick={() => { navigate('/contact'); setIsMenuOpen(false); }}
                    className="block text-left w-full px-3 py-2 text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                  >
                    Contact
                  </button>
                  <button
                    onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium w-fit"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content - Centered */}
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full">
            {/* White Box Container - Exact Login Style */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-auto text-center">
              <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Invalid Reset Link</h2>
              <p className="text-gray-600 mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Request New Reset Link
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full text-blue-600 hover:text-blue-500 font-medium py-2"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <footer className="bg-gray-900 text-white py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm">
              <div className="mb-2 md:mb-0">
                © 2024 Smart Prison Management System. All rights reserved.
              </div>
              <div className="flex space-x-6">
                <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-gray-300 transition-colors">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Success state
  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <img src={emblem} alt="Kerala Emblem" className="h-10 w-10" />
                <span className="text-xl font-bold text-gray-900">Smart Prison</span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <button
                  onClick={() => navigate('/')}
                  className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                >
                  Home
                </button>
                <button
                  onClick={() => navigate('/about')}
                  className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                >
                  About
                </button>
                <button
                  onClick={() => navigate('/features')}
                  className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                >
                  Features
                </button>
                <button
                  onClick={() => navigate('/gallery')}
                  className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                >
                  Gallery
                </button>
                <button
                  onClick={() => navigate('/contact')}
                  className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                >
                  Contact
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                >
                  Login
                </button>
              </nav>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-700 hover:text-black focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
              <div className="md:hidden bg-white border-t border-gray-200">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  <button
                    onClick={() => { navigate('/'); setIsMenuOpen(false); }}
                    className="block text-left w-full px-3 py-2 text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                  >
                    Home
                  </button>
                  <button
                    onClick={() => { navigate('/about'); setIsMenuOpen(false); }}
                    className="block text-left w-full px-3 py-2 text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                  >
                    About
                  </button>
                  <button
                    onClick={() => { navigate('/features'); setIsMenuOpen(false); }}
                    className="block text-left w-full px-3 py-2 text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                  >
                    Features
                  </button>
                  <button
                    onClick={() => { navigate('/gallery'); setIsMenuOpen(false); }}
                    className="block text-left w-full px-3 py-2 text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                  >
                    Gallery
                  </button>
                  <button
                    onClick={() => { navigate('/contact'); setIsMenuOpen(false); }}
                    className="block text-left w-full px-3 py-2 text-gray-700 hover:text-black transition-colors duration-200 font-medium"
                  >
                    Contact
                  </button>
                  <button
                    onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                    className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium w-fit"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content - Centered */}
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full">
            {/* White Box Container - Exact Login Style */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-auto text-center">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Password Reset Successful</h2>
              <p className="text-gray-600 mb-6">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <footer className="bg-gray-900 text-white py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm">
              <div className="mb-2 md:mb-0">
                © 2024 Smart Prison Management System. All rights reserved.
              </div>
              <div className="flex space-x-6">
                <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-gray-300 transition-colors">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Reset password form
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
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-black focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="px-2 pt-2 pb-3 space-y-1">
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
          )}
        </div>
      </header>

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
              <pattern id="reset-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#reset-grid)" />
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
          {/* Reset Password Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={emblem} alt="Kerala Emblem" className="h-16 w-16" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          </div>

          {/* Reset Password Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
              <ValidatedInput
                type="password"
                name="password"
                label="New Password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="Enter your new password"
                required
              />

              <ValidatedInput
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="Confirm your new password"
                required
              />

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-lg ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed text-gray-300'
                  : 'bg-black text-white hover:bg-gray-800 transform hover:scale-105'
              }`}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>

          {/* Or continue with */}
          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Google Sign In Button */}
          <div className="mt-6">
            <button
              type="button"
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          {/* Sign up link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}