import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Users, Eye, ChevronDown, Zap, Database, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import emblem from '../assets/kerala-emblem.png';
import Footer from '../components/Footer';
import prisonBg from '../assets/prison.jpg';
import p1 from '../assets/p1.jpg';
import p2 from '../assets/p2.jpg';
import p3 from '../assets/p3.jpg';
import p4 from '../assets/p4.jpg';
import p5 from '../assets/p5.jpg';
import p6 from '../assets/p6.jpg';
import p7 from '../assets/p7.jpeg';
import p8 from '../assets/p8.jpeg';
import p9 from '../assets/p9.jpeg';
import p10 from '../assets/p10.jpeg';

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, clearAllAuthData } = useAuth(); // Use AuthContext instead of local state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const aboutRef = useRef(null);
  const featuresRef = useRef(null);
  const galleryRef = useRef(null);
  const contactRef = useRef(null);

  // Array of background images for rotation
  const backgroundImages = [prisonBg, p1, p2, p3, p4, p5];

  const scrollToRef = (ref) => {
    if (ref.current) {
      const headerHeight = 80; // Account for fixed header
      const elementPosition = ref.current.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionName) => {
    const refs = {
      'about': aboutRef,
      'features': featuresRef,
      'gallery': galleryRef,
      'contact': contactRef
    };

    const ref = refs[sectionName];
    if (ref) {
      scrollToRef(ref);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('animate-slide-up');
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Preload images for faster loading
  useEffect(() => {
    backgroundImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Background image rotation effect
  useEffect(() => {
    const bgInterval = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 8000); // Change background every 8 seconds

    return () => clearInterval(bgInterval);
  }, [backgroundImages.length]);

  const features = [
    {
      icon: '🏢',
      title: 'Segregated Housing',
      description: 'Different categories of inmates with specialized housing units'
    },
    {
      icon: '👁️',
      title: '24/7 Surveillance',
      description: 'Round-the-clock monitoring and security patrolling'
    },
    {
      icon: '🔒',
      title: 'Secure Protocols',
      description: 'Strict check-in and movement control systems'
    },
    {
      icon: '📚',
      title: 'Educational Programs',
      description: 'Access to library, workshops, and skill development'
    },
    {
      icon: '🤖',
      title: 'AI Technology',
      description: 'Face recognition and behavior analysis systems'
    },
    {
      icon: '🏥',
      title: 'Medical Facilities',
      description: 'Comprehensive healthcare including isolation wards'
    },
    {
      icon: '👨‍⚖️',
      title: 'Legal Support',
      description: 'Monitored visitation and legal communication channels'
    },
    {
      icon: '🔄',
      title: 'Rehabilitation',
      description: 'Counseling and reintegration programs'
    }
  ];

  const galleryImages = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10];

  return (
    <div className="min-h-screen bg-gray-900">
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
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
              >
                Home
              </button>
              <button
                onClick={() => scrollToRef(aboutRef)}
                className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
              >
                About
              </button>
              <button
                onClick={() => scrollToRef(featuresRef)}
                className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
              >
                Features
              </button>
              <button
                onClick={() => scrollToRef(galleryRef)}
                className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
              >
                Gallery
              </button>
              <button
                onClick={() => scrollToRef(contactRef)}
                className="text-gray-700 hover:text-black transition-colors duration-200 font-medium"
              >
                Contact
              </button>
              {isAuthenticated ? (
                <div className="flex space-x-2">
                  <button
                    onClick={async () => {
                      await logout();
                      navigate('/');
                    }}
                    className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium border border-gray-300"
                  >
                    Logout
                  </button>
                  {/* Test button - remove in production */}
                  <button
                    onClick={() => {
                      sessionStorage.clear();
                      localStorage.clear();
                      window.location.reload();
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium text-sm"
                    title="Test: Clear All Data"
                  >
                    🧪 Test Clear
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium border border-gray-300"
                >
                  Login
                </button>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
                onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsMenuOpen(false); }}
                className="text-left text-gray-700 hover:text-black transition-colors duration-200 font-medium py-2"
              >
                Home
              </button>
              <button
                onClick={() => scrollToRef(aboutRef)}
                className="text-left text-gray-700 hover:text-black transition-colors duration-200 font-medium py-2"
              >
                About
              </button>
              <button
                onClick={() => scrollToRef(featuresRef)}
                className="text-left text-gray-700 hover:text-black transition-colors duration-200 font-medium py-2"
              >
                Features
              </button>
              <button
                onClick={() => scrollToRef(galleryRef)}
                className="text-left text-gray-700 hover:text-black transition-colors duration-200 font-medium py-2"
              >
                Gallery
              </button>
              <button
                onClick={() => scrollToRef(contactRef)}
                className="text-left text-gray-700 hover:text-black transition-colors duration-200 font-medium py-2"
              >
                Contact
              </button>
              {isAuthenticated ? (
                <button
                  onClick={async () => {
                    await logout();
                    setIsMenuOpen(false);
                    navigate('/');
                  }}
                  className="text-left bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium w-fit border border-gray-300"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                  className="text-left bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium w-fit border border-gray-300"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Hero Section */}
      <section className="pt-16 min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Image with rotation */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-2000 ease-in-out bg-gray-800"
          style={{ backgroundImage: `url(${backgroundImages[currentBgIndex]})` }}
        ></div>

        {/* Secondary background images for depth */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute top-0 left-0 w-1/3 h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${p1})` }}
          ></div>
          <div
            className="absolute top-0 right-0 w-1/3 h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${p2})` }}
          ></div>
        </div>

        {/* Light overlay for text readability */}
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Subtle gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/10 via-black/5 to-gray-800/15"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5"></div>

        {/* Prison-themed architectural overlay */}
        <div className="absolute inset-0 opacity-15">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="prison-bars" width="8" height="100" patternUnits="userSpaceOnUse">
                <rect x="3" y="0" width="2" height="100" fill="currentColor" opacity="0.3"/>
              </pattern>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.3"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            <rect width="100" height="100" fill="url(#prison-bars)" className="animate-pulse" />
          </svg>
        </div>

        {/* Additional prison-themed visual elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          {/* Watchtower silhouettes */}
          <div className="absolute top-10 left-10">
            <svg className="w-16 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
            </svg>
          </div>
          <div className="absolute top-10 right-10">
            <svg className="w-16 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
            </svg>
          </div>

          {/* Fence pattern */}
          <div className="absolute bottom-0 left-0 right-0 h-20">
            <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
              <defs>
                <pattern id="fence" width="5" height="20" patternUnits="userSpaceOnUse">
                  <rect x="2" y="0" width="1" height="20" fill="currentColor" opacity="0.2"/>
                  <rect x="0" y="5" width="5" height="0.5" fill="currentColor" opacity="0.2"/>
                  <rect x="0" y="10" width="5" height="0.5" fill="currentColor" opacity="0.2"/>
                  <rect x="0" y="15" width="5" height="0.5" fill="currentColor" opacity="0.2"/>
                </pattern>
              </defs>
              <rect width="100" height="20" fill="url(#fence)" />
            </svg>
          </div>
        </div>

        {/* Background rotation indicator */}
        <div className="absolute top-4 right-4 flex space-x-1 z-10">
          {backgroundImages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                index === currentBgIndex ? 'bg-white opacity-80' : 'bg-gray-400 opacity-30'
              }`}
            />
          ))}
        </div>

        {/* Floating animated icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>
            <Shield className="w-8 h-8 text-gray-400 opacity-30" />
          </div>
          <div className="absolute top-32 right-20 animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}>
            <Lock className="w-6 h-6 text-gray-500 opacity-25" />
          </div>
          <div className="absolute bottom-40 left-20 animate-bounce" style={{animationDelay: '2s', animationDuration: '3.5s'}}>
            <Users className="w-7 h-7 text-gray-400 opacity-20" />
          </div>
          <div className="absolute bottom-20 right-32 animate-bounce" style={{animationDelay: '0.5s', animationDuration: '4.5s'}}>
            <Eye className="w-5 h-5 text-gray-500 opacity-30" />
          </div>
          <div className="absolute top-1/2 left-16 animate-bounce" style={{animationDelay: '1.5s', animationDuration: '3.8s'}}>
            <Database className="w-6 h-6 text-gray-400 opacity-25" />
          </div>
          <div className="absolute top-1/3 right-16 animate-bounce" style={{animationDelay: '2.5s', animationDuration: '4.2s'}}>
            <FileText className="w-7 h-7 text-gray-500 opacity-20" />
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex-1 flex flex-col justify-center">
          <div className="animate-fade-in">
            {/* Enhanced title with icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-full border border-gray-600 animate-pulse">
                <Shield className="w-12 h-12 text-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Smart Prison
              </span>
              <span className="block text-2xl md:text-3xl lg:text-4xl text-gray-300 mt-2">
                Management System
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Secure. Controlled. Efficient. Modern correctional facility management.
            </p>

            {/* Enhanced feature highlights */}
            <div className="flex flex-wrap justify-center gap-6 mb-10">
              <div className="flex items-center space-x-2 bg-gray-800/30 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-600">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300 font-medium">Real-time Monitoring</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800/30 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-600">
                <Lock className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300 font-medium">Advanced Security</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800/30 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-600">
                <Users className="w-5 h-5 text-green-400" />
                <span className="text-gray-300 font-medium">Inmate Management</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => scrollToRef(aboutRef)}
                className="bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-300 flex items-center justify-center space-x-2"
              >
                <span>Learn More</span>
                <ChevronDown className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Lock className="w-5 h-5" />
                <span>Access System</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-gray-400" />
        </div>

      </section>

      {/* About Section */}
      <section ref={aboutRef} className="pt-24 pb-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              About Modern Prison Systems
            </h2>
            <div className="w-24 h-1 bg-gray-400 mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Transforming correctional facilities through innovative technology and rehabilitation-focused approaches
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll">
              <div className="bg-white p-8 rounded-2xl border border-gray-300 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">iAPS - Digital Transformation</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  The Internal Administrative Processing System (iAPS) represents a revolutionary shift from traditional paper-based workflows to a comprehensive digital ecosystem. This web-based framework ensures transparency, accountability, and efficiency in all administrative functions.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-600">Real-time monitoring and automated alerts</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-600">Data-driven decision making</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-600">Secure internal communication</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-on-scroll">
              <div className="bg-white p-8 rounded-2xl border border-gray-300 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Rehabilitation Focus</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Modern prison systems prioritize rehabilitation and reintegration, treating inmates as individuals capable of positive change. Our approach emphasizes human rights, dignity, and comprehensive reform programs.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-600">Educational and vocational training</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-600">Psychological counseling services</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-gray-600">Family connection programs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center animate-on-scroll">
            <div className="bg-white p-8 rounded-2xl border border-gray-300 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed max-w-4xl mx-auto">
                To create a safer society by reducing recidivism through comprehensive rehabilitation programs,
                modern technology integration, and a commitment to human dignity. We strive to equip inmates
                with life skills, moral values, and opportunities for responsible citizenship upon reintegration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="pt-24 pb-20 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Advanced Prison Features
            </h2>
            <div className="w-24 h-1 bg-gray-400 mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Cutting-edge technology and comprehensive programs designed for security, rehabilitation, and efficient management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-on-scroll border border-gray-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl mb-4 text-center">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section ref={galleryRef} className="pt-24 pb-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Facility Gallery
            </h2>
            <div className="w-24 h-1 bg-gray-400 mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Take a look at our modern facilities and infrastructure designed for security and rehabilitation
            </p>
          </div>

          {/* Horizontal Scrolling Gallery */}
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => {
                const container = document.getElementById('gallery-container');
                container.scrollBy({ left: -300, behavior: 'smooth' });
              }}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => {
                const container = document.getElementById('gallery-container');
                container.scrollBy({ left: 300, behavior: 'smooth' });
              }}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Scrollable Container */}
            <div
              id="gallery-container"
              className="flex overflow-x-auto scrollbar-hide space-x-6 px-12 py-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {galleryImages.map((img, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  style={{ width: '300px', height: '200px' }}
                >
                  <img
                    src={img}
                    alt={`Facility ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 text-white">
                      <h4 className="text-lg font-semibold">Facility View {index + 1}</h4>
                      <p className="text-sm opacity-90">Modern infrastructure</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} className="pt-24 pb-20 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Contact Us
            </h2>
            <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get in touch with the Department of Prisons and Correctional Services
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-on-scroll">
              <div className="bg-white p-8 rounded-2xl border border-gray-300 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Department Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Address</h4>
                      <p className="text-gray-600">Poojappura, Thiruvananthapuram - 695012, Kerala</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Phone</h4>
                      <p className="text-gray-600">+91 471 2345678</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Email</h4>
                      <p className="text-gray-600">contact@keralaprison.gov.in</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-on-scroll">
              <div className="bg-white p-8 rounded-2xl border border-gray-300 shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Services Provided</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-gray-100 hover:bg-gray-200 p-3 rounded-lg transition-colors duration-200 text-left border border-gray-300">
                    <h4 className="font-semibold text-gray-900">Visitor Information</h4>
                    <p className="text-sm text-gray-600">Guidelines & Procedures</p>
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 p-3 rounded-lg transition-colors duration-200 text-left border border-gray-300">
                    <h4 className="font-semibold text-gray-900">Legal Services</h4>
                    <p className="text-sm text-gray-600">Legal Aid & Support</p>
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 p-3 rounded-lg transition-colors duration-200 text-left border border-gray-300">
                    <h4 className="font-semibold text-gray-900">Rehabilitation</h4>
                    <p className="text-sm text-gray-600">Programs & Services</p>
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 p-3 rounded-lg transition-colors duration-200 text-left border border-gray-300">
                    <h4 className="font-semibold text-gray-900">Emergency</h4>
                    <p className="text-sm text-gray-600">24/7 Contact</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer showFullFooter={true} scrollToSection={scrollToSection} />
    </div>
  );
}
