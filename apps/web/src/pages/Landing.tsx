import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MessageCircle, 
  FileText, 
  Heart, 
  Users, 
  Clock, 
  Award,
  ArrowRight,
  CheckCircle,
  Stethoscope,
  Shield,
  Zap,
  Star,
  Activity,
  Brain,
  Phone
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

const Landing: React.FC = () => {
  const features = [
    {
      icon: Calendar,
      title: 'Smart Appointment Booking',
      description: 'Book appointments with top doctors instantly using our intelligent scheduling system'
    },
    {
      icon: MessageCircle,
      title: 'AI Health Assistant',
      description: 'Get instant medical guidance from our advanced AI-powered health companion'
    },
    {
      icon: FileText,
      title: 'Digital Medical Records',
      description: 'Secure, accessible medical history and records management in the cloud'
    },
    {
      icon: Heart,
      title: 'Expert Health Content',
      description: 'Evidence-based health articles and wellness tips from medical professionals'
    }
  ];

  const stats = [
    { number: '150K+', label: 'Patients Served', icon: Users },
    { number: '300+', label: 'Healthcare Providers', icon: Stethoscope },
    { number: '15+', label: 'Partner Hospitals', icon: Heart },
    { number: '99.9%', label: 'Platform Uptime', icon: Shield }
  ];

  const benefits = [
    'AI-powered symptom assessment',
    '24/7 medical assistance',
    'Secure HIPAA-compliant platform',
    'Multi-language support',
    'Telemedicine consultations',
    'Prescription management'
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150',
      quote: 'Sehatify made healthcare so much easier for my family. The AI assistant is incredibly helpful!'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Cardiologist',
      image: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=150',
      quote: 'As a healthcare provider, I appreciate how Sehatify streamlines patient care and communication.'
    },
    {
      name: 'Lisa Wong',
      role: 'Working Mother',
      image: 'https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=150',
      quote: 'The convenience of booking appointments and accessing medical records online is a game-changer.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Floating Medical Icons Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-primary/5 animate-float">
          <Stethoscope className="h-24 w-24" />
        </div>
        <div className="absolute top-40 right-20 text-accent/5 animate-float" style={{ animationDelay: '1s' }}>
          <Heart className="h-20 w-20" />
        </div>
        <div className="absolute bottom-40 left-20 text-primary/5 animate-float" style={{ animationDelay: '2s' }}>
          <Activity className="h-28 w-28" />
        </div>
        <div className="absolute top-1/2 right-10 text-accent/5 animate-float" style={{ animationDelay: '3s' }}>
          <Brain className="h-16 w-16" />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-primary font-medium text-sm">AI-Powered Healthcare Platform</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="text-text">Your Health,</span>
                  <br />
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Simplified
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-text-light leading-relaxed max-w-2xl">
                  Experience the future of healthcare with our AI-powered platform. 
                  Get instant medical guidance, book appointments, and manage your health seamlessly.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/chatbot">
                  <Button size="lg" className="w-full sm:w-auto bg-medical-gradient hover:shadow-medical">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Try AI Assistant
                  </Button>
                </Link>
                <Link to="/book-appointment">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Appointment
                  </Button>
                </Link>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-white"></div>
                    ))}
                  </div>
                  <span className="text-text-light text-sm">150K+ patients trust us</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-text-light text-sm ml-1">4.9/5 rating</span>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-up">
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Healthcare professionals"
                  className="rounded-3xl shadow-2xl w-full h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/20 rounded-3xl"></div>
                
                {/* Floating AI Chat Widget */}
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-medical border border-primary/10 animate-float">
                  <div className="flex items-center space-x-3">
                    <div className="bg-medical-gradient rounded-full p-2">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-text text-sm">AI Assistant</p>
                      <p className="text-text-light text-xs">Online & Ready</p>
                    </div>
                  </div>
                </div>

                {/* Floating Stats Widget */}
                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-medical border border-primary/10 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <Activity className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-text">99.9%</p>
                      <p className="text-text-light text-xs">Uptime</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access AI Chatbot Section */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-medical-gradient text-white overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    Get Instant Health Advice
                  </h2>
                  <p className="text-white/90 text-lg leading-relaxed">
                    Our AI health assistant is available 24/7 to help you with medical questions, 
                    symptom assessment, and health guidance. Start a conversation now!
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/chatbot">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Start Chat Now
                    </Button>
                  </Link>
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10">
                    <Phone className="mr-2 h-5 w-5" />
                    Call Support
                  </Button>
                </div>

                <div className="flex items-center space-x-4 pt-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white/90 text-sm">AI Doctor Online</span>
                  </div>
                  <div className="text-white/70 text-sm">
                    Average response time: &lt; 30 seconds
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 bg-white/20 rounded-lg p-3">
                        <p className="text-white text-sm">Hello! How can I help you today?</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 justify-end">
                      <div className="flex-1 bg-white rounded-lg p-3 max-w-xs">
                        <p className="text-text text-sm">I have a headache, what should I do?</p>
                      </div>
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 bg-white/20 rounded-lg p-3">
                        <p className="text-white text-sm">I can help assess your symptoms...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium text-sm">Platform Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-text mb-6">
              Everything You Need for
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Better Health
              </span>
            </h2>
            <p className="text-xl text-text-light max-w-3xl mx-auto">
              Our comprehensive platform combines cutting-edge AI technology with human expertise 
              to deliver personalized healthcare solutions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} hover className="text-center group">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-3">{feature.title}</h3>
                <p className="text-text-light leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text mb-4">Trusted by Thousands</h2>
            <p className="text-xl text-text-light">Join our growing community of health-conscious individuals</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <div className="bg-medical-gradient rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-text mb-2">
                  {stat.number}
                </div>
                <div className="text-text-light font-medium">
                  {stat.label}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-primary font-medium text-sm">Why Choose Sehatify</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-text">
                  Advanced Healthcare
                  <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Made Simple
                  </span>
                </h2>
                
                <p className="text-xl text-text-light leading-relaxed">
                  We're revolutionizing healthcare delivery through innovative technology, 
                  making quality medical care accessible, affordable, and convenient for everyone.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="bg-primary/10 rounded-full p-1">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-text-light font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Link to="/about">
                  <Button variant="outline" size="lg">
                    Learn More About Us
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Medical consultation"
                className="rounded-3xl shadow-2xl w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 rounded-3xl"></div>
              
              {/* Floating Feature Cards */}
              <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-medical animate-float">
                <div className="flex items-center space-x-3">
                  <Shield className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-text text-sm">HIPAA Compliant</p>
                    <p className="text-text-light text-xs">Your data is secure</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-medical animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center space-x-3">
                  <Clock className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold text-text text-sm">24/7 Support</p>
                    <p className="text-text-light text-xs">Always available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text mb-4">What Our Users Say</h2>
            <p className="text-xl text-text-light">Real stories from real people who trust Sehatify</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-text-light italic mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center justify-center space-x-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <p className="font-semibold text-text">{testimonial.name}</p>
                    <p className="text-text-light text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center bg-medical-gradient text-white">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold">
                  Ready to Transform Your Healthcare Experience?
                </h2>
                <p className="text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                  Join thousands of satisfied users who have already discovered the future of healthcare. 
                  Start your journey to better health today.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/chatbot">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Try AI Assistant
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center space-x-8 pt-4 text-white/80">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Free forever plan</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Landing;