import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle,
  AlertTriangle,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    department: '',
    message: '',
    priority: 'normal'
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Main Office',
      details: [
        'Sehatify Healthcare Solutions',
        'Jl. Sudirman No. 123, SCBD',
        'Jakarta Selatan 12190',
        'Indonesia'
      ]
    },
    {
      icon: Phone,
      title: 'Phone Numbers',
      details: [
        'General Inquiries: +62 21 1234 5678',
        'Emergency Hotline: +62 21 911 0000',
        'Appointment Booking: +62 21 1234 5679',
        'Technical Support: +62 21 1234 5680'
      ]
    },
    {
      icon: Mail,
      title: 'Email Addresses',
      details: [
        'General: info@sehatify.com',
        'Support: support@sehatify.com',
        'Medical: medical@sehatify.com',
        'Partnership: partners@sehatify.com'
      ]
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: [
        'Monday - Friday: 8:00 AM - 8:00 PM',
        'Saturday: 9:00 AM - 5:00 PM',
        'Sunday: 10:00 AM - 4:00 PM',
        'Emergency: 24/7 Available'
      ]
    }
  ];

  const departments = [
    'General Inquiry',
    'Medical Consultation',
    'Technical Support',
    'Billing & Insurance',
    'Partnership',
    'Feedback & Complaints'
  ];

  const socialLinks = [
    { icon: Facebook, name: 'Facebook', url: 'https://facebook.com/sehatify' },
    { icon: Twitter, name: 'Twitter', url: 'https://twitter.com/sehatify' },
    { icon: Instagram, name: 'Instagram', url: 'https://instagram.com/sehatify' },
    { icon: Linkedin, name: 'LinkedIn', url: 'https://linkedin.com/company/sehatify' },
    { icon: Youtube, name: 'YouTube', url: 'https://youtube.com/sehatify' }
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text mb-4">Contact Us</h1>
          <p className="text-lg text-text-light max-w-3xl mx-auto">
            We're here to help! Reach out to us for any questions, support, or feedback. 
            Our dedicated team is ready to assist you with your healthcare needs.
          </p>
        </div>

        {/* Emergency Alert */}
        <Card className="mb-8 border-l-4 border-red-500 bg-red-50">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-800">Medical Emergency?</h3>
              <p className="text-red-700 text-sm">
                For immediate medical emergencies, call <strong>+62 21 911 0000</strong> or visit your nearest emergency room.
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {contactInfo.map((info, index) => (
              <Card key={index}>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    <info.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text mb-2">{info.title}</h3>
                    <div className="space-y-1">
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-text-light text-sm">{detail}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Social Media */}
            <Card>
              <h3 className="font-semibold text-text mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary/10 rounded-full p-3 hover:bg-primary hover:text-white transition-colors"
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <h2 className="text-2xl font-bold text-text mb-6">Send us a Message</h2>
              
              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                    <p className="text-green-800 font-medium">
                      Thank you! Your message has been sent successfully. We'll get back to you soon.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept, index) => (
                        <option key={index} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="Brief subject of your message"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    placeholder="Please describe your inquiry in detail..."
                  />
                </div>

                <Button type="submit" size="lg" className="w-full">
                  <Send className="h-5 w-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <Card className="mt-12">
          <h2 className="text-2xl font-bold text-text mb-6">Find Us</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-lg font-semibold text-text mb-4">Our Location</h3>
              <div className="space-y-3 text-text-light">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-text">Sehatify Healthcare Solutions</p>
                    <p>Jl. Sudirman No. 123, SCBD</p>
                    <p>Jakarta Selatan 12190, Indonesia</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <p>+62 21 1234 5678</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <p>info@sehatify.com</p>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="font-semibold text-text mb-2">Public Transportation</h4>
                <ul className="text-text-light text-sm space-y-1">
                  <li>• MRT: Bundaran HI Station (5 min walk)</li>
                  <li>• TransJakarta: Dukuh Atas BNI Stop</li>
                  <li>• Parking: Available on-site</li>
                </ul>
              </div>
            </div>
            <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center">
              <div className="text-center text-text-light">
                <MapPin className="h-12 w-12 mx-auto mb-2" />
                <p>Interactive Map</p>
                <p className="text-sm">Google Maps integration would be here</p>
              </div>
            </div>
          </div>
        </Card>

        {/* FAQ Section */}
        <Card className="mt-12">
          <h2 className="text-2xl font-bold text-text mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-text mb-2">How quickly will I receive a response?</h3>
              <p className="text-text-light text-sm">
                We typically respond to general inquiries within 24 hours. Urgent medical questions are prioritized and answered within 2-4 hours.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-text mb-2">Can I schedule appointments through this form?</h3>
              <p className="text-text-light text-sm">
                For appointment scheduling, please use our dedicated booking system or call our appointment line at +62 21 1234 5679.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-text mb-2">Is my personal information secure?</h3>
              <p className="text-text-light text-sm">
                Yes, all communications are encrypted and we follow strict HIPAA compliance standards to protect your privacy.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-text mb-2">Do you offer support in multiple languages?</h3>
              <p className="text-text-light text-sm">
                We provide support in Indonesian, English, and Mandarin. Please specify your preferred language in your message.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Contact;