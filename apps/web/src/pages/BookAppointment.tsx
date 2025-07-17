// apps/web/src/pages/BookAppointment.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  Calendar, Clock, User, MapPin, CheckCircle, ArrowLeft, Loader2, createLucideIcon
} from 'lucide-react'; // Impor createLucideIcon

// Data SVG untuk BriefcaseMedical (diambil dari dokumentasi Lucide Icons)
// Anda bisa mencari SVG path untuk ikon lain di https://lucide.dev/icons/
const BriefcaseMedical = createLucideIcon(
  "BriefcaseMedical",
  [
    ["path", { d: "M18 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2", key: "1b08c6" }],
    ["path", { d: "M6 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "1f33f0" }],
    ["path", { d: "M10 2H8a2 2 0 0 0-2 2v2", key: "v0x0s9" }],
    // Perbaikan di sini: Ubah rx dan ry dari number menjadi string
    ["rect", { width: "18", height: "18", x: "3", y: "6", rx: "2", ry: "2", key: "1krz3g" }],
    ["path", { d: "M12 10v6", key: "h7knsd" }],
    ["path", { d: "M15 13H9", key: "v1b371" }]
  ]
);


import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { polyclinicAPI, doctorAPI, scheduleAPI, appointmentAPI } from '../services/api'; 
import type { Hospital, Polyclinic, Doctor, Schedule, Appointment } from '../types';

const StepIndicator: React.FC<{ number: number; title: string; isActive: boolean; isCompleted: boolean; }> = ({ number, title, isActive, isCompleted }) => (
  <div className="flex flex-col items-center flex-1 transition-all duration-300">
    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${isActive || isCompleted ? 'border-blue-600' : 'border-slate-300'} ${isCompleted ? 'bg-blue-600' : 'bg-white'}`}>
      {isCompleted ? <CheckCircle className="h-6 w-6 text-white" /> : <span className={`font-bold text-lg ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>{number}</span>}
    </div>
    <span className={`mt-2 text-sm text-center ${isActive || isCompleted ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>{title}</span>
  </div>
);

const BookAppointment: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(location.state?.selectedHospital || null);
  const [selectedPolyclinic, setSelectedPolyclinic] = useState<Polyclinic | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (selectedHospital) {
      setCurrentStep(2);
    } else {
      navigate('/hospitals');
    }
  }, [selectedHospital, navigate]);

  const { data: polyclinicsData, isLoading: isLoadingPolyclinics } = useQuery({
    queryKey: ['polyclinics', selectedHospital?._id],
    queryFn: () => polyclinicAPI.getPolyclinicsByHospital(selectedHospital!._id),
    enabled: !!selectedHospital,
  });
  const availablePolyclinics = polyclinicsData?.data || [];

  const { data: doctorsData, isLoading: isLoadingDoctors } = useQuery({
    queryKey: ['doctors', selectedPolyclinic?._id],
    queryFn: () => doctorAPI.getDoctorsByPolyclinic(selectedPolyclinic!._id),
    enabled: !!selectedPolyclinic,
  });
  const availableDoctors = doctorsData?.data || [];

  const { data: schedulesData, isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['schedules', selectedDoctor?._id, selectedDate],
    queryFn: () => scheduleAPI.getAvailableSchedules(selectedDoctor!._id, selectedDate),
    enabled: !!selectedDoctor && !!selectedDate,
  });
  const availableTimeSlots = schedulesData?.data || [];

  const createAppointmentMutation = useMutation({
    mutationFn: appointmentAPI.createAppointment,
    onSuccess: (response) => {
      toast.success('Janji temu berhasil dikonfirmasi!');
      setBookedAppointment(response.data);
      setCurrentStep(5);
      queryClient.invalidateQueries({ queryKey: ['schedules', selectedDoctor?._id, selectedDate] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Gagal membuat janji temu.'),
  });

  const handleNext = () => setCurrentStep(prev => prev + 1);
  const handleBack = () => {
    if (currentStep === 2) {
      navigate('/hospitals');
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  const handleConfirmBooking = () => {
    if (!user?._id || !selectedSchedule?._id) {
      return toast.error("Silakan lengkapi semua pilihan.");
    }
    createAppointmentMutation.mutate({ patientId: user._id, scheduleId: selectedSchedule._id });
  };
  
  const canProceed = () => {
    if (currentStep === 2 && !selectedPolyclinic) return false;
    if (currentStep === 3 && !selectedDoctor) return false;
    if (currentStep === 4 && !selectedSchedule) return false;
    return true;
  };

  const steps = [
    { number: 1, title: 'Pilih RS' }, { number: 2, title: 'Pilih Poli' },
    { number: 3, title: 'Pilih Dokter' }, { number: 4, title: 'Pilih Jadwal' },
    { number: 5, title: 'Konfirmasi' }
  ];

  const renderStepContent = () => {
    switch(currentStep) {
      case 2:
        return <>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Pilih Poliklinik</h2>
          {isLoadingPolyclinics ? <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div> :
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availablePolyclinics.map(poly => (
                <button key={poly._id} onClick={() => { setSelectedPolyclinic(poly); setSelectedDoctor(null); }} className={`p-4 rounded-lg border-2 text-center transition-all ${selectedPolyclinic?._id === poly._id ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white hover:bg-slate-50 border-slate-200'}`}>
                  <BriefcaseMedical className="mx-auto mb-2" /> {poly.name}
                </button>
              ))}
            </div>
          }
        </>;
      case 3:
        return <>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Pilih Dokter</h2>
          {isLoadingDoctors ? <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div> :
            <div className="space-y-3">
              {availableDoctors.length > 0 ? availableDoctors.map(doc => (
                <div key={doc._id} onClick={() => setSelectedDoctor(doc)} className={`p-4 border-2 rounded-lg cursor-pointer flex items-center gap-4 ${selectedDoctor?._id === doc._id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <User className="h-10 w-10 p-2 bg-slate-200 text-slate-600 rounded-full"/>
                  <div><p className="font-semibold">{doc.name}</p><p className="text-sm text-slate-500">{doc.specialization}</p></div>
                </div>
              )) : <p className="text-slate-500 text-center py-8">Tidak ada dokter tersedia di poliklinik ini.</p>}
            </div>
          }
        </>;
      case 4:
        return <>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Pilih Tanggal & Waktu</h2>
          <input type="date" value={selectedDate} onChange={e => { setSelectedDate(e.target.value); setSelectedSchedule(null); }} min={new Date().toISOString().split('T')[0]} className="w-full p-2 border rounded-md mb-4"/>
          {selectedDate && (isLoadingSchedules ? <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div> :
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {availableTimeSlots.length > 0 ? availableTimeSlots.map(slot => (
                <Button key={slot._id} variant={selectedSchedule?._id === slot._id ? 'primary' : 'outline'} onClick={() => setSelectedSchedule(slot)} disabled={slot.availableSlots <= 0}>
                  {slot.startTime}
                </Button>
              )) : <p className="col-span-full text-center text-slate-500 py-4">Tidak ada jadwal tersedia.</p>}
            </div>
          )}
        </>;
      case 5:
        return (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Pemesanan Berhasil!</h2>
            <p className="text-slate-500 mb-6">Janji temu Anda telah dikonfirmasi.</p>
            <div className="p-4 bg-slate-100 rounded-lg text-left space-y-2">
              <p>No. Antrian: <span className="font-bold text-blue-600 text-xl">{bookedAppointment?.queueNumber}</span></p>
              <p>Dokter: <span className="font-semibold">{selectedDoctor?.name}</span></p>
              <p>Tanggal: <span className="font-semibold">{selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', { dateStyle: 'full' }) : ''}</span></p>
              <p>Waktu: <span className="font-semibold">{selectedSchedule?.startTime}</span></p>
            </div>
            <Button onClick={() => navigate('/dashboard')} className="mt-6">Kembali ke Dashboard</Button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Buat Janji Temu</h1>
        </div>
        {selectedHospital &&
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center space-x-4"><MapPin className="h-6 w-6 text-blue-600" />
              <div><h3 className="font-semibold text-slate-800">{selectedHospital.name}</h3><p className="text-slate-500 text-sm">{selectedHospital.address}</p></div>
            </div>
          </Card>
        }
        <div className="flex justify-between mb-8 px-4 md:px-0">
          {steps.map(step => <StepIndicator key={step.number} {...step} isActive={currentStep === step.number} isCompleted={currentStep > step.number} />)}
        </div>
        <Card>
          <div className="p-6 min-h-[20rem] relative">
            {renderStepContent()}
          </div>
          {currentStep < 5 && (
            <div className="p-4 bg-slate-50 border-t flex justify-between items-center">
              <Button variant="outline" onClick={handleBack} disabled={createAppointmentMutation.isPending}>Kembali</Button>
              {currentStep < 4 ?
                <Button onClick={handleNext} disabled={!canProceed()}>Lanjut</Button> :
                <Button onClick={handleConfirmBooking} disabled={!canProceed() || createAppointmentMutation.isPending}>
                  {createAppointmentMutation.isPending ? 'Mengkonfirmasi...' : 'Konfirmasi Booking'}
                </Button>
              }
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BookAppointment;