import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Star, 
  ChevronRight, 
  CheckCircle,
  Download,
  QrCode,
  ArrowLeft
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { hospitals, doctors } from '../data/mockData';

interface LocationState {
  selectedHospital?: {
    id: string;
    name: string;
    address: string;
    phone: string;
    specialties: string[];
  };
}

const BookAppointment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [queueNumber, setQueueNumber] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Get hospital data from navigation state
  const locationState = location.state as LocationState;
  const preSelectedHospital = locationState?.selectedHospital;

  useEffect(() => {
    if (preSelectedHospital) {
      setSelectedHospital(preSelectedHospital.id);
      setCurrentStep(2); // Skip hospital selection if coming from hospitals page
    }
  }, [preSelectedHospital]);

  const steps = [
    { number: 1, title: 'Select Hospital', completed: currentStep > 1 },
    { number: 2, title: 'Choose Department', completed: currentStep > 2 },
    { number: 3, title: 'Pick Doctor', completed: currentStep > 3 },
    { number: 4, title: 'Date & Time', completed: currentStep > 4 },
    { number: 5, title: 'Confirmation', completed: currentStep > 5 }
  ];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleConfirmBooking = () => {
    // Generate queue number
    const queue = `A-${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`;
    setQueueNumber(queue);
    setCurrentStep(5);
  };

  const selectedHospitalData = hospitals.find(h => h.id === selectedHospital) || preSelectedHospital;
  const selectedDoctorData = doctors.find(d => d.id === selectedDoctor);

  const availableDoctors = selectedDepartment 
    ? doctors.filter(doc => doc.specialization === selectedDepartment)
    : doctors;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/hospitals')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Hospitals
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text mb-2">Book Appointment</h1>
            <p className="text-text-light">Schedule your visit with our expert doctors</p>
            
            {/* Show selected hospital info if pre-selected */}
            {preSelectedHospital && (
              <Card className="mt-6 bg-primary/5 border-primary/20">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-text">{preSelectedHospital.name}</h3>
                    <p className="text-text-light text-sm">{preSelectedHospital.address}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step.completed || currentStep === step.number
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.number}</span>
                  )}
                </div>
                <span className={`ml-2 text-sm ${
                  step.completed || currentStep === step.number
                    ? 'text-primary font-medium'
                    : 'text-text-light'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          {/* Step 1: Select Hospital (Skip if pre-selected) */}
          {currentStep === 1 && !preSelectedHospital && (
            <div>
              <h2 className="text-2xl font-bold text-text mb-6">Select Hospital</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedHospital === hospital.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedHospital(hospital.id)}
                  >
                    <h3 className="font-semibold text-text mb-2">{hospital.name}</h3>
                    <p className="text-text-light text-sm mb-2">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      {hospital.address}
                    </p>
                    <p className="text-text-light text-sm">
                      <User className="inline h-4 w-4 mr-1" />
                      {hospital.phone}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleNext} 
                  disabled={!selectedHospital}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Choose Department */}
          {currentStep === 2 && selectedHospitalData && (
            <div>
              <h2 className="text-2xl font-bold text-text mb-6">Choose Department</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(selectedHospitalData.departments || selectedHospitalData.specialties || []).map((department) => (
                  <div
                    key={department}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors text-center ${
                      selectedDepartment === department
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedDepartment(department)}
                  >
                    <h3 className="font-semibold text-text">{department}</h3>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  disabled={!selectedDepartment}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Pick Doctor */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-text mb-6">Pick Doctor</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedDoctor === doctor.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedDoctor(doctor.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={doctor.photo}
                        alt={doctor.name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-text">{doctor.name}</h3>
                        <p className="text-text-light text-sm">{doctor.specialization}</p>
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-text-light ml-1">
                            {doctor.rating} • {doctor.experience} years exp.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  disabled={!selectedDoctor}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Date & Time */}
          {currentStep === 4 && selectedDoctorData && (
            <div>
              <h2 className="text-2xl font-bold text-text mb-6">Select Date & Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-text mb-4">Select Date</h3>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-text mb-4">Available Times</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedDoctorData.schedule.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-2 rounded-lg border transition-colors ${
                          selectedTime === time
                            ? 'border-primary bg-primary text-white'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button 
                  onClick={handleConfirmBooking} 
                  disabled={!selectedDate || !selectedTime}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Booking
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 5 && (
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-text mb-4">Booking Confirmed!</h2>
              <p className="text-text-light mb-8">
                Your appointment has been successfully booked. Here are your details:
              </p>

              <div className="bg-primary/5 rounded-lg p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-sm text-text-light">Hospital</p>
                    <p className="font-semibold text-text">{selectedHospitalData?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-light">Doctor</p>
                    <p className="font-semibold text-text">{selectedDoctorData?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-light">Date & Time</p>
                    <p className="font-semibold text-text">{selectedDate} at {selectedTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-light">Queue Number</p>
                    <p className="font-bold text-primary text-2xl">{queueNumber}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Details
                </Button>
                <Button variant="outline">
                  <QrCode className="h-4 w-4 mr-2" />
                  Show QR Code
                </Button>
                <Button onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BookAppointment;