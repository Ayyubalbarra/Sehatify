// apps/web/src/pages/Dashboard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MessageCircle, 
  FileText, 
  Heart, 
  User, // Ini User icon untuk display, bukan model User
  Clock, 
  Activity,
  Bell,
  Loader2 // Import loader
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext'; // Impor useAuth
import { useQuery } from '@tanstack/react-query'; // Impor useQuery
import { appointmentAPI, medicalRecordAPI, patientAuthAPI, type Appointment, type MedicalRecord } from '../services/api'; // Impor API services dan tipe-tipe

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading: isLoadingAuth, refreshUser } = useAuth(); // Ambil user dari AuthContext

  // Refresh user data saat komponen dimuat atau user berubah
  React.useEffect(() => {
    if (isAuthenticated && user && !user.fullName) { // Jika nama tidak ada (mungkin user hanya email)
      refreshUser(); // Panggil refreshUser untuk mendapatkan data profil lengkap
    }
  }, [isAuthenticated, user, refreshUser]);

  // --- Deklarasi Card Statis (tetap di sini) ---
  const dashboardCards = [
    {
      icon: Calendar,
      title: 'Book Appointment',
      description: 'Schedule a visit with your preferred doctor',
      link: '/book-appointment',
      color: 'bg-blue-500'
    },
    {
      icon: MessageCircle,
      title: 'AI Health Assistant',
      description: 'Get instant health advice and symptom assessment',
      link: '/chatbot',
      color: 'bg-green-500'
    },
    {
      icon: FileText,
      title: 'Medical Records',
      description: 'View your complete medical history',
      link: '/medical-records',
      color: 'bg-purple-500'
    },
    {
      icon: Heart,
      title: 'Health Articles',
      description: 'Read expert health tips and articles',
      link: '/articles',
      color: 'bg-red-500'
    }
  ];

  // --- Fetch Data Dashboard dari Backend ---
  const patientId = user?._id; // Dapatkan ID pasien dari user yang login

  // 1. Ambil data profil pasien (untuk memastikan nama dan data lainnya up-to-date)
  const { data: profileResponse, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['patientProfile', patientId],
    queryFn: () => patientAuthAPI.getProfile(),
    enabled: isAuthenticated && !!patientId, // Hanya jalankan query jika authenticated dan patientId ada
    staleTime: 5 * 60 * 1000, // Data dianggap "stale" setelah 5 menit
  });
  const patientProfile = profileResponse?.data?.user;

  // 2. Ambil Upcoming Appointments (membutuhkan endpoint baru di backend, atau sesuaikan yang ada)
  const { data: upcomingAppointmentsResponse, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['upcomingAppointments', patientId],
    queryFn: async () => {
      // Anda perlu membuat endpoint ini di backend (misalnya di queueController)
      // Contoh endpoint di backend: GET /api/v1/queues/patient/:patientId/upcoming
      // Di queueController.ts:
      // public async getUpcomingQueuesByPatient(req: AuthRequest, res: Response, next: NextFunction) {
      //   try {
      //     const patientId = req.user?._id; // Ambil dari req.user setelah authenticateToken
      //     if (!patientId) { return res.status(401).json({ success: false, message: "Unauthorized" }); }
      //     const today = new Date();
      //     today.setHours(0,0,0,0);
      //     const upcoming = await Queue.find({ 
      //       patientId: patientId, 
      //       queueDate: { $gte: today }, 
      //       status: { $in: ["Waiting", "In Progress"] } 
      //     })
      //     .populate('doctorId', 'name specialization')
      //     .populate('polyclinicId', 'name')
      //     .sort({ queueDate: 1, appointmentTime: 1 })
      //     .lean();
      //     res.json({ success: true, data: upcoming });
      //   } catch (error) { next(error); }
      // }
      //
      // Kemudian di apps/web/src/services/api.ts, tambahkan:
      // getPatientUpcomingAppointments: async (patientId: string): Promise<ApiResponse<Appointment[]>> => {
      //   const response = await api.get<ApiResponse<Appointment[]>>(`/queues/patient/${patientId}/upcoming`);
      //   return response.data;
      // },
      
      // UNTUK SAAT INI, KITA GUNAKAN MOCK DATA JIKA API BELUM SIAP
      console.warn("API for upcoming appointments is not yet fully implemented. Using mock data.");
      return new Promise(resolve => setTimeout(() => resolve({
        success: true,
        data: [
          {
            _id: 'mock-1',
            queueId: 'Q001',
            patientId: patientId,
            doctorId: '654a9d7d0a6a3b0b5c1d2e3f', // Contoh ID Dokter
            polyclinicId: '654a9d7d0a6a3b0b5c1d2e40', // Contoh ID Poliklinik
            scheduleId: '654a9d7d0a6a3b0b5c1d2e41', // Contoh ID Schedule
            queueNumber: 15,
            queueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 hari dari sekarang
            appointmentTime: '09:00',
            status: 'Waiting',
            // Properti tambahan yang diharapkan dari populate dokter/poli di backend
            doctor: { _id: 'mock-doctor-id', name: 'Dr. Sarah Johnson', specialization: 'Cardiology' }, 
            polyclinic: { _id: 'mock-polyclinic-id', name: 'Poli Jantung' }
          },
          {
            _id: 'mock-2',
            queueId: 'Q002',
            patientId: patientId,
            doctorId: '654a9d7d0a6a3b0b5c1d2e42',
            polyclinicId: '654a9d7d0a6a3b0b5c1d2e43',
            scheduleId: '654a9d7d0a6a3b0b5c1d2e44',
            queueNumber: 7,
            queueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 hari dari sekarang
            appointmentTime: '14:30',
            status: 'Waiting',
            doctor: { _id: 'mock-doctor-id-2', name: 'Dr. John Doe', specialization: 'Pediatrics' },
            polyclinic: { _id: 'mock-polyclinic-id-2', name: 'Poli Anak' }
          }
        ]
      }), 500));
    },
    enabled: isAuthenticated && !!patientId,
  });
  const upcomingAppointments: (Appointment & { doctor?: { name: string, specialization: string }, polyclinic?: { name: string } })[] = upcomingAppointmentsResponse?.data || [];
  const nextAppointment = upcomingAppointments.sort((a, b) => new Date(a.queueDate).getTime() - new Date(b.queueDate).getTime())[0]; // Ambil yang paling dekat

  // 3. Ambil Health Records (dari visitController.ts -> getVisitsByPatient)
  const { data: healthRecordsResponse, isLoading: isLoadingHealthRecords } = useQuery({
    queryKey: ['patientHealthRecords', patientId],
    queryFn: async () => {
      // Anda perlu membuat endpoint ini di backend (apps/api/src/controllers/visitController.ts)
      // Contoh: return medicalRecordAPI.getPatientMedicalRecords(patientId as string);
      console.warn("API for patient medical records is not yet fully implemented. Using mock data.");
      return new Promise(resolve => setTimeout(() => resolve({
        success: true,
        data: [
          { id: 'rec-1', patientId: patientId, visitDate: '2024-06-10', doctorName: 'Dr. Anya Taylor', diagnosis: 'Common Cold', treatments: ['Rest', 'Fluids'], prescriptions: ['Paracetamol'] },
          { id: 'rec-2', patientId: patientId, visitDate: '2024-05-20', doctorName: 'Dr. Anya Taylor', diagnosis: 'Annual Checkup', treatments: ['Routine Exam'], prescriptions: ['Multivitamin'] },
        ]
      }), 500));
    },
    enabled: isAuthenticated && !!patientId,
  });
  const healthRecords = healthRecordsResponse?.data || [];

  // 4. Ambil Recent Activity (bisa dari latest visits, latest appointments, dll.)
  // Untuk kesederhanaan, kita bisa gabungkan dari data yang sudah ada di frontend.
  // Jika Anda ingin ini dari backend, buat endpoint khusus di sana.
  const displayRecentActivities = React.useMemo(() => {
    const activities: { type: string, message: string, time: string, icon: React.ElementType }[] = [];

    // Dari Upcoming Appointments
    upcomingAppointments.forEach(app => {
      activities.push({
        type: 'appointment',
        message: `Upcoming appointment with ${app.doctor?.name || 'Dr.'} (${app.polyclinic?.name || 'Poli'})`,
        time: `On ${new Date(app.queueDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})} at ${app.appointmentTime}`,
        icon: Calendar
      });
    });

    // Dari Health Records (Visits)
    healthRecords.forEach(rec => {
      activities.push({
        type: 'record',
        message: `New medical record from visit on ${new Date(rec.visitDate).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}`,
        time: `Visited ${rec.doctorName}`,
        icon: FileText
      });
    });

    // Anda bisa tambahkan aktivitas lain di sini (misal: dari API articles, lab results)
    // Untuk saat ini, kita akan tambahkan beberapa mock activity statis jika tidak ada real activity
    if (activities.length === 0) {
      activities.push({ type: 'article', message: 'Read our latest article: "Healthy Living Tips"', time: '1 day ago', icon: Heart });
      activities.push({ type: 'welcome', message: 'Welcome to Sehatify! Explore our features.', time: 'Just now', icon: User });
    }

    // Urutkan berdasarkan waktu (paling baru di atas) jika ada timestamp asli
    // Untuk mock, kita biarkan saja.
    return activities.slice(0, 5); // Ambil 5 aktivitas terbaru
  }, [upcomingAppointments, healthRecords]);


  // Loading state gabungan
  const overallLoading = isLoadingAuth || isLoadingProfile || isLoadingAppointments || isLoadingHealthRecords;

  // Jika belum login atau masih loading autentikasi, mungkin tampilkan loader atau redirect
  if (isLoadingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-4 text-text-light">Memuat informasi user...</p>
      </div>
    );
  }

  // Jika tidak terautentikasi dan tidak dalam proses loading
  if (!isAuthenticated && !isLoadingAuth) {
    // Ini bisa dialihkan oleh ProtectedRoute atau Anda bisa mengarahkan secara manual
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center text-center">
        <p className="text-xl text-text-light">Silakan <Link to="/login" className="text-primary hover:underline">login</Link> untuk melihat dashboard Anda.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text">Welcome back, {patientProfile?.fullName || patientProfile?.email || 'User'}!</h1>
              <p className="text-text-light mt-1">Here's what's happening with your health today</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150"
                  alt="Profile"
                  className="h-10 w-10 rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center">
              <div className="bg-primary/10 rounded-full p-3">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4">
                {overallLoading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <p className="text-2xl font-bold text-text">{upcomingAppointments.length}</p>}
                <p className="text-text-light">Upcoming Appointments</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                {overallLoading ? <Loader2 className="h-6 w-6 animate-spin text-green-600" /> : <p className="text-2xl font-bold text-text">{healthRecords.length}</p>}
                <p className="text-text-light">Health Records</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                {overallLoading ? <Loader2 className="h-6 w-6 animate-spin text-blue-600" /> : <p className="text-2xl font-bold text-text">0</p>} {/* Ini masih mock, perlu API */}
                <p className="text-text-light">Pending Results</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Dashboard Cards */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-text mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dashboardCards.map((card, index) => (
                <Link key={index} to={card.link}>
                  <Card hover className="h-full">
                    <div className="flex items-center mb-4">
                      <div className={`${card.color} rounded-full p-3 text-white`}>
                        <card.icon className="h-8 w-8" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-text mb-2">{card.title}</h3>
                    <p className="text-text-light">{card.description}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-text mb-6">Recent Activity</h2>
            <Card>
              <div className="space-y-4">
                {overallLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : displayRecentActivities.length > 0 ? (
                  displayRecentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="bg-primary/10 rounded-full p-2">
                        <activity.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-text font-medium">{activity.message}</p>
                        <p className="text-text-light text-sm">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-text-light text-center py-4">Tidak ada aktivitas terbaru.</p>
                )}
              </div>
            </Card>

            {/* Next Appointment */}
            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-text mb-4">Next Appointment</h3>
              {overallLoading ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : nextAppointment ? (
                <div className="bg-primary/5 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=100" 
                      alt={nextAppointment.doctor?.name || "Doctor"}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-text">{nextAppointment.doctor?.name || 'Dokter Tidak Dikenal'}</p>
                      <p className="text-text-light text-sm">{nextAppointment.doctor?.specialization || 'Spesialisasi Tidak Diketahui'}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-primary/10">
                    <p className="text-sm text-text-light">
                      <Clock className="inline h-4 w-4 mr-1" />
                      {new Date(nextAppointment.queueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {nextAppointment.appointmentTime}
                    </p>
                    <p className="text-sm text-text-light">
                      Queue Number: <span className="font-medium text-primary">{nextAppointment.queueNumber}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-text-light text-center py-4">Tidak ada janji temu mendatang.</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;