import React from 'react';
import { 
  Heart, 
  Users, 
  Award, 
  Target, 
  Eye, 
  Shield,
  CheckCircle,
  Star,
  Calendar,
  Globe
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

const About: React.FC = () => {
  const milestones = [
    { year: '2020', event: 'Sehatify founded with a vision to democratize healthcare access' },
    { year: '2021', event: 'Launched AI-powered health assistant and telemedicine platform' },
    { year: '2022', event: 'Partnered with 10+ major hospitals across Indonesia' },
    { year: '2023', event: 'Reached 100,000+ registered patients milestone' },
    { year: '2024', event: 'Expanded to 15+ cities with 24/7 emergency support' }
  ];

  const values = [
    {
      icon: Heart,
      title: 'Compassionate Care',
      description: 'We believe healthcare should be delivered with empathy, understanding, and genuine concern for every patient\'s wellbeing.'
    },
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'Your health data is sacred. We maintain the highest standards of privacy and security in all our operations.'
    },
    {
      icon: Users,
      title: 'Accessibility',
      description: 'Quality healthcare should be accessible to everyone, regardless of location, economic status, or background.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We continuously strive for excellence in medical care, technology innovation, and patient experience.'
    }
  ];

  const teamMembers = [
    {
      name: 'Dr. Sarah Wijaya',
      position: 'Chief Medical Officer',
      specialization: 'Internal Medicine & Digital Health',
      experience: '15+ years',
      image: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=300',
      credentials: 'MD, MPH, Board Certified Internal Medicine'
    },
    {
      name: 'Dr. Michael Chen',
      position: 'Head of Cardiology',
      specialization: 'Interventional Cardiology',
      experience: '20+ years',
      image: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=300',
      credentials: 'MD, FACC, Fellowship in Interventional Cardiology'
    },
    {
      name: 'Dr. Priya Sharma',
      position: 'Director of Emergency Medicine',
      specialization: 'Emergency & Critical Care',
      experience: '12+ years',
      image: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=300',
      credentials: 'MD, FACEP, Emergency Medicine Board Certified'
    },
    {
      name: 'Dr. James Wilson',
      position: 'Head of Pediatrics',
      specialization: 'Pediatric Medicine',
      experience: '18+ years',
      image: 'https://images.pexels.com/photos/5327647/pexels-photo-5327647.jpeg?auto=compress&cs=tinysrgb&w=300',
      credentials: 'MD, FAAP, Pediatric Board Certified'
    }
  ];

  const certifications = [
    'ISO 27001:2013 Information Security',
    'HIPAA Compliance Certified',
    'HL7 FHIR Standards Compliant',
    'SOC 2 Type II Certified',
    'Indonesian Ministry of Health Approved',
    'JCI International Standards'
  ];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-text mb-6">
            About Sehatify
          </h1>
          <p className="text-xl text-text-light max-w-4xl mx-auto leading-relaxed">
            We're on a mission to transform healthcare delivery through technology, 
            making quality medical care accessible, affordable, and convenient for everyone.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <Card className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text mb-4">Our Mission</h2>
            <p className="text-text-light leading-relaxed">
              To democratize healthcare by leveraging technology to connect patients with 
              quality medical care, breaking down barriers of distance, time, and complexity. 
              We strive to make healthcare more accessible, efficient, and patient-centered.
            </p>
          </Card>

          <Card className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-text mb-4">Our Vision</h2>
            <p className="text-text-light leading-relaxed">
              To become the leading digital healthcare platform in Southeast Asia, 
              where every individual has seamless access to comprehensive medical care, 
              health information, and wellness resources at their fingertips.
            </p>
          </Card>
        </div>

        {/* Company Story */}
        <Card className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-text mb-6">Our Story</h2>
              <div className="space-y-4 text-text-light leading-relaxed">
                <p>
                  Sehatify was born from a simple yet powerful observation: healthcare should be 
                  as accessible as ordering food or booking a ride. Our founders, a team of 
                  healthcare professionals and technology experts, witnessed firsthand the 
                  challenges patients face in accessing quality medical care.
                </p>
                <p>
                  Long waiting times, complex appointment systems, limited access to specialists, 
                  and fragmented medical records were just some of the pain points that inspired 
                  us to create a better solution.
                </p>
                <p>
                  Today, Sehatify serves as a bridge between patients and healthcare providers, 
                  offering a comprehensive platform that includes appointment booking, 
                  telemedicine consultations, AI-powered health assistance, and digital 
                  medical records management.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Healthcare team collaboration"
                className="rounded-2xl shadow-xl w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </Card>

        {/* Milestones */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-text text-center mb-12">Our Journey</h2>
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <Card key={index} className="flex items-center space-x-6">
                <div className="bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg">
                  {milestone.year}
                </div>
                <div className="flex-1">
                  <p className="text-text-light">{milestone.event}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-text text-center mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-3">{value.title}</h3>
                <p className="text-text-light text-sm leading-relaxed">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-text text-center mb-12">Meet Our Medical Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold text-text mb-1">{member.name}</h3>
                <p className="text-primary font-medium text-sm mb-2">{member.position}</p>
                <p className="text-text-light text-sm mb-2">{member.specialization}</p>
                <div className="flex items-center justify-center text-text-light text-xs mb-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  {member.experience}
                </div>
                <p className="text-text-light text-xs">{member.credentials}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Quality Assurance */}
        <Card className="mb-16">
          <h2 className="text-3xl font-bold text-text text-center mb-8">Quality Assurance & Certifications</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-text-light leading-relaxed mb-6">
                At Sehatify, quality and safety are paramount. We maintain rigorous standards 
                across all aspects of our platform, from data security to medical protocols. 
                Our commitment to excellence is reflected in our comprehensive certifications 
                and continuous quality improvement processes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-text-light text-sm">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Quality healthcare standards"
                className="rounded-2xl shadow-xl w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <Card className="text-center">
          <h2 className="text-3xl font-bold text-text mb-8">Impact by Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">150K+</div>
              <div className="text-text-light">Patients Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">300+</div>
              <div className="text-text-light">Healthcare Providers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">15+</div>
              <div className="text-text-light">Partner Hospitals</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-text-light">Platform Uptime</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default About;