import React from 'react';
import { Shield } from 'lucide-react';

export default function Footer({ showFullFooter = false, scrollToSection }) {
  if (!showFullFooter) {
    // Simple footer for Login/Signup pages
    return (
      <footer className="bg-black text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-xs">
              © 2024 Smart Prison Management System. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Support</a>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Full footer for Home page with contact info
  return (
    <footer className="bg-black text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="h-6 w-6 text-gray-400" />
              <span className="text-lg font-bold">Smart Prison</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Modern correctional facility management system ensuring security, efficiency, and rehabilitation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection && scrollToSection('about')}
                  className="text-gray-400 hover:text-white transition-colors text-sm text-left"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection && scrollToSection('features')}
                  className="text-gray-400 hover:text-white transition-colors text-sm text-left"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection && scrollToSection('gallery')}
                  className="text-gray-400 hover:text-white transition-colors text-sm text-left"
                >
                  Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection && scrollToSection('contact')}
                  className="text-gray-400 hover:text-white transition-colors text-sm text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Services</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-400 text-sm">Inmate Management</span></li>
              <li><span className="text-gray-400 text-sm">Security Monitoring</span></li>
              <li><span className="text-gray-400 text-sm">Visitor Management</span></li>
              <li><span className="text-gray-400 text-sm">Staff Coordination</span></li>
            </ul>
          </div>

          {/* Contact Info - Only on Home page */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="text-gray-400 text-sm">+91 471 XXX XXXX</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="text-gray-400 text-sm">info@smartprison.gov.in</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-400 text-sm">Kerala, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-6 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-xs">
              © 2024 Smart Prison Management System. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-xs">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
