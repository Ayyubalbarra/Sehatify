// apps/web/src/pages/BookAppointment.tsx

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
  ArrowLeft,
  Loader2 // Tambahkan icon loader
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Impor react-query
import { polyclinicAPI, doctorAPI, appointmentAPI, type Polyclinic, type Doctor, type Schedule, type Appointment } from '../services/api'; // Impor API services dan tipe-tipe baru

// Hapus import hospitals dan doctors dari mockData
// import { hospitals, doctors } from '../data/mockData'; 

// Sesuaikan interface LocationState agar sesuai dengan data hospital mock
interface LocationState {
  selectedHospital?: {
    id: string;
    name: string;
    address: string;
    phone: string;
    specialties: string[]; // Ini akan menjadi departments/polyclinics
  };
}

const BookAppointment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedHospitalId, setSelectedHospitalId] = useState(''); // Akan menyimpan ID Hospital (dari mock)
  const [selectedHospitalName, setSelectedHospitalName] = useState(''); // Nama hospital
  const [selectedHospitalAddress, setSelectedHospitalAddress] = useState(''); // Alamat hospital
  
  const [selectedPolyclinicId, setSelectedPolyclinicId] = useState(''); // ID Poliklinik dari backend
  const [selectedPolyclinicName, setSelectedPolyclinicName] = useState(''); // Nama Poliklinik
  
  const [selectedDoctorId, setSelectedDoctorId] = useState(''); // ID Dokter dari backend
  const [selectedDoctorData, setSelectedDoctorData] = useState<Doctor | null>(null); // Data dokter lengkap
  
  const [selectedDate, setSelectedDate] = useState(''); // Tanggal YYYY-MM-DD
  const [selectedScheduleId, setSelectedScheduleId] = useState(''); // ID jadwal dari backend
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(''); // Waktu yang dipilih (misal: "09:00")
  
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null); // Data appointment yang berhasil

  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Ambil data hospital dari navigation state (masih dari mock data Hospitals.tsx)
  const locationState = location.state as LocationState;
  const preSelectedHospital = locationState?.selectedHospital;

  useEffect(() => {
    if (preSelectedHospital) {
      setSelectedHospitalId(preSelectedHospital.id);
      setSelectedHospitalName(preSelectedHospital.name);
      setSelectedHospitalAddress(preSelectedHospital.address);
      setCurrentStep(2); // Skip hospital selection if coming from hospitals page
    }
  }, [preSelectedHospital]);

  // --- FETCH DATA DARI BACKEND MENGGUNAKAN REACT-QUERY ---

  // Query untuk mendapatkan semua Poliklinik (Departemen)
  const { data: polyclinicsResponse, isLoading: isLoadingPolyclinics } = useQuery({
    queryKey: ['polyclinics'],
    queryFn: () => polyclinicAPI.getAllPolyclinics(),
    staleTime: 5 * 60 * 1000, // Data dianggap "stale" setelah 5 menit
  });
  const availablePolyclinics = polyclinicsResponse?.data || [];

  // Query untuk mendapatkan Dokter berdasarkan Poliklinik yang dipilih
  const { data: doctorsResponse, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['doctors', selectedPolyclinicId],
    queryFn: () => {
      const polyclinic = availablePolyclinics.find(p => p._id === selectedPolyclinicId);
      // Di backend Anda, doctor.specialization seharusnya merujuk ke nama poli,
      // atau ada field khusus untuk polyclinicId di model User (doctor)
      // Untuk saat ini, asumsikan specialization sama dengan polyclinic name
      if (polyclinic) {
        return doctorAPI.getDoctorsBySpecialization(polyclinic.name); 
      }
      return Promise.resolve({ success: true, data: [] }); // Jika tidak ada poli, kembalikan array kosong
    },
    enabled: !!selectedPolyclinicId, // Hanya jalankan query jika polyclinicId terpilih
    staleTime: 5 * 60 * 1000,
  });
  const availableDoctors = doctorsResponse?.data || [];

  // Query untuk mendapatkan Jadwal Dokter yang tersedia
  const { data: schedulesResponse, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['doctorSchedules', selectedDoctorId, selectedDate, selectedPolyclinicId],
    queryFn: () => doctorAPI.getDoctorSchedules(selectedDoctorId, selectedDate, selectedPolyclinicId),
    enabled: !!selectedDoctorId && !!selectedDate && !!selectedPolyclinicId, // Hanya jalankan query jika semua param ada
    staleTime: 0, // Jadwal mungkin berubah cepat, jadi tidak perlu stale time lama
  });
  const availableTimeSlots = schedulesResponse?.data || [];

  // Mutasi untuk membuat Janji Temu (Queue)
  const createAppointmentMutation = useMutation({
    mutationFn: (appointmentData: Parameters<typeof appointmentAPI.createAppointment>[0]) => 
      appointmentAPI.createAppointment(appointmentData),
    onSuccess: (response) => {
      setBookedAppointment(response.data || null);
      setQueueNumber(response.data?.queueNumber?.toString() || 'N/A'); // Asumsi response.data.queueNumber ada
      setCurrentStep(5);
      toast.success('Janji temu berhasil dikonfirmasi!');
      // Mungkin invalidate query untuk jadwal dokter agar slot berkurang
      queryClient.invalidateQueries({ queryKey: ['doctorSchedules', selectedDoctorId, selectedDate, selectedPolyclinicId] });
      // Invalidate queries yang terkait dengan antrean atau dashboard admin jika perlu
      queryClient.invalidateQueries({ queryKey: ['queues'] }); 
      queryClient.invalidateQueries({ queryKey: ['patientAppointments'] }); 
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Gagal membuat janji temu.';
      toast.error(message);
      console.error("Error creating appointment:", error);
    },
  });

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
      // Reset state jika kembali ke langkah sebelumnya
      if (currentStep === 4) setSelectedDoctorId('');
      if (currentStep === 3) setSelectedPolyclinicId('');
      // Jika kembali ke step 1 (pilih rumah sakit), reset juga yang terkait
      if (currentStep === 2 && !preSelectedHospital) {
        setSelectedHospitalId('');
        setSelectedHospitalName('');
        setSelectedHospitalAddress('');
      }
    } else {
      // Jika di step 1 dan tidak ada preSelectedHospital, kembali ke halaman Hospitals
      navigate('/hospitals');
    }
  };

  const handleConfirmBooking = async () => {
    // Ambil patientId dari localStorage (dari login pasien)
    const storedUser = localStorage.getItem('user');
    let patientId = '';
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        patientId = user._id; // Asumsi _id pasien disimpan di `user` objek
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        toast.error("Gagal mendapatkan info pasien. Silakan login kembali.");
        return;
      }
    }
    
    if (!patientId) {
      toast.error("Anda harus login untuk membuat janji temu.");
      navigate('/login'); // Arahkan ke halaman login pasien
      return;
    }

    if (!selectedScheduleId || !selectedDoctorId || !selectedPolyclinicId) {
      toast.error("Mohon lengkapi semua pilihan.");
      return;
    }

    const appointmentPayload = {
      patientId: patientId,
      scheduleId: selectedScheduleId,
      doctorId: selectedDoctorId,
      polyclinicId: selectedPolyclinicId,
      notes: "Janji temu online via web.", // Bisa ditambahkan input notes
    };

    createAppointmentMutation.mutate(appointmentPayload);
  };

  // Tampilkan loading keseluruhan
  const overallLoading = isLoadingPolyclinics || isLoadingDoctors || isLoadingSchedules || createAppointmentMutation.isPending;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBack} // Menggunakan handleBack agar bisa kembali ke Hospitals atau step sebelumnya
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 && preSelectedHospital ? "Back to Hospitals" : "Back"}
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text mb-2">Book Appointment</h1>
            <p className="text-text-light">Schedule your visit with our expert doctors</p>
            
            {selectedHospitalName && (
              <Card className="mt-6 bg-primary/5 border-primary/20">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-text">{selectedHospitalName}</h3>
                    <p className="text-text-light text-sm">{selectedHospitalAddress}</p>
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
          {overallLoading && ( // Tampilkan loader umum
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-lg">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}

          {/* Step 1: Select Hospital (Skip if pre-selected) */}
          {currentStep === 1 && !preSelectedHospital && (
            <div>
              <h2 className="text-2xl font-bold text-text mb-6">Select Hospital</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gunakan mock data hospitals dari web/mockData.ts for now */}
                {/* Jika Anda punya backend untuk hospitals, ganti ini */}
                {locationState.selectedHospital ? ( // Jika sudah ada yang terpilih dari Hospitals.tsx
                    <div
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors border-primary bg-primary/5`}
                        // Tidak ada onClick karena sudah dipilih
                    >
                        <h3 className="font-semibold text-text mb-2">{locationState.selectedHospital.name}</h3>
                        <p className="text-text-light text-sm mb-2">
                            <MapPin className="inline h-4 w-4 mr-1" />
                            {locationState.selectedHospital.address}
                        </p>
                        <p className="text-text-light text-sm">
                            <User className="inline h-4 w-4 mr-1" />
                            {locationState.selectedHospital.phone}
                        </p>
                    </div>
                ) : (
                    // Ini bagian jika user datang langsung ke /book-appointment tanpa memilih RS
                    // Anda perlu menambahkan logika untuk fetch hospitals dari backend di sini
                    // Atau arahkan user kembali ke /hospitals
                    <p className="text-text-light">Mohon kembali ke halaman Hospitals untuk memilih rumah sakit.</p>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleNext} 
                  disabled={!selectedHospitalId}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Choose Department */}
          {currentStep === 2 && selectedHospitalId && (
            <div>
              <h2 className="text-2xl font-bold text-text mb-6">Choose Department</h2>
              {isLoadingPolyclinics ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availablePolyclinics.length > 0 ? (
                    availablePolyclinics.map((polyclinic) => (
                      <div
                        key={polyclinic._id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors text-center ${
                          selectedPolyclinicId === polyclinic._id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                        onClick={() => {
                          setSelectedPolyclinicId(polyclinic._id);
                          setSelectedPolyclinicName(polyclinic.name);
                          setSelectedDoctorId(''); // Reset dokter jika departemen berubah
                          setSelectedDoctorData(null);
                          setSelectedDate('');
                          setSelectedTimeSlot('');
                          setSelectedScheduleId('');
                        }}
                      >
                        <h3 className="font-semibold text-text">{polyclinic.name}</h3>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-light col-span-full text-center">Tidak ada departemen tersedia.</p>
                  )}
                </div>
              )}
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  disabled={!selectedPolyclinicId}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Pick Doctor */}
          {currentStep === 3 && selectedPolyclinicId && (
            <div>
              <h2 className="text-2xl font-bold text-text mb-6">Pick Doctor</h2>
              {isLoadingDoctors ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {availableDoctors.length > 0 ? (
                    availableDoctors.map((doctor) => (
                      <div
                        key={doctor._id} // Menggunakan _id dari backend
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedDoctorId === doctor._id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                        onClick={() => {
                          setSelectedDoctorId(doctor._id);
                          setSelectedDoctorData(doctor);
                          setSelectedDate(''); // Reset tanggal/waktu jika dokter berubah
                          setSelectedTimeSlot('');
                          setSelectedScheduleId('');
                        }}
                      >
                        <div className="flex items-center space-x-4">
                          <img
                            src={doctor.photo || 'https://via.placeholder.com/64'} // Gunakan placeholder jika foto tidak ada
                            alt={doctor.name}
                            className="h-16 w-16 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-text">{doctor.name}</h3>
                            <p className="text-text-light text-sm">{doctor.specialization}</p>
                            <div className="flex items-center mt-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-text-light ml-1">
                                {doctor.rating || 0} • {doctor.experience || 0} years exp.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-text-light col-span-full text-center">Tidak ada dokter tersedia di departemen ini.</p>
                  )}
                </div>
              )}
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  disabled={!selectedDoctorId}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Date & Time */}
          {currentStep === 4 && selectedDoctorData && selectedPolyclinicId && (
            <div>
              <h2 className="text-2xl font-bold text-text mb-6">Select Date & Time</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-text mb-4">Select Date</h3>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTimeSlot(''); // Reset waktu jika tanggal berubah
                      setSelectedScheduleId('');
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-text mb-4">Available Times</h3>
                  {isLoadingSchedules ? (
                    <div className="flex justify-center items-center h-20">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {availableTimeSlots.length > 0 ? (
                        availableTimeSlots.map((schedule: Schedule) => (
                          <button
                            key={schedule._id}
                            onClick={() => {
                              setSelectedTimeSlot(schedule.startTime);
                              setSelectedScheduleId(schedule._id);
                            }}
                            className={`p-2 rounded-lg border transition-colors ${
                              selectedScheduleId === schedule._id
                                ? 'border-primary bg-primary text-white'
                                : 'border-gray-200 hover:border-primary/50'
                            }`}
                            disabled={schedule.availableSlots <= 0} // Nonaktifkan jika slot penuh
                          >
                            {schedule.startTime} ({schedule.availableSlots} slots)
                          </button>
                        ))
                      ) : (
                        <p className="text-text-light col-span-full text-center">
                          {selectedDate ? "Tidak ada jadwal tersedia untuk tanggal ini." : "Pilih tanggal untuk melihat jadwal."}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button 
                  onClick={handleConfirmBooking} 
                  disabled={!selectedDate || !selectedTimeSlot || createAppointmentMutation.isPending}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createAppointmentMutation.isPending ? 'Confirming...' : 'Confirm Booking'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 5 && bookedAppointment && selectedDoctorData && selectedHospitalName && selectedTimeSlot && (
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
                    <p className="font-semibold text-text">{selectedHospitalName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-light">Doctor</p>
                    <p className="font-semibold text-text">{selectedDoctorData?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-light">Date & Time</p>
                    <p className="font-semibold text-text">{new Date(bookedAppointment.queueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at {bookedAppointment.appointmentTime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-text-light">Queue Number</p>
                    <p className="font-bold text-primary text-2xl">{bookedAppointment.queueNumber}</p>
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