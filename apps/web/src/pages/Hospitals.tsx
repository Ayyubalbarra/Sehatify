import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Star, 
  Award, 
  Users, 
  Clock, 
  Heart,
  Search,
  Filter,
  ChevronRight,
  Calendar
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  accreditation: string[];
  image: string;
  specialties: string[];
  keyServices: string[];
  bedCount: number;
  establishedYear: number;
  description: string;
}

const Hospitals: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const navigate = useNavigate();

  const hospitals: Hospital[] = [
    {
      id: '1',
      name: 'Sehatify Medical Center',
      address: '123 Healthcare Boulevard, Medical District, Jakarta 12345',
      phone: '+62 21 1234 5678',
      rating: 4.8,
      accreditation: ['JCI Accredited', 'ISO 9001:2015', 'NABH Certified'],
      image: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=800',
      specialties: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Emergency Medicine'],
      keyServices: ['24/7 Emergency Care', 'Advanced ICU', 'Robotic Surgery', 'Telemedicine', 'Health Checkups'],
      bedCount: 350,
      establishedYear: 2010,
      description: 'Premier healthcare facility with state-of-the-art technology and compassionate care.'
    },
    {
      id: '2',
      name: 'Central General Hospital',
      address: '456 Wellness Avenue, City Center, Jakarta 54321',
      phone: '+62 21 8765 4321',
      rating: 4.6,
      accreditation: ['JCI Accredited', 'Green Hospital Certification'],
      image: 'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=800',
      specialties: ['Internal Medicine', 'Pediatrics', 'Gynecology', 'Dermatology', 'Psychiatry'],
      keyServices: ['Maternity Ward', 'Pediatric ICU', 'Dialysis Center', 'Pharmacy', 'Laboratory'],
      bedCount: 280,
      establishedYear: 2005,
      description: 'Comprehensive healthcare services with a focus on family medicine and preventive care.'
    },
    {
      id: '3',
      name: 'Specialized Care Institute',
      address: '789 Medical Plaza, Healthcare Zone, Jakarta 67890',
      phone: '+62 21 5555 0123',
      rating: 4.9,
      accreditation: ['JCI Accredited', 'CAP Certified', 'HIMSS Level 7'],
      image: 'https://images.pexels.com/photos/1692693/pexels-photo-1692693.jpeg?auto=compress&cs=tinysrgb&w=800',
      specialties: ['Cardiac Surgery', 'Neurosurgery', 'Transplant Medicine', 'Radiation Oncology'],
      keyServices: ['Heart Transplant', 'Brain Surgery', 'Cancer Treatment', 'Rehabilitation', 'Research Center'],
      bedCount: 200,
      establishedYear: 2015,
      description: 'Leading specialist hospital for complex medical procedures and advanced treatments.'
    },
    {
      id: '4',
      name: 'Community Health Center',
      address: '321 Community Drive, Residential Area, Jakarta 13579',
      phone: '+62 21 9999 8888',
      rating: 4.4,
      accreditation: ['ISO 9001:2015', 'NABH Certified'],
      image: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=800',
      specialties: ['Family Medicine', 'Preventive Care', 'Vaccination', 'Health Screening'],
      keyServices: ['Walk-in Clinic', 'Health Education', 'Chronic Disease Management', 'Mental Health'],
      bedCount: 150,
      establishedYear: 2008,
      description: 'Accessible healthcare for the community with emphasis on preventive medicine.'
    }
  ];

  const allSpecialties = Array.from(new Set(hospitals.flatMap(h => h.specialties)));

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === '' || 
                            hospital.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  const handleBookAppointment = (hospital: Hospital) => {
    // Navigate to booking page with hospital data
    navigate('/book-appointment', { 
      state: { 
        selectedHospital: hospital 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text mb-4">Our Partner Hospitals</h1>
          <p className="text-lg text-text-light max-w-3xl mx-auto">
            Discover our network of accredited healthcare facilities, each committed to providing 
            exceptional medical care with state-of-the-art technology and compassionate service.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-light" />
              <input
                type="text"
                placeholder="Search hospitals by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="">All Specialties</option>
              {allSpecialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Hospitals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {filteredHospitals.map((hospital) => (
            <Card key={hospital.id} hover className="overflow-hidden">
              <div className="aspect-video rounded-lg overflow-hidden mb-6">
                <img
                  src={hospital.image}
                  alt={hospital.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-text mb-2">{hospital.name}</h3>
                    <div className="flex items-center space-x-4 text-text-light text-sm">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-medium">{hospital.rating}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{hospital.bedCount} beds</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Est. {hospital.establishedYear}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-text-light">{hospital.description}</p>

                <div className="flex items-center text-text-light">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{hospital.address}</span>
                </div>

                <div className="flex items-center text-text-light">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{hospital.phone}</span>
                </div>

                {/* Accreditations */}
                <div>
                  <h4 className="font-semibold text-text mb-2 flex items-center">
                    <Award className="h-4 w-4 mr-2 text-primary" />
                    Accreditations
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {hospital.accreditation.map((acc, index) => (
                      <span
                        key={index}
                        className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full"
                      >
                        {acc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <h4 className="font-semibold text-text mb-2 flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-primary" />
                    Medical Specialties
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {hospital.specialties.slice(0, 4).map((specialty, index) => (
                      <span
                        key={index}
                        className="bg-secondary/50 text-text text-xs px-3 py-1 rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                    {hospital.specialties.length > 4 && (
                      <span className="text-primary text-xs px-3 py-1">
                        +{hospital.specialties.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Key Services */}
                <div>
                  <h4 className="font-semibold text-text mb-2">Key Services</h4>
                  <ul className="space-y-1">
                    {hospital.keyServices.slice(0, 3).map((service, index) => (
                      <li key={index} className="flex items-center text-text-light text-sm">
                        <ChevronRight className="h-3 w-3 mr-2 text-primary" />
                        {service}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    className="w-full"
                    onClick={() => handleBookAppointment(hospital)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Statistics Section */}
        <Card className="text-center">
          <h2 className="text-3xl font-bold text-text mb-8">Our Network at a Glance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">15+</div>
              <div className="text-text-light">Partner Hospitals</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">200+</div>
              <div className="text-text-light">Specialist Doctors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-text-light">Patients Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-text-light">Emergency Care</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Hospitals;