import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCertificateMenu, setShowCertificateMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCertificateMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setShowCertificateMenu(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path) => `
    relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
    ${isActive(path) 
      ? 'text-blue-600 bg-blue-50' 
      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
    }
  `;

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className={`
      fixed top-0 w-full z-50 transition-all duration-300
      ${scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-blue-100' 
        : 'bg-white border-b border-gray-100'
      }
    `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          
          {/* Logo Section */}
          <Link 
            to="/" 
            className="flex items-center group cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all duration-300">
                <span className="text-white font-bold text-xl lg:text-2xl">J</span>
              </div>
            </div>
            <div className="ml-3">
              <span className="block text-lg lg:text-xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                JAS Computer
              </span>
              <span className="hidden lg:block text-xs text-blue-600 font-medium -mt-1">
                Institute & Training Center
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={navLinkClass('/')}>
              <span>Home</span>
            </Link>
            <Link to="/courses" className={navLinkClass('/courses')}>
              <span>Courses</span>
            </Link>
            <Link to="/about" className={navLinkClass('/about')}>
              <span>About</span>
            </Link>
            <Link to="/contact" className={navLinkClass('/contact')}>
              <span>Contact</span>
            </Link>

            {/* Certificate Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowCertificateMenu(!showCertificateMenu)}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                  ${location.pathname.startsWith('/certificate') 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50/50'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Certificate</span>
                <svg className={`w-3 h-3 transition-transform duration-200 ${showCertificateMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showCertificateMenu && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-fade-in-up">
                  <Link 
                    to="/verify-certificate" 
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-600 transition-all duration-200"
                    onClick={() => setShowCertificateMenu(false)}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">Verify Certificate</p>
                      <p className="text-xs text-gray-500">Check certificate authenticity</p>
                    </div>
                  </Link>
                  <Link 
                    to="/certificate-download" 
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-600 transition-all duration-200"
                    onClick={() => setShowCertificateMenu(false)}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">Download Certificate</p>
                      <p className="text-xs text-gray-500">Access your digital certificate</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/dashboard" 
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 transform hover:scale-105"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="group relative p-2 text-gray-500 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Logout
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 transform hover:scale-105"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="relative p-2 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <span className={`absolute left-0 top-0 w-6 h-0.5 bg-current transform transition-all duration-300 ${isOpen ? 'rotate-45 top-2.5' : 'top-1'}`}></span>
                <span className={`absolute left-0 top-2.5 w-6 h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                <span className={`absolute left-0 top-5 w-6 h-0.5 bg-current transform transition-all duration-300 ${isOpen ? '-rotate-45 top-2.5' : 'top-5'}`}></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div 
        className={`md:hidden fixed inset-x-0 top-16 bg-white shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-4 py-6 space-y-2 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <Link 
            to="/" 
            className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-600 rounded-xl transition-all duration-200"
            onClick={() => setIsOpen(false)}
          >
            <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
          <Link 
            to="/courses" 
            className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-600 rounded-xl transition-all duration-200"
            onClick={() => setIsOpen(false)}
          >
            <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Courses
          </Link>
          <Link 
            to="/about" 
            className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-600 rounded-xl transition-all duration-200"
            onClick={() => setIsOpen(false)}
          >
            <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            About
          </Link>
          <Link 
            to="/contact" 
            className="flex items-center px-4 py-3 text-base font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-600 rounded-xl transition-all duration-200"
            onClick={() => setIsOpen(false)}
          >
            <svg className="w-5 h-5 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact
          </Link>
          
          <div className="pt-4">
            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Certificates</p>
            <Link 
              to="/verify-certificate" 
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 rounded-xl transition-all duration-200"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Verify Certificate</p>
                <p className="text-xs text-gray-500">Check certificate authenticity</p>
              </div>
            </Link>
            {/* <Link 
              to="/certificate-download" 
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 rounded-xl transition-all duration-200"
              onClick={() => setIsOpen(false)}
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Download Certificate</p>
                <p className="text-xs text-gray-500">Access your digital certificate</p>
              </div>
            </Link> */}
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center justify-center w-full px-4 py-3 text-red-600 font-medium border border-red-200 rounded-xl hover:bg-red-50 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center justify-center w-full px-4 py-3 text-gray-700 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add animation styles */}
     <style>
  {`
    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in-up {
      animation: fade-in-up 0.2s ease-out;
    }
  `}
</style>
    </nav>
  );
};

export default Navbar;