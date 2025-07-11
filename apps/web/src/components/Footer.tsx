import React from 'react';
import { Stethoscope, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-text text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-medical-gradient rounded-lg p-2">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Sehatify</span>
            </div>
            <p className="text-gray-300">
              Advanced healthcare solutions powered by AI technology, making quality medical care accessible to everyone.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-300 hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-gray-300 hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-300 hover:text-primary cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-gray-300 hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-primary transition-colors">Home</a></li>
              <li><a href="/hospitals" className="text-gray-300 hover:text-primary transition-colors">Hospitals</a></li>
              <li><a href="/articles" className="text-gray-300 hover:text-primary transition-colors">Health Articles</a></li>
              <li><a href="/about" className="text-gray-300 hover:text-primary transition-colors">About Us</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><a href="/book-appointment" className="text-gray-300 hover:text-primary transition-colors">Book Appointment</a></li>
              <li><a href="/chatbot" className="text-gray-300 hover:text-primary transition-colors">AI Health Assistant</a></li>
              <li><a href="/medical-records" className="text-gray-300 hover:text-primary transition-colors">Medical Records</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-gray-300">+62 21 1234 5678</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-gray-300">info@sehatify.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-gray-300">Jl. Sudirman No. 123, Jakarta</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2024 Sehatify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;